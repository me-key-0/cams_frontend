export enum ResourceType {
    DOCUMENT = 'DOCUMENT',
    VIDEO = 'VIDEO',
    PHOTO = 'PHOTO',
    LINK = 'LINK',
    FOLDER = 'FOLDER'
}

export enum ResourceStatus {
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
    DELETED = 'DELETED'
}

export interface ResourceMaterial {
    id: number;
    title: string;
    description?: string;
    type: ResourceType;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    categories: string[];
    downloadCount: number;
    uploadedAt: string;
    courseSessionId: number;
    uploadedBy: number;
    status: ResourceStatus;
}

export interface CreateResourceRequest {
    title: string;
    description?: string;
    type: ResourceType;
    courseSessionId: number;
    uploadedBy: number;
    categories: string[];
}

export interface ResourceError {
    status: number;
    error: string;
    details: {
        message: string;
        [key: string]: string;
    };
    timestamp: string;
} 