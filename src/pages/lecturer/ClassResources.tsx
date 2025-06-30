import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    PlusIcon,
    FolderIcon,
    DocumentIcon,
    TrashIcon,
    PencilIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
    VideoCameraIcon,
    PhotoIcon,
    LinkIcon,
    SpeakerWaveIcon,
    ArchiveBoxIcon,
    ChartBarIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import resourceService from '../../api/services/resourceService';
import { ResourceType, ResourceMaterial, ResourceStats } from '../../types/resource';
import type { CreateResourceRequest } from '../../api/services/resourceService';
import { formatFileSize, formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../stores/authStore';

const PREDEFINED_CATEGORIES = [
    'lecture-notes',
    'assignments',
    'tutorials',
    'references',
    'past-papers',
    'external'
];

export default function LecturerClassResources() {
    const { classId } = useParams<{ classId: string }>();
    const [resources, setResources] = useState<ResourceMaterial[]>([]);
    const [stats, setStats] = useState<ResourceStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { user, lecturer } = useAuthStore();

    const [formData, setFormData] = useState<CreateResourceRequest>({
        title: '',
        description: '',
        type: ResourceType.DOCUMENT,
        courseSessionId: parseInt(classId!),
        categories: [],
        linkUrl: ''
    });

    useEffect(() => {
        if (classId) {
            loadResources();
            loadStats();
        }
    }, [classId]);

    const loadResources = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await resourceService.getResourcesByCourseSession(parseInt(classId!));
            setResources(data);
        } catch (err) {
            console.error('Failed to load resources:', err);
            setError('Failed to load resources. Please try again later.');
            toast.error('Failed to load resources');
        } finally {
            setIsLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const statsData = await resourceService.getResourcesStats(parseInt(classId!));
            setStats(statsData);
        } catch (err) {
            console.error('Failed to load stats:', err);
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
            } else if (contentType.startsWith('audio/')) {
                type = ResourceType.AUDIO;
            } else if (contentType.includes('zip') || contentType.includes('rar') || contentType.includes('tar')) {
                type = ResourceType.ARCHIVE;
            }
            
            setFormData(prev => ({
                ...prev,
                type,
                title: file.name.split('.')[0], // Set default title as filename
                linkUrl: '' // Clear linkUrl when file is selected
            }));
        }
    };

    const handleTypeChange = (newType: ResourceType) => {
        setFormData(prev => ({
            ...prev,
            type: newType
        }));
        
        // Clear file or linkUrl based on type
        if (newType === ResourceType.LINK) {
            setSelectedFile(null);
        } else {
            setFormData(prev => ({ ...prev, linkUrl: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsUploading(true);
            
            const submissionData: CreateResourceRequest = {
                ...formData,
                description: formData.description || '',
                courseSessionId: parseInt(classId!)
            };
            
            let resource: ResourceMaterial;
            
            if (formData.type === ResourceType.LINK) {
                if (!formData.linkUrl) {
                    toast.error('Please enter a valid URL for the link resource');
                    return;
                }
                resource = await resourceService.createLinkResource(submissionData);
                toast.success('Link resource created successfully');
            } else {
                if (!selectedFile) {
                    toast.error('Please select a file to upload');
                    return;
                }
                resource = await resourceService.uploadResource(selectedFile, submissionData);
                toast.success('File resource uploaded successfully');
            }
            
            setResources([...resources, resource]);
            setIsCreating(false);
            setSelectedFile(null);
            setFormData({
                title: '',
                description: '',
                type: ResourceType.DOCUMENT,
                courseSessionId: parseInt(classId!),
                categories: [],
                linkUrl: ''
            });
            
            // Reload stats
            loadStats();
        } catch (err) {
            console.error('Failed to upload resource:', err);
            setError('Failed to upload resource. Please try again later.');
            toast.error('Failed to upload resource');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = async (resource: ResourceMaterial) => {
        try {
            if (resource.type === ResourceType.LINK) {
                window.open(resource.linkUrl, '_blank');
                return;
            }

            // For file resources, use the general download endpoint
            const blob = await resourceService.downloadResource(resource.id);
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = resource.originalFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            // Record download
            await resourceService.recordDownload(resource.id);
            
            // Update download count locally
            setResources(resources.map(r => 
                r.id === resource.id 
                    ? { ...r, downloadCount: r.downloadCount + 1 }
                    : r
            ));
            
            toast.success('Download started');
        } catch (err) {
            console.error('Failed to download resource:', err);
            toast.error('Failed to download resource');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) {
            return;
        }

        try {
            await resourceService.deleteResource(id);
            toast.success('Resource deleted successfully');
            setResources(resources.filter(r => r.id !== id));
            loadStats(); // Reload stats
        } catch (err) {
            console.error('Failed to delete resource:', err);
            toast.error('Failed to delete resource');
        }
    };

    const filteredResources = resources.filter((resource: ResourceMaterial): boolean => {
        const matchesCategory = selectedCategory === 'all' || resource.categories.some(category =>
            category.toLowerCase() === selectedCategory.toLowerCase()
        );
        const matchesType = selectedType === 'all' || resource.type === selectedType;
        const matchesSearch = 
            resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            false;
        return matchesCategory && matchesType && matchesSearch;
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
            case ResourceType.AUDIO:
                return <SpeakerWaveIcon className="h-8 w-8 text-orange-500" />;
            case ResourceType.ARCHIVE:
                return <ArchiveBoxIcon className="h-8 w-8 text-gray-500" />;
            default:
                return <DocumentIcon className="h-8 w-8 text-blue-500" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="heading-3">Class Resources</h2>
                    <p className="body-default text-foreground-secondary mt-1">
                        Manage and share course materials with students
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="btn btn-primary"
                    disabled={isUploading}
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Resource
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card text-center">
                        <ChartBarIcon className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                        <div className="heading-4 text-primary-600">{stats.totalResources}</div>
                        <div className="body-small text-foreground-secondary">Total Resources</div>
                    </div>
                    <div className="card text-center">
                        <DocumentIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <div className="heading-4 text-blue-600">{stats.resourcesByType.DOCUMENT || 0}</div>
                        <div className="body-small text-foreground-secondary">Documents</div>
                    </div>
                    <div className="card text-center">
                        <VideoCameraIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <div className="heading-4 text-red-600">{stats.resourcesByType.VIDEO || 0}</div>
                        <div className="body-small text-foreground-secondary">Videos</div>
                    </div>
                    <div className="card text-center">
                        <ArchiveBoxIcon className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                        <div className="heading-4 text-gray-600">{stats.totalFileSizeFormatted}</div>
                        <div className="body-small text-foreground-secondary">Total Size</div>
                    </div>
                </div>
            )}

            {error && (
                <div className="status-error p-4 rounded-lg">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                        <p className="body-default">{error}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-foreground-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input min-w-[150px]"
                    >
                        <option value="all">All Categories</option>
                        {PREDEFINED_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                        ))}
                    </select>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="input min-w-[130px]"
                    >
                        <option value="all">All Types</option>
                        {Object.values(ResourceType).map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Create Resource Form */}
            {isCreating && (
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="heading-4">Add New Resource</h3>
                        <button
                            onClick={() => setIsCreating(false)}
                            className="text-foreground-secondary hover:text-foreground"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Resource Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => handleTypeChange(e.target.value as ResourceType)}
                                    className="input"
                                >
                                    {Object.values(ResourceType).map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="input"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={3}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Categories
                            </label>
                            <select
                                multiple
                                value={formData.categories}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    categories: Array.from(e.target.selectedOptions, option => option.value)
                                })}
                                className="input"
                                size={4}
                                required
                            >
                                {PREDEFINED_CATEGORIES.map((category) => (
                                    <option key={category} value={category}>
                                        {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-foreground-secondary mt-1">
                                Hold Ctrl/Cmd to select multiple categories
                            </p>
                        </div>

                        {formData.type === ResourceType.LINK ? (
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.linkUrl}
                                    onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                                    className="input"
                                    placeholder="https://example.com"
                                    required
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    File
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="input"
                                    accept={
                                        formData.type === ResourceType.PHOTO ? "image/*" :
                                        formData.type === ResourceType.VIDEO ? "video/*" :
                                        formData.type === ResourceType.AUDIO ? "audio/*" :
                                        formData.type === ResourceType.ARCHIVE ? ".zip,.rar,.tar,.gz,.7z" :
                                        formData.type === ResourceType.DOCUMENT ? ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" :
                                        undefined
                                    }
                                    required
                                />
                                {selectedFile && (
                                    <p className="mt-2 text-sm text-foreground-secondary">
                                        Selected file: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUploading}
                                className="btn btn-primary"
                            >
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Resources List */}
            <div className="card overflow-hidden">
                {filteredResources.length === 0 ? (
                    <div className="text-center py-12">
                        <FolderIcon className="h-16 w-16 text-foreground-tertiary mx-auto mb-4" />
                        <h3 className="heading-4 mb-2">No Resources Found</h3>
                        <p className="body-default text-foreground-secondary">
                            {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                                ? "No resources match your current filters."
                                : "Start by adding your first resource to this course."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-background-secondary">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                                        Resource
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                                        Categories
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                                        Size
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                                        Downloads
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                                        Uploaded
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-background divide-y divide-border">
                                {filteredResources.map((resource) => (
                                    <tr key={resource.id} className="hover:bg-background-secondary">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {getResourceIcon(resource.type)}
                                                <div className="ml-4">
                                                    <div className="body-default font-medium text-foreground">
                                                        {resource.title}
                                                    </div>
                                                    {resource.description && (
                                                        <div className="body-small text-foreground-secondary">
                                                            {resource.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
                                                {resource.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {resource.categories.map((category) => (
                                                    <span
                                                        key={category}
                                                        className="px-2 py-1 text-xs font-medium rounded-full bg-background-tertiary text-foreground-secondary"
                                                    >
                                                        {category.replace('-', ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap body-small text-foreground-secondary">
                                            {resource.fileSizeFormatted}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap body-small text-foreground-secondary">
                                            {resource.downloadCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap body-small text-foreground-secondary">
                                            {formatDate(resource.uploadedAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleDownload(resource)}
                                                    className="text-primary-600 hover:text-primary-700"
                                                    title="Download"
                                                >
                                                    <ArrowDownTrayIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(resource.id)}
                                                    className="text-error-600 hover:text-error-700"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}