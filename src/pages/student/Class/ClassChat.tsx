import { useState, useRef, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../../stores/authStore";
import { chatService, ChatRoom, ChatMessage, ChatWebSocketManager } from "../../../api/services/chatService";
import api from "../../../api/config";

interface Lecturer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
}

export default function ClassChat() {
  const { ClassId } = useParams();
  const { classDetails } = useOutletContext<{ classDetails: any }>();
  const { user } = useAuthStore();
  
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsManagerRef = useRef<ChatWebSocketManager | null>(null);

  // Fetch course lecturers
useEffect(() => {
  const fetchLecturers = async () => {
    setLoading(true);
    setError(null);

    if (!ClassId) {
      setError("Course session ID is required.");
      setLoading(false);
      return;
    }

    try {
      // Get course session details to find assigned lecturers
      const response = await api.get<number[]>(`/api/session/${ClassId}/lecturers`);
      const lecturerIds = response.data;

      if (Array.isArray(lecturerIds) && lecturerIds.length > 0) {
        const lecturerPromises = lecturerIds?.map(async (lecturerId) => {
          try {
            const lecturerResponse = await api.get(`/api/users/lecturer/${lecturerId}`);
            return lecturerResponse.data;
          } catch (err) {
            console.error(`Error fetching lecturer ${lecturerId}:`, err);
            return null;
          }
        });

        const lecturerResults = await Promise.all(lecturerPromises);
        const validLecturers = lecturerResults.filter(
          (lecturer): lecturer is NonNullable<typeof lecturer> => lecturer !== null
        );
        setLecturers(validLecturers);
      } else {
        setLecturers([]);
      }
    } catch (error) {
      console.error("Failed to fetch lecturer IDs:", error);
      setError("Unable to load lecturers. Please try again later.");
      setLecturers([]);
    } finally {
      setLoading(false);
    }
  };

  fetchLecturers();
}, [ClassId]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (user && currentRoom) {
      const wsManager = new ChatWebSocketManager(
        parseInt(user.id.toString()),
        `${user.firstName} ${user.lastName}`,
        'STUDENT',
        currentRoom.roomId
      );

      wsManager.onConnectionChange(setIsConnected);
      wsManager.onMessage((message) => {
        if (message.type === 'SEND_MESSAGE' && message.roomId === currentRoom.roomId) {
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
  }, [user, currentRoom]);

  // Handle lecturer selection and room creation
  const handleLecturerSelect = async (lecturer: Lecturer) => {
    try {
      setSelectedLecturer(lecturer);
      setError(null);

      if (!user || !ClassId) {
        setError("Missing required information to start chat.");
        return;
      }

      // Create or get existing chat room
      const room = await chatService.createOrGetRoom({
        courseSessionId: parseInt(ClassId),
        studentId: parseInt(user.id.toString()),
        studentName: `${user.firstName} ${user.lastName}`,
        lecturerId: lecturer.id,
        lecturerName: `${lecturer.firstName} ${lecturer.lastName}`
      });

      setCurrentRoom(room);

      // Load chat history
      const history = await chatService.getChatHistory(room.roomId);
      if (Array.isArray(history)) {
        setMessages([...history].reverse()); // Use a copy before reversing
      } else {
        console.error("Chat history is not an array:", history);
        setMessages([]); // or handle differently
      }
      // setMessages(history.reverse()); // Reverse to show oldest first

      // Mark messages as read
      await chatService.markMessagesAsRead(room.roomId);

      scrollToBottom();
    } catch (err: any) {
      console.error('Error selecting lecturer:', err);
      setError("Failed to start chat. Please try again.");
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedFile) || !currentRoom || !user) return;

    try {
      setSendingMessage(true);
      setError(null);

      let messageContent = newMessage.trim();
      let messageType: 'TEXT' | 'FILE' = 'TEXT';

      // Handle file upload if present
      if (selectedFile) {
        // For now, we'll just include the file name in the message
        // In a real implementation, you'd upload the file first
        messageContent = selectedFile.name;
        messageType = 'FILE';
      }

      // Send via API
      const sentMessage = await chatService.sendMessage({
        roomId: currentRoom.roomId,
        content: messageContent,
        messageType
      });

      // Send via WebSocket for real-time delivery
      if (wsManagerRef.current && isConnected) {
        wsManagerRef.current.sendMessage({
          type: 'SEND_MESSAGE',
          roomId: currentRoom.roomId,
          content: messageContent,
          messageType
        });
      }

      // Add to local messages
      setMessages(prev => [...prev, sentMessage]);
      
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-16rem)] bg-background rounded-lg overflow-hidden border border-border">
      {/* Lecturers Sidebar */}
      <div className="w-80 border-r border-border bg-background-secondary flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="heading-4 mb-2">Course Lecturers</h3>
          <p className="body-small text-foreground-secondary">
            {classDetails?.code} - {classDetails?.name}
          </p>
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

          {lecturers.length === 0 ? (
            <div className="p-4 text-center">
              <UserCircleIcon className="h-12 w-12 text-foreground-tertiary mx-auto mb-3" />
              <p className="body-small text-foreground-secondary">
                No lecturers assigned to this course
              </p>
            </div>
          ) : (
            <div className="p-2">
              {lecturers?.map((lecturer) => (
                <button
                  key={lecturer?.id}
                  onClick={() => handleLecturerSelect(lecturer)}
                  className={`
                    w-full p-3 rounded-lg text-left transition-all duration-200 mb-2
                    ${selectedLecturer?.id === lecturer.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-background-tertiary'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                      <span className="body-small font-medium text-primary-700 dark:text-primary-300">
                        {lecturer?.firstName?.charAt(0) ?? ''}{lecturer?.lastName?.charAt(0) ?? ''}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="body-default font-medium text-foreground truncate">
                        {lecturer?.firstName} {lecturer?.lastName}
                      </p>
                      <p className="body-small text-foreground-secondary truncate">
                        {lecturer.department}
                      </p>
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
        {selectedLecturer && currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-background">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                  <span className="body-small font-medium text-primary-700 dark:text-primary-300">
                    {selectedLecturer.firstName[0]}{selectedLecturer.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="body-default font-medium text-foreground">
                    {selectedLecturer.firstName} {selectedLecturer.lastName}
                  </h3>
                  <p className="body-small text-foreground-secondary">
                    {selectedLecturer.department}
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
                    Start a conversation with {selectedLecturer.firstName}
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderId === parseInt(user?.id?.toString() || '0');
                  
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
              <h3 className="heading-4 mb-2">Select a Lecturer</h3>
              <p className="body-default text-foreground-secondary">
                Choose a lecturer from the sidebar to start a conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}