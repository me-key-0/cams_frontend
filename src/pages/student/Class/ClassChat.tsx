import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  EllipsisHorizontalIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    role: "student" | "lecturer";
  };
  content: string;
  timestamp: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  role: "student" | "lecturer";
}

// Mock data - replace with actual API calls
const mockClass: { [key: string]: { name: string; lecturers: ChatUser[] } } =
  {
    "1": {
      name: "Introduction to Programming",
      lecturers: [
        {
          id: "lecturer1",
          name: "Dr. Sarah Wilson",
          avatar: "https://ui-avatars.com/api/?name=Sarah+Wilson",
          isOnline: true,
          role: "lecturer",
        },
        {
          id: "lecturer2",
          name: "Prof. James Brown",
          avatar: "https://ui-avatars.com/api/?name=James+Brown",
          isOnline: false,
          lastSeen: "1 hour ago",
          role: "lecturer",
        },
      ],
    },
    "2": {
      name: "Data Structures and Algorithms",
      lecturers: [
        {
          id: "lecturer3",
          name: "Dr. Emily Chen",
          avatar: "https://ui-avatars.com/api/?name=Emily+Chen",
          isOnline: true,
          role: "lecturer",
        },
        {
          id: "lecturer4",
          name: "Prof. Michael Lee",
          avatar: "https://ui-avatars.com/api/?name=Michael+Lee",
          isOnline: true,
          role: "lecturer",
        },
      ],
    },
  };

const mockMessages: { [key: string]: { [key: string]: Message[] } } = {
  "1": {
    lecturer1: [
      {
        id: "1",
        sender: {
          id: "lecturer1",
          name: "Dr. Sarah Wilson",
          avatar: "https://ui-avatars.com/api/?name=Sarah+Wilson",
          isOnline: true,
          role: "lecturer",
        },
        content:
          "Hi! I received your assignment submission. Would you like to discuss any specific part?",
        timestamp: "10:30 AM",
      },
      {
        id: "2",
        sender: {
          id: "current-user",
          name: "You",
          avatar: "https://ui-avatars.com/api/?name=You",
          isOnline: true,
          role: "student",
        },
        content: "Yes, I had some questions about the recursion part.",
        timestamp: "10:31 AM",
      },
    ],
    lecturer2: [
      {
        id: "1",
        sender: {
          id: "lecturer2",
          name: "Prof. James Brown",
          avatar: "https://ui-avatars.com/api/?name=James+Brown",
          isOnline: false,
          role: "lecturer",
        },
        content:
          "I've reviewed your project proposal. It looks good overall, but we should discuss the implementation timeline.",
        timestamp: "2:30 PM",
      },
    ],
  },
  "2": {
    lecturer3: [
      {
        id: "1",
        sender: {
          id: "lecturer3",
          name: "Dr. Emily Chen",
          avatar: "https://ui-avatars.com/api/?name=Emily+Chen",
          isOnline: true,
          role: "lecturer",
        },
        content:
          "Great work on the binary tree implementation! Would you like to explore more advanced data structures?",
        timestamp: "11:30 AM",
      },
    ],
    lecturer4: [
      {
        id: "1",
        sender: {
          id: "lecturer4",
          name: "Prof. Michael Lee",
          avatar: "https://ui-avatars.com/api/?name=Michael+Lee",
          isOnline: true,
          role: "lecturer",
        },
        content:
          "I've graded your midterm exam. Would you like to review it together?",
        timestamp: "3:45 PM",
      },
    ],
  },
};

export default function ClassChat() {
  const { ClassId } = useParams();
  const [selectedLecturer, setSelectedLecturer] = useState<ChatUser | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update messages when ClassId or selectedLecturer changes
  useEffect(() => {
    if (ClassId && selectedLecturer) {
      setMessages(mockMessages[ClassId]?.[selectedLecturer.id] || []);
    } else {
      setMessages([]);
    }
  }, [ClassId, selectedLecturer]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: {
        id: "current-user",
        name: "You",
        avatar: "https://ui-avatars.com/api/?name=You",
        isOnline: true,
        role: "student",
      },
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      attachments: selectedFile
        ? [
            {
              name: selectedFile.name,
              url: URL.createObjectURL(selectedFile),
              type: selectedFile.type,
            },
          ]
        : undefined,
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(
      messages.map((msg) => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find(
            (r) => r.emoji === emoji
          );
          if (existingReaction) {
            return {
              ...msg,
              reactions: msg.reactions?.map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.count + 1,
                      users: [...r.users, "current-user"],
                    }
                  : r
              ),
            };
          }
          return {
            ...msg,
            reactions: [
              ...(msg.reactions || []),
              { emoji, count: 1, users: ["current-user"] },
            ],
          };
        }
        return msg;
      })
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Lecturers Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {mockClass[ClassId || "1"]?.name || "Class Chat"}
          </h2>
        </div>
        <div className="overflow-y-auto h-full">
          {mockClass[ClassId || "1"]?.lecturers.map((lecturer) => (
            <div
              key={lecturer.id}
              onClick={() => setSelectedLecturer(lecturer)}
              className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer ${
                selectedLecturer?.id === lecturer.id ? "bg-gray-50" : ""
              }`}
            >
              <div className="relative">
                <img
                  src={lecturer.avatar}
                  alt={lecturer.name}
                  className="w-10 h-10 rounded-full"
                />
                {lecturer.isOnline && (
                  <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {lecturer.name}
                </p>
                <p className="text-xs text-gray-500">Class Lecturer</p>
                {!lecturer.isOnline && lecturer.lastSeen && (
                  <p className="text-xs text-gray-500">{lecturer.lastSeen}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedLecturer ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 bg-white p-4">
              <div className="flex items-center">
                <img
                  src={selectedLecturer.avatar}
                  alt={selectedLecturer.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedLecturer.name}
                  </h3>
                  <p className="text-sm text-gray-500">Class Lecturer</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender.id === "current-user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender.id === "current-user"
                        ? "bg-primary-500 text-white"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <img
                        src={message.sender.avatar}
                        alt={message.sender.name}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span className="text-sm font-medium">
                        {message.sender.name}
                      </span>
                      <span className="text-xs ml-2 opacity-75">
                        {message.timestamp}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    {message.attachments && (
                      <div className="mt-2">
                        {message.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline flex items-center"
                          >
                            <PaperClipIcon className="w-4 h-4 mr-1" />
                            {attachment.name}
                          </a>
                        ))}
                      </div>
                    )}
                    {message.reactions && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.reactions.map((reaction, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              handleReaction(message.id, reaction.emoji)
                            }
                            className="text-xs bg-white bg-opacity-20 rounded-full px-2 py-1 flex items-center"
                          >
                            <span className="mr-1">{reaction.emoji}</span>
                            <span>{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 bg-white p-4">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center space-x-4"
              >
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <PaperClipIcon className="h-5 w-5" />
                </button>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FaceSmileIcon className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {selectedFile && (
                  <div className="flex items-center text-sm text-gray-500">
                    <PaperClipIcon className="h-4 w-4 mr-1" />
                    {selectedFile.name}
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="ml-2 text-gray-400 hover:text-gray-500"
                    >
                      ×
                    </button>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!newMessage.trim() && !selectedFile}
                  className="bg-primary-500 text-white rounded-full p-2 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Lecturer
              </h3>
              <p className="text-sm text-gray-500">
                Choose a lecturer to start a conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
