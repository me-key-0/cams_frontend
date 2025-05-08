import { useState } from "react";
import {
  PlusIcon,
  FolderIcon,
  DocumentIcon,
  TrashIcon,
  PencilIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "document" | "video" | "link" | "folder";
  category: string;
  uploadDate: string;
  size?: string;
  url?: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

// Mock data - replace with actual API calls
const mockResources: Resource[] = [
  {
    id: "1",
    title: "Introduction to Programming",
    description: "Basic concepts and fundamentals of programming",
    type: "document",
    category: "Lecture Notes",
    uploadDate: "2024-03-15",
    size: "2.5 MB",
    attachments: [
      {
        name: "Lecture1.pdf",
        url: "/mock-url/lecture1.pdf",
        type: "pdf",
      },
    ],
  },
  {
    id: "2",
    title: "Programming Assignment Guidelines",
    description: "Detailed guidelines for the first programming assignment",
    type: "document",
    category: "Assignments",
    uploadDate: "2024-03-14",
    size: "1.2 MB",
    attachments: [
      {
        name: "Assignment1.pdf",
        url: "/mock-url/assignment1.pdf",
        type: "pdf",
      },
    ],
  },
  {
    id: "3",
    title: "Video Tutorials",
    description: "Collection of video tutorials for the course",
    type: "folder",
    category: "Tutorials",
    uploadDate: "2024-03-13",
  },
];

const categories = [
  "Lecture Notes",
  "Assignments",
  "Tutorials",
  "Reference Materials",
  "Past Papers",
];

export default function LecturerResources() {
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "document" as "document" | "video" | "link" | "folder",
    category: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const filteredResources = resources.filter((resource) => {
    const matchesCategory =
      selectedCategory === "all" || resource.category === selectedCategory;
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle resource creation with file upload
    setIsCreating(false);
    setNewResource({
      title: "",
      description: "",
      type: "document",
      category: "",
    });
    setSelectedFiles([]);
  };

  const handleDelete = (id: string) => {
    setResources(resources.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Course Resources</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Resource
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Create Resource Form */}
      {isCreating && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Add New Resource
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newResource.title}
                onChange={(e) =>
                  setNewResource({ ...newResource, title: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={newResource.description}
                onChange={(e) =>
                  setNewResource({
                    ...newResource,
                    description: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700"
              >
                Type
              </label>
              <select
                id="type"
                value={newResource.type}
                onChange={(e) =>
                  setNewResource({
                    ...newResource,
                    type: e.target.value as
                      | "document"
                      | "video"
                      | "link"
                      | "folder",
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="document">Document</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
                <option value="folder">Folder</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                value={newResource.category}
                onChange={(e) =>
                  setNewResource({ ...newResource, category: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Attachments
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                  Upload Files
                </label>
                {selectedFiles.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    {selectedFiles.length} file(s) selected
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Create Resource
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resources List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredResources.map((resource) => (
            <li key={resource.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {resource.type === "folder" ? (
                      <FolderIcon className="h-8 w-8 text-yellow-500" />
                    ) : (
                      <DocumentIcon className="h-8 w-8 text-blue-500" />
                    )}
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {resource.description}
                      </p>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <span className="mr-4">{resource.category}</span>
                        {resource.size && <span>{resource.size}</span>}
                        <span className="mx-4">
                          {new Date(resource.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // Handle edit
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
