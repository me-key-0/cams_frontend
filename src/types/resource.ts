export enum ResourceType {
    DOCUMENT = 'DOCUMENT',
    VIDEO = 'VIDEO',
    PHOTO = 'PHOTO',
    LINK = 'LINK',
    AUDIO = 'AUDIO',
    ARCHIVE = 'ARCHIVE'
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
    fileName: string;
    originalFileName: string;
    type: ResourceType;
    fileSize: number;
    mimeType: string;
    categories: string[];
    downloadCount: number;
    uploadedAt: string;
    courseSessionId: number;
    uploadedBy: number;
    uploaderName: string;
    status: ResourceStatus;
    fileSizeFormatted: string;
    linkUrl?: string; // For LINK type resources
}

export interface CreateResourceRequest {
    title: string;
    description?: string;
    type: ResourceType;
    courseSessionId: number;
    categories: string[];
    linkUrl?: string; // For LINK type resources
}

export interface ResourceStats {
    totalResources: number;
    resourcesByType: { [key: string]: number };
    resourcesByCategory: { [key: string]: number };
    resources: ResourceMaterial[];
    totalFileSize: number;
    totalFileSizeFormatted: string;
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