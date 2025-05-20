import axios from '../config';
import { ResourceType, ResourceStatus } from '../../types/resource';

export interface CreateResourceRequest {
  title: string;
  description?: string;
  type: ResourceType;
  courseSessionId: number;
  uploadedBy: number;
  categories: string[];
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  type: ResourceType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  courseSessionId: number;
  uploadedBy: number;
  categories: string[];
  status: ResourceStatus;
  downloadCount: number;
  uploadedAt: string;
}

const resourceService = {
  // File upload for documents, videos, photos
  uploadResource: async (
    file: File,
    data: CreateResourceRequest
  ): Promise<Resource> => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'file') {
        formData.append(key, value.toString());
      }
    });

    const response = await axios.post(`/api/v1/resources`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  incrementDownloadCount: async (resourceId: number): Promise<void> => {
    await axios.post(`/api/v1/resources/${resourceId}/increment-download`);
  },

  // Create link resource (no file upload)
  createLinkResource: async (data: CreateResourceRequest): Promise<Resource> => {
    const response = await axios.post(`/api/v1/resources`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Get single resource
  getResource: async (id: number): Promise<Resource> => {
    const response = await axios.get(`/api/v1/resources/${id}`);
    return response.data;
  },

  // Get resources by course session
  getResourcesByCourseSession: async (courseSessionId: number): Promise<Resource[]> => {
    const response = await axios.get(`/api/v1/resources/course-session/${courseSessionId}`);
    return response.data;
  },

  // Get resources by type
  getResourcesByType: async (courseSessionId: number, type: string): Promise<Resource[]> => {
    const response = await axios.get(`/api/v1/resources/course-session/${courseSessionId}/type/${type}`);
    return response.data;
  },

  // Get resources by category
  getResourcesByCategory: async (courseSessionId: number, category: string): Promise<Resource[]> => {
    const response = await axios.get(`/api/v1/resources/course-session/${courseSessionId}/category/${category}`);
    return response.data;
  },

  // Search resources
  searchResources: async (courseSessionId: number, searchTerm: string): Promise<Resource[]> => {
    const response = await axios.get(`/api/v1/resources/course-session/${courseSessionId}/search`, {
      params: { searchTerm },
    });
    return response.data;
  },

  // Update resource
  updateResource: async (id: number, data: Partial<CreateResourceRequest>): Promise<Resource> => {
    const response = await axios.put(`/api/v1/resources/${id}`, data);
    return response.data;
  },

  // Delete resource
  deleteResource: async (id: number): Promise<void> => {
    await axios.delete(`/api/v1/resources/${id}`);
  },
};

export default resourceService;
