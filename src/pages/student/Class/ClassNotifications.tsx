import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { 
  BellIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CalendarIcon,
  AcademicCapIcon,
  MegaphoneIcon
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../../stores/authStore";
import { notificationService, Notification } from "../../../api/services/notificationService";
import toast from "react-hot-toast";

const notificationTypeConfig = {
  deadline: {
    icon: CalendarIcon,
    color: "text-warning-600",
    bgColor: "bg-warning-50 dark:bg-warning-900/20",
    borderColor: "border-warning-200 dark:border-warning-800",
    label: "Deadline"
  },
  general: {
    icon: InformationCircleIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    label: "General"
  },
  grade: {
    icon: AcademicCapIcon,
    color: "text-success-600",
    bgColor: "bg-success-50 dark:bg-success-900/20",
    borderColor: "border-success-200 dark:border-success-800",
    label: "Grade"
  },
  announcement: {
    icon: MegaphoneIcon,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    label: "Announcement"
  }
};

export default function ClassNotifications() {
  const { ClassId } = useParams();
  const { classDetails } = useOutletContext<{ classDetails: any }>();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "deadline" | "general" | "grade" | "announcement">("all");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (ClassId) {
      fetchNotifications();
    }
  }, [ClassId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!ClassId || !user?.id) {
        setError("Missing required information to load notifications.");
        return;
      }

      // Fetch notifications for this course session
      const courseNotifications = await notificationService.getNotificationsByCourseSession(parseInt(ClassId));
      setNotifications(courseNotifications);
      
      // Count unread notifications
      const unreadNotifications = courseNotifications.filter(notification => !notification.isRead);
      setUnreadCount(unreadNotifications.length);

    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      
      if (err.response?.status === 404) {
        setError("No notifications found for this course.");
      } else {
        setError("Failed to load notifications. Please try again later.");
      }
      
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) return;

    try {
      await notificationService.markNotificationAsRead(notification.id);
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch (err) {
      console.error('Error marking as read:', err);
      toast.error('Failed to mark as read');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = selectedType === "all" || notification.type === selectedType;
    const matchesSearch = 
      notification.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
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

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-foreground-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as "all" | "deadline" | "general" | "grade" | "announcement")}
            className="input min-w-[150px]"
          >
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="deadline">Deadline</option>
            <option value="grade">Grade</option>
            <option value="announcement">Announcement</option>
          </select>
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
      {filteredNotifications.length === 0 ? (
        <div className="card text-center py-12">
          <BellIcon className="h-16 w-16 text-foreground-tertiary mx-auto mb-4" />
          <h3 className="heading-4 mb-2">No Notifications</h3>
          <p className="body-default text-foreground-secondary">
            {searchQuery || selectedType !== "all"
              ? "No notifications match your current filters."
              : "You're all caught up! New notifications will appear here."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
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
                onClick={() => handleMarkAsRead(notification)}
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
                            From: {notification.lecturerName}
                          </span>
                          <span className="mx-2">•</span>
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span className="body-small">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium capitalize
                          ${config.bgColor} ${config.color}
                        `}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification);
                      }}
                      className="btn btn-ghost text-xs px-3 py-1 ml-4"
                      title="Mark as read"
                    >
                      <EyeIcon className="h-4 w-4" />
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