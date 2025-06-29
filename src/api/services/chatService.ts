import api from '../config';

export interface ChatRoom {
  roomId: string;
  courseSessionId: number;
  studentId: number;
  studentName: string;
  lecturerId: number;
  lecturerName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: number;
  senderName: string;
  senderRole: 'STUDENT' | 'LECTURER';
  content: string;
  messageType: 'TEXT' | 'FILE';
  timestamp: string;
  isRead: boolean;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export interface CreateRoomRequest {
  courseSessionId: number;
  studentId: number;
  studentName: string;
  lecturerId: number;
  lecturerName: string;
}

export interface SendMessageRequest {
  roomId: string;
  content: string;
  messageType: 'TEXT' | 'FILE';
}

export const chatService = {
  // Create or get existing chat room
  createOrGetRoom: async (data: CreateRoomRequest): Promise<ChatRoom> => {
    const response = await api.post('/api/com/chat/rooms', null, {
      params: data
    });
    return response.data;
  },

  // Get user's chat rooms
  getUserRooms: async (): Promise<ChatRoom[]> => {
    const response = await api.get('/api/com/chat/rooms');
    return response.data;
  },

  // Send message
  sendMessage: async (data: SendMessageRequest): Promise<ChatMessage> => {
    const response = await api.post('/api/com/chat/messages', data);
    return response.data;
  },

  // Get chat history
  getChatHistory: async (roomId: string, page: number = 0, size: number = 20): Promise<ChatMessage[]> => {
    const response = await api.get(`/api/com/chat/rooms/${roomId}/messages`, {
      params: { page, size }
    });
    // return response.data;
    const data = response.data;

  // Defensive check
  if (data && Array.isArray(data.content)) {
    return data.content;
  }

  console.error("Unexpected response for chat history:", data);
  return []; // fallback
  },

  // Mark messages as read
  markMessagesAsRead: async (roomId: string): Promise<void> => {
    await api.post(`/api/com/chat/rooms/${roomId}/mark-read`);
  },

  // Get unread message count
  getUnreadCount: async (roomId: string): Promise<number> => {
    const response = await api.get(`/api/com/chat/rooms/${roomId}/unread-count`);
    return response.data;
  }
};

// WebSocket connection manager
export class ChatWebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: ((message: any) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];

  constructor(
    private userId: number,
    private userName: string,
    private userRole: 'STUDENT' | 'LECTURER',
    private roomId?: string
  ) {}

  connect(): void {
    try {
      const wsUrl = `ws://localhost:8765/ws/chat?userId=${this.userId}&userName=${encodeURIComponent(this.userName)}&userRole=${this.userRole}${this.roomId ? `&roomId=${this.roomId}` : ''}`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifyConnectionHandlers(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.notifyMessageHandlers(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.notifyConnectionHandlers(false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  onMessage(handler: (message: any) => void): void {
    this.messageHandlers.push(handler);
  }

  onConnectionChange(handler: (connected: boolean) => void): void {
    this.connectionHandlers.push(handler);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private notifyMessageHandlers(message: any): void {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach(handler => handler(connected));
  }
}