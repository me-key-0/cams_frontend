import { useState } from "react";
import { useParams } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: "announcement" | "deadline" | "grade";
  date: string;
  isRead: boolean;
}

// Mock data - replace with actual API calls
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Assignment Deadline Extended",
    content: "The deadline for Assignment 2 has been extended to next Friday.",
    type: "deadline",
    date: "2024-03-27",
    isRead: false,
  },
  {
    id: "2",
    title: "New Class Material Available",
    content: "Week 5 lecture notes and slides have been uploaded.",
    type: "announcement",
    date: "2024-03-26",
    isRead: true,
  },
  {
    id: "3",
    title: "Midterm Grades Posted",
    content: "Midterm exam grades are now available in the Grades section.",
    type: "grade",
    date: "2024-03-25",
    isRead: true,
  },
];

export default function ClassNotifications() {
  const { ClassId } = useParams();
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          Class Notifications
        </h2>
        <div className="flex items-center text-sm text-gray-500">
          <BellIcon className="h-5 w-5 mr-2" />
          {notifications.filter((n) => !n.isRead).length} unread
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white border rounded-lg p-4 ${
              !notification.isRead ? "border-primary-500" : "border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {notification.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {notification.content}
                </p>
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span>{notification.date}</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{notification.type}</span>
                </div>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
