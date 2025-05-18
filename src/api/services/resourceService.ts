import axios from '../config';
import { ResourceMaterial, CreateResourceRequest } from '../../types/resource';

const RESOURCE_API = '/api/v1/resources';

export const resourceService = {
    // Upload a new resource
    uploadResource: async (file: File, request: CreateResourceRequest) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Append request data
        Object.entries(request).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(item => formData.append(key, item));
            } else {
                formData.append(key, String(value));
            }
        });

        const response = await axios.post<ResourceMaterial>(
            RESOURCE_API,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    // Create a link resource
    createLinkResource: async (request: CreateResourceRequest) => {
        const response = await axios.post<ResourceMaterial>(
            RESOURCE_API,
            request,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    },

    // Get resources for a course session
    getSessionResources: async (courseSessionId: number) => {
        const response = await axios.get<ResourceMaterial[]>(
            `${RESOURCE_API}/course-session/${courseSessionId}`
        );
        return response.data;
    },

    // Get resources by type
    getResourcesByType: async (courseSessionId: number, type: string) => {
        const response = await axios.get<ResourceMaterial[]>(
            `${RESOURCE_API}/course-session/${courseSessionId}/type/${type}`
        );
        return response.data;
    },

    // Get resources by category
    getResourcesByCategory: async (courseSessionId: number, category: string) => {
        const response = await axios.get<ResourceMaterial[]>(
            `${RESOURCE_API}/course-session/${courseSessionId}/category/${category}`
        );
        return response.data;
    },

    // Search resources
    searchResources: async (courseSessionId: number, searchTerm: string) => {
        const response = await axios.get<ResourceMaterial[]>(
            `${RESOURCE_API}/course-session/${courseSessionId}/search?searchTerm=${searchTerm}`
        );
        return response.data;
    },

    // Update resource
    updateResource: async (id: number, title: string, description: string, categories: string[]) => {
        const response = await axios.put<ResourceMaterial>(
            `${RESOURCE_API}/${id}`,
            null,
            {
                params: {
                    title,
                    description,
                    categories
                }
            }
        );
        return response.data;
    },

    // Delete resource
    deleteResource: async (id: number) => {
        await axios.delete(`${RESOURCE_API}/${id}`);
    },

    // Record download
    recordDownload: async (id: number) => {
        await axios.post(`${RESOURCE_API}/${id}/download`);
    }
}; 