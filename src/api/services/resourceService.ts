import api from '../config';
import { ResourceType, ResourceStatus, ResourceMaterial, ResourceStats } from '../../types/resource';

export interface CreateResourceRequest {
  title: string;
  description?: string;
  type: ResourceType;
  courseSessionId: number;
  categories: string[];
  linkUrl?: string; // For LINK type resources
}

const resourceService = {
  // File upload for documents, videos, photos, audio, archive
  uploadResource: async (
    file: File,
    data: CreateResourceRequest
  ): Promise<ResourceMaterial> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('type', data.type);
    formData.append('courseSessionId', data.courseSessionId.toString());
    
    // Append categories as separate form fields
    data.categories.forEach(category => {
      formData.append('categories', category);
    });

    const response = await api.post(`/api/v1/resources`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Create link resource (no file upload)
  createLinkResource: async (data: CreateResourceRequest): Promise<ResourceMaterial> => {
    const response = await api.post(`/api/v1/resources/link`, {
      title: data.title,
      description: data.description || '',
      type: data.type,
      courseSessionId: data.courseSessionId,
      categories: data.categories,
      linkUrl: data.linkUrl
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Get single resource
  getResource: async (id: number): Promise<ResourceMaterial> => {
    const response = await api.get(`/api/v1/resources/${id}`);
    return response.data;
  },

  // Get resources by course session
  getResourcesByCourseSession: async (courseSessionId: number): Promise<ResourceMaterial[]> => {
    const response = await api.get(`/api/v1/resources/course-session/${courseSessionId}`);
    return response.data;
  },

  // Get resources statistics
  getResourcesStats: async (courseSessionId: number): Promise<ResourceStats> => {
    const response = await api.get(`/api/v1/resources/course-session/${courseSessionId}/stats`);
    return response.data;
  },

  // Get resources by type
  getResourcesByType: async (courseSessionId: number, type: ResourceType): Promise<ResourceMaterial[]> => {
    const response = await api.get(`/api/v1/resources/course-session/${courseSessionId}/type/${type}`);
    return response.data;
  },

  // Get resources by category
  getResourcesByCategory: async (courseSessionId: number, category: string): Promise<ResourceMaterial[]> => {
    const response = await api.get(`/api/v1/resources/course-session/${courseSessionId}/category/${category}`);
    return response.data;
  },

  // Search resources
  searchResources: async (courseSessionId: number, searchTerm: string): Promise<ResourceMaterial[]> => {
    const response = await api.get(`/api/v1/resources/course-session/${courseSessionId}/search`, {
      params: { searchTerm },
    });
    return response.data;
  },

  // Get my resources (lecturer only)
  getMyResources: async (): Promise<ResourceMaterial[]> => {
    const response = await api.get(`/api/v1/resources/my-resources`);
    return response.data;
  },

  // Download resource file using the general endpoint
  downloadResource: async (resourceId: number): Promise<Blob> => {
    const response = await api.get(`/api/v1/resources/download/${resourceId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Record download
  recordDownload: async (resourceId: number): Promise<void> => {
    await api.post(`/api/v1/resources/${resourceId}/download`);
  },

  // Update resource
  updateResource: async (id: number, data: Partial<CreateResourceRequest>): Promise<ResourceMaterial> => {
    const response = await api.put(`/api/v1/resources/${id}`, data);
    return response.data;
  },

  // Delete resource
  deleteResource: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/resources/${id}`);
  }
};

export default resourceService;