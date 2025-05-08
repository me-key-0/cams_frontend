import { useState, useRef, useEffect } from "react";
import {
  PaperAirplaneIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  avatar?: string;
}

// Mock data - replace with actual API calls
const mockUsers: ChatUser[] = [
  {
    id: "1",
    name: "John Doe",
    lastMessage: "Could you clarify the assignment requirements?",
    lastMessageTime: "2024-03-15T10:30:00",
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Jane Smith",
    lastMessage: "Thank you for the feedback on my submission.",
    lastMessageTime: "2024-03-15T09:15:00",
    unreadCount: 0,
  },
  {
    id: "3",
    name: "Mike Johnson",
    lastMessage: "When is the next class?",
    lastMessageTime: "2024-03-14T16:45:00",
    unreadCount: 1,
  },
];

const mockMessages: { [key: string]: Message[] } = {
  "1": [
    {
      id: "1",
      senderId: "1",
      senderName: "John Doe",
      content: "Could you clarify the assignment requirements?",
      timestamp: "2024-03-15T10:30:00",
      isRead: false,
    },
    {
      id: "2",
      senderId: "lecturer",
      senderName: "Dr. Sarah Wilson",
      content: "Of course! What specific part would you like me to explain?",
      timestamp: "2024-03-15T10:35:00",
      isRead: true,
    },
  ],
  "2": [
    {
      id: "3",
      senderId: "2",
      senderName: "Jane Smith",
      content: "Thank you for the feedback on my submission.",
      timestamp: "2024-03-15T09:15:00",
      isRead: true,
    },
  ],
  "3": [
    {
      id: "4",
      senderId: "3",
      senderName: "Mike Johnson",
      content: "When is the next class?",
      timestamp: "2024-03-14T16:45:00",
      isRead: false,
    },
  ],
};

export default function LecturerChat() {
  const [users, setUsers] = useState<ChatUser[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedUser) {
      setMessages(mockMessages[selectedUser] || []);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUser) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: "lecturer",
        senderName: "Dr. Sarah Wilson",
        content: newMessage,
        timestamp: new Date().toISOString(),
        isRead: true,
      };

      setMessages([...messages, message]);
      setNewMessage("");

      // Update user's last message and unread count
      setUsers(
        users.map((user) =>
          user.id === selectedUser
            ? {
                ...user,
                lastMessage: newMessage,
                lastMessageTime: new Date().toISOString(),
                unreadCount: 0,
              }
            : user
        )
      );
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Users List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user.id)}
              className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 ${
                selectedUser === user.id ? "bg-gray-50" : ""
              }`}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <UserCircleIcon className="h-10 w-10 text-gray-400" />
              )}
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  {user.unreadCount > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {user.unreadCount}
                    </span>
                  )}
                </div>
                {user.lastMessage && (
                  <p className="text-sm text-gray-500 truncate">
                    {user.lastMessage}
                  </p>
                )}
                {user.lastMessageTime && (
                  <p className="text-xs text-gray-400">
                    {new Date(user.lastMessageTime).toLocaleString()}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {users.find((u) => u.id === selectedUser)?.avatar ? (
                  <img
                    src={users.find((u) => u.id === selectedUser)?.avatar}
                    alt={users.find((u) => u.id === selectedUser)?.name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {users.find((u) => u.id === selectedUser)?.name}
                  </h3>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === "lecturer"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.senderId === "lecturer"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200"
            >
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a student to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
