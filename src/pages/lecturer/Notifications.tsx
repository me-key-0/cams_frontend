import { useState } from "react";
import {
  PlusIcon,
  BellIcon,
  TrashIcon,
  PencilIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "urgent";
  date: string;
  author: string;
  isPinned: boolean;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

// Mock data - replace with actual API calls
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Class Schedule Update",
    content:
      "Due to the upcoming holiday, we will have a make-up class next week. Please check the updated schedule.",
    type: "info",
    date: "2024-03-15T10:30:00",
    author: "Dr. Sarah Wilson",
    isPinned: true,
  },
  {
    id: "2",
    title: "Assignment Deadline Reminder",
    content:
      "The deadline for submitting your first programming assignment is approaching. Please ensure you submit it before the due date.",
    type: "warning",
    date: "2024-03-14T15:45:00",
    author: "Dr. Sarah Wilson",
    isPinned: false,
  },
  {
    id: "3",
    title: "Project Guidelines Available",
    content:
      "The guidelines for the final project have been uploaded. Please review them and start working on your proposals.",
    type: "success",
    date: "2024-03-13T08:20:00",
    author: "Dr. Sarah Wilson",
    isPinned: false,
    attachments: [
      {
        name: "ProjectGuidelines.pdf",
        url: "/mock-url/project-guidelines.pdf",
        type: "pdf",
      },
    ],
  },
];

const notificationTypes = [
  { id: "info", name: "Information", color: "bg-blue-100 text-blue-800" },
  { id: "warning", name: "Warning", color: "bg-yellow-100 text-yellow-800" },
  { id: "success", name: "Success", color: "bg-green-100 text-green-800" },
  { id: "urgent", name: "Urgent", color: "bg-red-100 text-red-800" },
];

export default function LecturerNotifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    content: "",
    type: "info" as const,
    isPinned: false,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle notification creation with file upload
    setIsCreating(false);
    setNewNotification({
      title: "",
      content: "",
      type: "info",
      isPinned: false,
    });
    setSelectedFiles([]);
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const togglePin = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, isPinned: !n.isPinned } : n
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          Class Notifications
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Notification
        </button>
      </div>

      {/* Search */}
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      {/* Create Notification Form */}
      {isCreating && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Create New Notification
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newNotification.title}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    title: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Content
              </label>
              <textarea
                id="content"
                rows={4}
                value={newNotification.content}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    content: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700"
              >
                Type
              </label>
              <select
                id="type"
                value={newNotification.type}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    type: e.target.value as
                      | "info"
                      | "warning"
                      | "success"
                      | "urgent",
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {notificationTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPinned"
                checked={newNotification.isPinned}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    isPinned: e.target.checked,
                  })
                }
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isPinned"
                className="ml-2 block text-sm text-gray-700"
              >
                Pin this notification
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Attachments
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Attachments
                </label>
                {selectedFiles.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    {selectedFiles.length} file(s) selected
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Create Notification
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredNotifications.map((notification) => (
            <li key={notification.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-full ${
                        notificationTypes.find(
                          (t) => t.id === notification.type
                        )?.color
                      }`}
                    >
                      <BellIcon className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        {notification.isPinned && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {notification.content}
                      </p>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {new Date(notification.date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => togglePin(notification.id)}
                      className={`text-gray-400 hover:text-yellow-500 ${
                        notification.isPinned ? "text-yellow-500" : ""
                      }`}
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        // Handle edit
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
