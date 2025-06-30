import api from '../config';

// Announcement interfaces
export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'ACADEMIC' | 'ADMINISTRATIVE';
  createdAt: string;
  createdBy: string;
  role: string;
  departmentCode: string;
  isGlobal: boolean;
  isRead?: boolean;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  category: 'ACADEMIC' | 'ADMINISTRATIVE';
}

// Support Ticket interfaces
export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  departmentCode: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
}

export interface CreateTicketRequest {
  subject: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TicketResponseRequest {
  message: string;
  newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

export const communicationService = {
  // Announcement methods
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const response = await api.get('/api/com/announcements');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },

  async getAnnouncementsByCategory(category: 'ACADEMIC' | 'ADMINISTRATIVE'): Promise<Announcement[]> {
    try {
      const response = await api.get(`/api/com/announcements/category/${category}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching announcements by category:', error);
      return [];
    }
  },

  async getUnreadAnnouncementCount(): Promise<number> {
    try {
      const response = await api.get('/api/com/announcements/unread-count');
      return response.data || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  async markAnnouncementAsRead(id: string): Promise<void> {
    try {
      await api.post(`/api/com/announcements/${id}/mark-read`);
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      throw error;
    }
  },

  async createAnnouncement(data: CreateAnnouncementRequest): Promise<Announcement> {
    try {
      const response = await api.post('/api/com/announcements', data);
      return response.data;
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
  },

  // Support Ticket methods
  async getMyTickets(): Promise<SupportTicket[]> {
    try {
      const response = await api.get('/api/com/tickets/my-tickets');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching my tickets:', error);
      return [];
    }
  },

  async getAllTickets(): Promise<SupportTicket[]> {
    try {
      const response = await api.get('/api/com/tickets/admin');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      return [];
    }
  },

  async createTicket(data: CreateTicketRequest): Promise<SupportTicket> {
    try {
      const response = await api.post('/api/com/tickets', data);
      return response.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  async respondToTicket(ticketId: string, data: TicketResponseRequest): Promise<void> {
    try {
      await api.post(`/api/com/tickets/${ticketId}/respond`, data);
    } catch (error) {
      console.error('Error responding to ticket:', error);
      throw error;
    }
  }
};