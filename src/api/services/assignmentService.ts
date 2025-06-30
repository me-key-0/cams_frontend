import api from '../config';

// Assignment interfaces
export interface Assignment {
  id: number;
  title: string;
  description: string;
  courseSessionId: number;
  lecturerId: number;
  lecturerName: string;
  dueDate: string;
  createdAt: string;
  maxScore: number;
  type: 'INDIVIDUAL' | 'GROUP';
  status: 'DRAFT' | 'PUBLISHED';
  attachmentIds: number[];
  attachments: Array<{
    id: number;
    title: string;
    fileName: string;
    downloadUrl: string;
  }>;
  submissionCount: number;
  isOverdue: boolean;
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  courseSessionId: number;
  dueDate: string;
  maxScore: number;
  type: 'INDIVIDUAL' | 'GROUP';
}

export interface UpdateAssignmentRequest {
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  type: 'INDIVIDUAL' | 'GROUP';
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  studentId: number;
  studentName: string;
  content: string;
  attachmentIds: number[];
  attachments: Array<{
    id: number;
    title: string;
    fileName: string;
    downloadUrl: string;
  }>;
  submittedAt: string;
  status: 'SUBMITTED' | 'GRADED';
  score?: number;
  maxScore: number;
  feedback?: string;
  isLate: boolean;
}

export interface SubmitAssignmentRequest {
  assignmentId: number;
  content?: string;
}

export interface GradeSubmissionRequest {
  score: number;
  feedback?: string;
}

export const assignmentService = {
  // Assignment Management (Lecturer)
  async createAssignment(data: CreateAssignmentRequest, files?: File[]): Promise<Assignment> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('courseSessionId', data.courseSessionId.toString());
    formData.append('dueDate', data.dueDate);
    formData.append('maxScore', data.maxScore.toString());
    formData.append('type', data.type);
    
    if (files) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    const response = await api.post('/api/grades/assignments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateAssignment(id: number, data: UpdateAssignmentRequest): Promise<Assignment> {
    const response = await api.put(`/api/grades/assignments/${id}`, data);
    return response.data;
  },

  async publishAssignment(id: number): Promise<void> {
    await api.post(`/api/grades/assignments/${id}/publish`);
  },

  async deleteAssignment(id: number): Promise<void> {
    await api.delete(`/api/grades/assignments/${id}`);
  },

  async getAssignment(id: number): Promise<Assignment> {
    const response = await api.get(`/api/grades/assignments/${id}`);
    return response.data;
  },

  async getAssignmentsByCourseSession(courseSessionId: number): Promise<Assignment[]> {
    const response = await api.get(`/api/grades/assignments/course-session/${courseSessionId}`);
    return response.data || [];
  },

  async getMyAssignments(): Promise<Assignment[]> {
    const response = await api.get('/api/grades/assignments/my-assignments');
    return response.data || [];
  },

  // Assignment Submission (Student)
  async submitAssignment(data: SubmitAssignmentRequest, files?: File[]): Promise<AssignmentSubmission> {
    const formData = new FormData();
    formData.append('assignmentId', data.assignmentId.toString());
    if (data.content) {
      formData.append('content', data.content);
    }
    
    if (files) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    const response = await api.post('/api/grades/assignments/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateSubmission(submissionId: number, data: SubmitAssignmentRequest, files?: File[]): Promise<AssignmentSubmission> {
    const formData = new FormData();
    formData.append('assignmentId', data.assignmentId.toString());
    if (data.content) {
      formData.append('content', data.content);
    }
    
    if (files) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    const response = await api.put(`/api/grades/assignments/submissions/${submissionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getMySubmissions(): Promise<AssignmentSubmission[]> {
    const response = await api.get('/api/grades/assignments/submissions/my-submissions');
    return response.data || [];
  },

  async getMySubmissionForAssignment(assignmentId: number): Promise<AssignmentSubmission | null> {
    try {
      const response = await api.get(`/api/grades/assignments/${assignmentId}/my-submission`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Grading (Lecturer)
  async getAssignmentSubmissions(assignmentId: number): Promise<AssignmentSubmission[]> {
    const response = await api.get(`/api/grades/assignments/${assignmentId}/submissions`);
    return response.data || [];
  },

  async gradeSubmission(submissionId: number, data: GradeSubmissionRequest): Promise<void> {
    await api.post(`/api/grades/assignments/submissions/${submissionId}/grade`, data);
  },

  // File download
  async downloadAttachment(downloadUrl: string, fileName: string): Promise<void> {
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      throw error;
    }
  }
};