import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { 
  BellIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../../stores/authStore";
import api from "../../../api/config";

interface Notification {
  id: string;
  subject: string;
  message: string;
  type: "deadline" | "general" | "grade" | "announcement";
  createdAt: string;
  isRead: boolean;
  courseSessionId: number;
  lecturerName: string;
}

const notificationTypeConfig = {
  deadline: {
    icon: ClockIcon,
    color: "text-warning-600",
    bgColor: "bg-warning-50 dark:bg-warning-900/20",
    borderColor: "border-warning-200 dark:border-warning-800"
  },
  general: {
    icon: InformationCircleIcon,
    color: "text-primary-600",
    bgColor: "bg-primary-50 dark:bg-primary-900/20",
    borderColor: "border-primary-200 dark:border-primary-800"
  },
  grade: {
    icon: CheckCircleIcon,
    color: "text-success-600",
    bgColor: "bg-success-50 dark:bg-success-900/20",
    borderColor: "border-success-200 dark:border-success-800"
  },
  announcement: {
    icon: BellIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800"
  }
};

export default function ClassNotifications() {
  const { ClassId } = useParams();
  const { classDetails } = useOutletContext<{ classDetails: any }>();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch notifications for the student
        const response = await api.get('/api/com/notifications/student');
        
        // Validate response data
        if (!response.data) {
          console.warn('No data received from notifications API');
          setNotifications([]);
          return;
        }

        // Ensure response.data is an array
        const notificationsData = Array.isArray(response.data) ? response.data : [];
        
        if (notificationsData.length === 0) {
          setNotifications([]);
          return;
        }

        // Filter notifications for this specific course session
        const courseNotifications = notificationsData.filter(
          (notification: any) => {
            // Handle both string and number courseSessionId
            const notificationCourseId = typeof notification.courseSessionId === 'string' 
              ? parseInt(notification.courseSessionId) 
              : notification.courseSessionId;
            const currentClassId = parseInt(ClassId!);
            
            return notificationCourseId === currentClassId;
          }
        );

        setNotifications(courseNotifications);
      } catch (err: any) {
        console.error('Error fetching notifications:', err);
        
        // More specific error handling
        if (err.response?.status === 404) {
          setError("No notifications found for this course.");
        } else if (err.response?.status === 403) {
          setError("You don't have permission to view notifications for this course.");
        } else {
          setError("Failed to load notifications. Please try again later.");
        }
        
        // Set empty array on error to prevent further issues
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    if (ClassId && user?.id) {
      fetchNotifications();
    }
  }, [ClassId, user?.id]);

  const markAsRead = async (notificationId: string) => {
    try {
      await api.post(`/api/com/notifications/${notificationId}/mark-read`);
      
      setNotifications(notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading-3 flex items-center">
            <BellIcon className="h-6 w-6 mr-2 text-primary-500" />
            Class Notifications
          </h2>
          <p className="body-default text-foreground-secondary mt-1">
            Stay updated with important announcements and deadlines
          </p>
        </div>
        <div className="text-right">
          <div className="body-small text-foreground-secondary">Unread</div>
          <div className="heading-4 text-primary-600">{unreadCount}</div>
        </div>
      </div>

      {/* Course Info */}
      <div className="card bg-background-secondary">
        <div className="flex items-center">
          <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mr-4">
            <BellIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="body-default font-medium">
              {classDetails?.code} - {classDetails?.name}
            </h3>
            <p className="body-small text-foreground-secondary">
              Instructor: {classDetails?.instructor}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="status-error p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <p className="body-default">{error}</p>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <BellIcon className="h-16 w-16 text-foreground-tertiary mx-auto mb-4" />
          <h3 className="heading-4 mb-2">No Notifications</h3>
          <p className="body-default text-foreground-secondary">
            {error ? "Unable to load notifications at this time." : "You're all caught up! New notifications will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const config = notificationTypeConfig[notification.type] || notificationTypeConfig.general;
            const IconComponent = config.icon;
            
            return (
              <div
                key={notification.id}
                className={`
                  card transition-all duration-200 cursor-pointer
                  ${!notification.isRead 
                    ? `${config.bgColor} ${config.borderColor} border-l-4` 
                    : 'hover:bg-background-secondary'
                  }
                `}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <IconComponent className={`h-5 w-5 ${config.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`body-default font-medium ${!notification.isRead ? 'text-foreground' : 'text-foreground-secondary'}`}>
                          {notification.subject}
                        </h3>
                        {!notification.isRead && (
                          <span className="h-2 w-2 bg-primary-500 rounded-full flex-shrink-0 ml-2"></span>
                        )}
                      </div>
                      
                      <p className="body-default text-foreground-secondary mb-3">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-foreground-tertiary">
                          <span className="body-small">
                            From: {notification.lecturerName || 'System'}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="body-small">
                            {new Date(notification.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium capitalize
                          ${config.bgColor} ${config.color}
                        `}>
                          {notification.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="btn btn-ghost text-xs px-3 py-1 ml-4"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}