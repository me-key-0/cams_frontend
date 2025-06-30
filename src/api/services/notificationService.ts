import api from '../config';

// Notification interfaces
export interface Notification {
  id: number;
  subject: string;
  message: string;
  type: 'deadline' | 'general' | 'grade' | 'announcement';
  courseSessionId: number;
  lecturerId: string;
  lecturerName: string;
  createdAt: string;
  active: boolean;
  isRead: boolean;
}

export interface CreateNotificationRequest {
  subject: string;
  message: string;
  type: 'deadline' | 'general' | 'grade' | 'announcement';
  courseSessionId: number;
}

export interface NotificationResponse {
  totalNotifications: number;
  unreadCount: number;
  notifications: Notification[];
}

export const notificationService = {
  // Create notification (Lecturer)
  async createNotification(data: CreateNotificationRequest): Promise<Notification> {
    try {
      const response = await api.post('/api/com/notifications', data);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Get my notifications (Lecturer)
  async getMyNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get('/api/com/notifications/my-notifications');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching lecturer notifications:', error);
      return [];
    }
  },

  // Get notifications for student
  async getStudentNotifications(): Promise<NotificationResponse> {
    try {
      const response = await api.get('/api/com/notifications/student');
      return response.data || { totalNotifications: 0, unreadCount: 0, notifications: [] };
    } catch (error) {
      console.error('Error fetching student notifications:', error);
      return { totalNotifications: 0, unreadCount: 0, notifications: [] };
    }
  },

  // Get unread notification count (Student)
  async getUnreadNotificationCount(): Promise<number> {
    try {
      const response = await api.get('/api/com/notifications/student/unread-count');
      return response.data || 0;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      return 0;
    }
  },

  // Get notifications by course session
  async getNotificationsByCourseSession(courseSessionId: number): Promise<Notification[]> {
    try {
      const response = await api.get(`/api/com/notifications/course-session/${courseSessionId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching notifications by course session:', error);
      return [];
    }
  },

  // Get notifications by type
  async getNotificationsByType(courseSessionId: number, type: string): Promise<Notification[]> {
    try {
      const response = await api.get(`/api/com/notifications/course-session/${courseSessionId}/type/${type}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching notifications by type:', error);
      return [];
    }
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: number): Promise<void> {
    try {
      await api.post(`/api/com/notifications/${notificationId}/mark-read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Delete notification (Lecturer)
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      await api.delete(`/api/com/notifications/${notificationId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};