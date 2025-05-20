import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    PlusIcon,
    FolderIcon,
    DocumentIcon,
    TrashIcon,
    PencilIcon,
    ArrowUpTrayIcon,
    XMarkIcon,
    VideoCameraIcon,
    PhotoIcon,
    LinkIcon
} from '@heroicons/react/24/outline';
import resourceService from '../../api/services/resourceService';
import { ResourceType, ResourceMaterial } from '../../types/resource';
import type { CreateResourceRequest } from '../../api/services/resourceService';
import { formatFileSize, formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../stores/authStore';


const PREDEFINED_CATEGORIES = [
    'Lecture Notes',
    'Assignments',
    'Tutorials',
    'Reference Materials',
    'Past Papers'
];

export default function LecturerClassResources() {
    const { classId } = useParams<{ classId: string }>();
    const [resources, setResources] = useState<ResourceMaterial[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const { user, lecturer } = useAuthStore();

    const [formData, setFormData] = useState<CreateResourceRequest>({
        title: '',
        description: '',
        type: ResourceType.DOCUMENT,
        courseSessionId: parseInt(classId!),
        uploadedBy: lecturer?.id || user?.id || 0,
        categories: []
    });

    useEffect(() => {
        if (user?.role === 'LECTURER' && !lecturer) {
            useAuthStore.getState().getLecturerId().then((lecturerId) => {
                if (lecturerId) {
                    setFormData(prev => ({
                        ...prev,
                        uploadedBy: lecturerId
                    }));
                }
            });
        }
    }, [user, lecturer]);

    useEffect(() => {
        loadResources();
    }, [classId]);

    const loadResources = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await resourceService.getResourcesByCourseSession(parseInt(classId!));
            setResources(data as unknown as ResourceMaterial[]);
        } catch (err) {
            console.error('Failed to load resources:', err);
            setError('Failed to load resources. Please try again later.');
            toast.error('Failed to load resources');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 25 * 1024 * 1024) {
                toast.error('File size must not exceed 25MB');
                return;
            }
            setSelectedFile(file);
            
            // Auto-detect resource type
            const contentType = file.type;
            let type: ResourceType = ResourceType.DOCUMENT;
            if (contentType.startsWith('image/')) {
                type = ResourceType.PHOTO;
            } else if (contentType.startsWith('video/')) {
                type = ResourceType.VIDEO;
            }
            
            setFormData(prev => ({
                ...prev,
                type,
                title: file.name.split('.')[0] // Set default title as filename
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsUploading(true);
            setUploadProgress(0);
            
            const submissionData = {
                ...formData,
                description: formData.description || '',
                courseSessionId: parseInt(classId!),
                uploadedBy: lecturer?.id || user?.id || 0
            } as CreateResourceRequest;
            
            if (!selectedFile && formData.type !== ResourceType.LINK) {
                toast.error('Please select a file to upload');
                return;
            }

            if (formData.type === ResourceType.LINK) {
                const resource = await resourceService.createLinkResource(formData);
                setResources([...resources, resource as ResourceMaterial]);
                toast.success('Link resource created successfully');
            } else {
                const resource = await resourceService.uploadResource(selectedFile!, formData);
                setResources([...resources, resource as ResourceMaterial]);
                toast.success('File resource uploaded successfully');
            }
            
            setIsCreating(false);
            setSelectedFile(null);
            setFormData({
                title: '',
                description: '',
                type: ResourceType.DOCUMENT,
                courseSessionId: parseInt(classId!),
                uploadedBy: user?.id || 0,
                categories: []
            });
        } catch (err) {
            console.error('Failed to upload resource:', err);
            setError('Failed to upload resource. Please try again later.');
            toast.error('Failed to upload resource');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) {
            return;
        }

        try {
            await resourceService.deleteResource(id as number);
            toast.success('Resource deleted successfully');
            setResources(resources.filter(r => r.id !== id));
        } catch (err) {
            console.error('Failed to delete resource:', err);
            toast.error('Failed to delete resource');
        }
    };

    const filteredResources = resources.filter((resource: ResourceMaterial): boolean => {
        const matchesCategory = selectedCategory === 'all' || resource.categories.some(category =>
            category.toLowerCase() === selectedCategory.toLowerCase()
        );
        const matchesSearch = 
            resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            false;
        return matchesCategory && matchesSearch;
    });

    const getResourceIcon = (type: ResourceType) => {
        switch (type) {
            case ResourceType.DOCUMENT:
                return <DocumentIcon className="h-8 w-8 text-blue-500" />;
            case ResourceType.VIDEO:
                return <VideoCameraIcon className="h-8 w-8 text-red-500" />;
            case ResourceType.PHOTO:
                return <PhotoIcon className="h-8 w-8 text-green-500" />;
            case ResourceType.LINK:
                return <LinkIcon className="h-8 w-8 text-purple-500" />;
            case ResourceType.FOLDER:
                return <FolderIcon className="h-8 w-8 text-yellow-500" />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading resources...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Class Resources</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    disabled={isUploading}
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Resource
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                    {error}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-4 pr-12 py-2 text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                    <option value="all">All Categories</option>
                    {PREDEFINED_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {isCreating && (
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Add New Resource</h3>
                        <button
                            onClick={() => setIsCreating(false)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Resource Type
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value as ResourceType})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                                {Object.values(ResourceType).map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Categories
                            </label>
                            <select
                                multiple
                                value={formData.categories}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    categories: Array.from(e.target.selectedOptions, option => option.value)
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                required
                            >
                                {PREDEFINED_CATEGORIES.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {formData.type !== ResourceType.LINK && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    File
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="mt-1 block w-full"
                                    accept={
                                        formData.type === ResourceType.PHOTO ? "image/*" :
                                        formData.type === ResourceType.VIDEO ? "video/*" :
                                        formData.type === ResourceType.DOCUMENT ? ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" :
                                        undefined
                                    }
                                />
                                {selectedFile && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        Selected file: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUploading}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                            >
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {filteredResources.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No resources found</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {filteredResources.map((resource) => (
                            <li key={resource.id} className="px-4 py-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        {getResourceIcon(resource.type)}
                                        <div className="ml-4">
                                            <h4 className="text-lg font-medium text-gray-900">
                                                {resource.title}
                                            </h4>
                                            {resource.description && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {resource.description}
                                                </p>
                                            )}
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {resource.categories.map((category) => (
                                                    <span
                                                        key={category}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {category}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                                                <span>{formatFileSize(resource.fileSize)}</span>
                                                <span>{formatDate(resource.uploadedAt)}</span>
                                                <span>{resource.downloadCount} downloads</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => window.open(resource.fileUrl, '_blank')}
                                            className="text-gray-400 hover:text-gray-500"
                                        >
                                            <ArrowUpTrayIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(resource.id)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
} 