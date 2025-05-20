import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    DocumentIcon,
    VideoCameraIcon,
    PhotoIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import resourceService  from '../../api/services/resourceService';
import { ResourceType } from '../../types/resource';
import type { ResourceMaterial } from '../../types/resource';
import { formatFileSize, formatDate } from '../../utils/formatters';

// Remove unused type definitions

const PREDEFINED_CATEGORIES = [
    'Lecture Notes',
    'Assignments',
    'Tutorials',
    'Reference Materials',
    'Past Papers'
];

export default function StudentClassResources() {
    const { ClassId } = useParams<{ ClassId: string }>();
    const [resources, setResources] = useState<ResourceMaterial[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadResources();
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

    const handleDownload = async (resource: ResourceMaterial) => {
        try {
            // For link resources, open in new tab
            if (resource.type === 'LINK') {
                window.open(resource.fileUrl, '_blank');
                return;
            }

            // For file resources, use fetch to get the file
            const response = await fetch(`/api/v1/resources/download/${resource.id}/${resource.fileName}`);
            if (!response.ok) {
                throw new Error('Failed to download file');
            }

            // Create a blob from the response
            const blob = await response.blob();
            
            // Create a temporary link to trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = resource.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            // Record download count
            await resourceService.incrementDownloadCount(resource.id);
            
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
    if (!type) return null;
    switch (type) {
            case 'DOCUMENT':
                return <DocumentIcon className="h-8 w-8 text-blue-500" />;
            case 'VIDEO':
                return <VideoCameraIcon className="h-8 w-8 text-red-500" />;
            case 'PHOTO':
                return <PhotoIcon className="h-8 w-8 text-green-500" />;
            case 'LINK':
                return null;
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
        return <div className="flex justify-center items-center h-64">Loading resources...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Class Resources</h2>
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
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                    <option value="all">All Types</option>
                    {Object.values(ResourceType).map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

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
                                    <button
                                        onClick={() => handleDownload(resource)}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        <ArrowDownTrayIcon className="h-5 w-5 mr-1" />
                                        Download
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
} 