import { useState, useEffect } from "react";
import {
  MegaphoneIcon,
  BellIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  CalendarIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { notificationService, Notification, CreateNotificationRequest } from "../../api/services/notificationService";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";
import api from "../../api/config";

interface CourseSession {
  id: number;
  courseCode: string;
  courseName: string;
}

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

export default function LecturerNotifications() {
  const { user, lecturer } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [courseSessions, setCourseSessions] = useState<CourseSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "deadline" | "general" | "grade" | "announcement">("all");
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newNotification, setNewNotification] = useState<CreateNotificationRequest>({
    subject: "",
    message: "",
    type: "general",
    courseSessionId: 0
  });

  useEffect(() => {
    fetchNotifications();
    fetchCourseSessions();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseSessions = async () => {
    try {
      if (!lecturer?.id) {
        console.warn('Lecturer ID not available');
        return;
      }

      // Get course sessions for this lecturer
      const response = await api.get(`/api/course-sessions/department/${lecturer.id}`);
      
      // Filter course sessions assigned to this lecturer
      const lecturerSessions = response.data.filter((session: any) => 
        session.lecturerIds && session.lecturerIds.includes(lecturer.id)
      );

      // Map to simpler format
      const sessions = lecturerSessions.map((session: any) => ({
        id: session.id,
        courseCode: session.course.code,
        courseName: session.course.name
      }));

      setCourseSessions(sessions);
      
      // Set default course session if available
      if (sessions.length > 0 && newNotification.courseSessionId === 0) {
        setNewNotification(prev => ({ ...prev, courseSessionId: sessions[0].id }));
      }
    } catch (err) {
      console.error('Error fetching course sessions:', err);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNotification.subject.trim() || !newNotification.message.trim() || newNotification.courseSessionId === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const createdNotification = await notificationService.createNotification(newNotification);
      setNotifications([createdNotification, ...notifications]);
      setIsCreating(false);
      setNewNotification({
        subject: "",
        message: "",
        type: "general",
        courseSessionId: courseSessions.length > 0 ? courseSessions[0].id : 0
      });
      toast.success('Notification created successfully');
    } catch (err) {
      console.error('Error creating notification:', err);
      toast.error('Failed to create notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted successfully');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
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
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            Manage Notifications
          </h2>
          <p className="body-default text-foreground-secondary mt-1">
            Create and manage notifications for your students
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Notification
        </button>
      </div>

      {/* Create Notification Form */}
      {isCreating && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="heading-4">Create New Notification</h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-foreground-secondary hover:text-foreground"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleCreateNotification} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={newNotification.subject}
                onChange={(e) => setNewNotification({ ...newNotification, subject: e.target.value })}
                className="input"
                placeholder="Enter notification subject"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type *
                </label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as "deadline" | "general" | "grade" | "announcement" })}
                  className="input"
                >
                  <option value="general">General</option>
                  <option value="deadline">Deadline</option>
                  <option value="grade">Grade</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Course *
                </label>
                <select
                  value={newNotification.courseSessionId}
                  onChange={(e) => setNewNotification({ ...newNotification, courseSessionId: parseInt(e.target.value) })}
                  className="input"
                  required
                >
                  <option value="">Select a course</option>
                  {courseSessions.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.courseCode} - {course.courseName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message *
              </label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                rows={6}
                className="input"
                placeholder="Enter notification message"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Creating...' : 'Create Notification'}
              </button>
            </div>
          </form>
        </div>
      )}

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
          <h3 className="heading-4 mb-2">No Notifications Found</h3>
          <p className="body-default text-foreground-secondary">
            {searchQuery || selectedType !== "all"
              ? "No notifications match your current filters."
              : "You haven't created any notifications yet."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const config = notificationTypeConfig[notification.type] || notificationTypeConfig.general;
            const IconComponent = config.icon;
            
            // Find course name
            const course = courseSessions.find(c => c.id === notification.courseSessionId);
            
            return (
              <div key={notification.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-lg ${config.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${config.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="heading-4 mb-2">{notification.subject}</h3>
                      <p className="body-default text-foreground-secondary mb-4">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-foreground-tertiary">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span className="body-small">
                            {formatDate(notification.createdAt)}
                          </span>
                          {course && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="body-small">{course.courseCode}</span>
                            </>
                          )}
                        </div>
                        
                        <span className={`
                          px-3 py-1 rounded-full text-sm font-medium
                          ${config.bgColor} ${config.color}
                        `}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="text-foreground-secondary hover:text-error-600 transition-colors p-2"
                    title="Delete notification"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}