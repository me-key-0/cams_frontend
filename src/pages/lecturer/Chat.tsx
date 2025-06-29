import { useState, useRef, useEffect } from "react";
import {
  PaperAirplaneIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ClockIcon,
  PaperClipIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../stores/authStore";
import { chatService, ChatRoom, ChatMessage, ChatWebSocketManager } from "../../api/services/chatService";

export default function LecturerChat() {
  const { user, lecturer } = useAuthStore();
  
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsManagerRef = useRef<ChatWebSocketManager | null>(null);

  // Fetch chat rooms
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        setError(null);

        const rooms = await chatService.getUserRooms();
        setChatRooms(rooms);
      } catch (err: any) {
        console.error('Error fetching chat rooms:', err);
        setError("Failed to load chat rooms. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user && lecturer) {
      fetchChatRooms();
    }
  }, [user, lecturer]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (user && lecturer && selectedRoom) {
      const wsManager = new ChatWebSocketManager(
        lecturer.id,
        `${lecturer.firstName} ${lecturer.lastName}`,
        'LECTURER',
        selectedRoom.roomId
      );

      wsManager.onConnectionChange(setIsConnected);
      wsManager.onMessage((message) => {
        if (message.type === 'SEND_MESSAGE' && message.roomId === selectedRoom.roomId) {
          setMessages(prev => [...prev, message.data]);
          scrollToBottom();
        }
      });

      wsManager.connect();
      wsManagerRef.current = wsManager;

      return () => {
        wsManager.disconnect();
        wsManagerRef.current = null;
      };
    }
  }, [user, lecturer, selectedRoom]);

  // Handle room selection
  const handleRoomSelect = async (room: ChatRoom) => {
    try {
      setSelectedRoom(room);
      setError(null);

      // Load chat history
      const history = await chatService.getChatHistory(room.roomId);
      setMessages(history.reverse()); // Reverse to show oldest first

      // Mark messages as read
      await chatService.markMessagesAsRead(room.roomId);

      // Update room unread count
      setChatRooms(rooms => 
        rooms.map(r => 
          r.roomId === room.roomId 
            ? { ...r, unreadCount: 0 }
            : r
        )
      );

      scrollToBottom();
    } catch (err: any) {
      console.error('Error selecting room:', err);
      setError("Failed to load chat. Please try again.");
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedFile) || !selectedRoom || !user) return;

    try {
      setSendingMessage(true);
      setError(null);

      let messageContent = newMessage.trim();
      let messageType: 'TEXT' | 'FILE' = 'TEXT';

      // Handle file upload if present
      if (selectedFile) {
        messageContent = selectedFile.name;
        messageType = 'FILE';
      }

      // Send via API
      const sentMessage = await chatService.sendMessage({
        roomId: selectedRoom.roomId,
        content: messageContent,
        messageType
      });

      // Send via WebSocket for real-time delivery
      if (wsManagerRef.current && isConnected) {
        wsManagerRef.current.sendMessage({
          type: 'SEND_MESSAGE',
          roomId: selectedRoom.roomId,
          content: messageContent,
          messageType
        });
      }

      // Add to local messages
      setMessages(prev => [...prev, sentMessage]);
      
      // Update room's last message
      setChatRooms(rooms => 
        rooms.map(room => 
          room.roomId === selectedRoom.roomId 
            ? { 
                ...room, 
                lastMessage: messageContent,
                lastMessageTime: new Date().toISOString()
              }
            : room
        )
      );
      
      // Clear form
      setNewMessage("");
      setSelectedFile(null);
      
      scrollToBottom();
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredRooms = chatRooms.filter(room =>
    room.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background rounded-lg overflow-hidden border border-border">
      {/* Chat Rooms Sidebar */}
      <div className="w-80 border-r border-border bg-background-secondary flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="heading-4 mb-3">Student Conversations</h3>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 text-sm"
            />
            <MagnifyingGlassIcon className="h-4 w-4 text-foreground-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-4">
              <div className="status-error p-3 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                  <p className="body-small">{error}</p>
                </div>
              </div>
            </div>
          )}

          {filteredRooms.length === 0 ? (
            <div className="p-4 text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-foreground-tertiary mx-auto mb-3" />
              <p className="body-small text-foreground-secondary">
                {searchQuery ? "No conversations match your search" : "No student conversations yet"}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredRooms.map((room) => (
                <button
                  key={room.roomId}
                  onClick={() => handleRoomSelect(room)}
                  className={`
                    w-full p-3 rounded-lg text-left transition-all duration-200 mb-2
                    ${selectedRoom?.roomId === room.roomId
                      ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-background-tertiary'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                      <span className="body-small font-medium text-primary-700 dark:text-primary-300">
                        {room.studentName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="body-default font-medium text-foreground truncate">
                          {room.studentName}
                        </p>
                        {room.unreadCount > 0 && (
                          <span className="bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                      {room.lastMessage && (
                        <p className="body-small text-foreground-secondary truncate">
                          {room.lastMessage}
                        </p>
                      )}
                      {room.lastMessageTime && (
                        <p className="body-small text-foreground-tertiary">
                          {formatMessageTime(room.lastMessageTime)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-success-500' : 'bg-error-500'}`}></div>
            <span className="body-small text-foreground-secondary">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-background">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                  <span className="body-small font-medium text-primary-700 dark:text-primary-300">
                    {selectedRoom.studentName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="body-default font-medium text-foreground">
                    {selectedRoom.studentName}
                  </h3>
                  <p className="body-small text-foreground-secondary">
                    Course Session ID: {selectedRoom.courseSessionId}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background-secondary">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-foreground-tertiary mx-auto mb-3" />
                  <p className="body-default text-foreground-secondary">
                    Start a conversation with {selectedRoom.studentName}
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderId === lecturer?.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[70%] rounded-lg px-4 py-3 shadow-soft
                          ${isOwnMessage
                            ? 'bg-primary-500 text-white'
                            : 'bg-background border border-border'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`body-small font-medium ${isOwnMessage ? 'text-primary-100' : 'text-foreground'}`}>
                            {message.senderName}
                          </span>
                          <span className={`body-small ${isOwnMessage ? 'text-primary-200' : 'text-foreground-tertiary'}`}>
                            {formatMessageTime(message.timestamp)}
                          </span>
                        </div>
                        
                        <p className={`body-default ${isOwnMessage ? 'text-white' : 'text-foreground'}`}>
                          {message.content}
                        </p>
                        
                        {message.messageType === 'FILE' && (
                          <div className="mt-2 flex items-center">
                            <PaperClipIcon className={`h-4 w-4 mr-1 ${isOwnMessage ? 'text-primary-200' : 'text-foreground-secondary'}`} />
                            <span className={`body-small ${isOwnMessage ? 'text-primary-200' : 'text-foreground-secondary'}`}>
                              File attachment
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-end mt-1">
                          {isOwnMessage && (
                            <CheckIcon className="h-3 w-3 text-primary-200" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-background">
              <form onSubmit={handleSendMessage} className="space-y-3">
                {selectedFile && (
                  <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                    <div className="flex items-center">
                      <PaperClipIcon className="h-4 w-4 mr-2 text-foreground-secondary" />
                      <span className="body-small text-foreground">{selectedFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-foreground-secondary hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                <div className="flex items-end space-x-3">
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="p-2 text-foreground-secondary hover:text-foreground hover:bg-background-secondary rounded-lg transition-colors"
                  >
                    <PaperClipIcon className="h-5 w-5" />
                  </button>
                  
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="input resize-none"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && !selectedFile) || sendingMessage}
                    className="btn btn-primary p-3"
                  >
                    {sendingMessage ? (
                      <ClockIcon className="h-5 w-5 animate-spin" />
                    ) : (
                      <PaperAirplaneIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background-secondary">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="h-16 w-16 text-foreground-tertiary mx-auto mb-4" />
              <h3 className="heading-4 mb-2">Select a Conversation</h3>
              <p className="body-default text-foreground-secondary">
                Choose a student conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}