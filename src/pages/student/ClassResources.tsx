import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    DocumentIcon,
    VideoCameraIcon,
    PhotoIcon,
    ArrowDownTrayIcon,
    LinkIcon,
    SpeakerWaveIcon,
    ArchiveBoxIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon,
    FolderIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import resourceService from '../../api/services/resourceService';
import { ResourceType, ResourceMaterial, ResourceStats } from '../../types/resource';
import { formatFileSize, formatDate } from '../../utils/formatters';

const PREDEFINED_CATEGORIES = [
    'lecture-notes',
    'assignments',
    'tutorials',
    'references',
    'past-papers',
    'external'
];

export default function StudentClassResources() {
    const { ClassId } = useParams<{ ClassId: string }>();
    const [resources, setResources] = useState<ResourceMaterial[]>([]);
    const [stats, setStats] = useState<ResourceStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (ClassId) {
            loadResources();
            loadStats();
        }
    }, [ClassId]);

    const loadResources = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await resourceService.getResourcesByCourseSession(parseInt(ClassId!));
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
            const statsData = await resourceService.getResourcesStats(parseInt(ClassId!));
            setStats(statsData);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const handleDownload = async (resource: ResourceMaterial) => {
        try {
            // For link resources, open in new tab
            if (resource.type === ResourceType.LINK) {
                window.open(resource.linkUrl, '_blank');
                // Still record the "download" for analytics
                await resourceService.recordDownload(resource.id);
                setResources(resources.map(r => 
                    r.id === resource.id 
                        ? { ...r, downloadCount: r.downloadCount + 1 }
                        : r
                ));
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
                        Access course materials and resources shared by your instructor
                    </p>
                </div>
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

            {/* Resources Grid */}
            <div className="card overflow-hidden">
                {filteredResources.length === 0 ? (
                    <div className="text-center py-12">
                        <FolderIcon className="h-16 w-16 text-foreground-tertiary mx-auto mb-4" />
                        <h3 className="heading-4 mb-2">No Resources Found</h3>
                        <p className="body-default text-foreground-secondary">
                            {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                                ? "No resources match your current filters."
                                : "No resources have been shared for this course yet."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {filteredResources.map((resource) => (
                            <div key={resource.id} className="card card-hover group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        {getResourceIcon(resource.type)}
                                        <div className="ml-3">
                                            <h4 className="body-default font-medium text-foreground group-hover:text-primary-600 transition-colors">
                                                {resource.title}
                                            </h4>
                                            <p className="body-small text-foreground-secondary">
                                                {resource.type}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {resource.description && (
                                    <p className="body-small text-foreground-secondary mb-4 line-clamp-2">
                                        {resource.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-1 mb-4">
                                    {resource.categories.map((category) => (
                                        <span
                                            key={category}
                                            className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300"
                                        >
                                            {category.replace('-', ' ')}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-foreground-secondary mb-4">
                                    <span className="body-small">{resource.fileSizeFormatted}</span>
                                    <span className="body-small">{resource.downloadCount} downloads</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="body-small text-foreground-tertiary">
                                        {formatDate(resource.uploadedAt)}
                                    </div>
                                    <button
                                        onClick={() => handleDownload(resource)}
                                        className="btn btn-primary text-sm px-4 py-2"
                                    >
                                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                                        {resource.type === ResourceType.LINK ? 'Open' : 'Download'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}