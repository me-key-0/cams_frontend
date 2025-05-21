import api from './config';

interface AnnouncementResponse {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
  role: string;
  departmentCode: string;
  isGlobal: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  type: "info" | "warning" | "success";
  category: "academic" | "administrative" | "event";
}

export const announcementService = {
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const response = await api.get<AnnouncementResponse[]>('/api/com/announcements');
      return response.data.map(announcement => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        date: new Date(announcement.createdAt).toISOString().split('T')[0],
        author: announcement.createdBy,
        type: "info", // We can add logic to determine type based on content if needed
        category: announcement.isGlobal ? "event" : announcement.role === "lecturer" ? "academic" : "administrative"
      }));
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },

  async createAnnouncement(announcement: Announcement): Promise<void> {
    try {
      await api.post('/api/com/announcements', {
        title: announcement.title,
        content: announcement.content,
        departmentCode: "DEPT_CODE" // This should be dynamically set based on user's department
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  async deleteAnnouncement(id: string): Promise<void> {
    try {
      await api.delete(`/api/com/announcements/${id}`);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }
};
