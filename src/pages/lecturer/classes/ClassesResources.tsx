import { useState } from "react";
import {
  PlusIcon,
  FolderIcon,
  DocumentIcon,
  TrashIcon,
  PencilIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
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
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [resourceForm, setResourceForm] = useState({
    id: "",
    title: "",
    description: "",
    type: "document" as "document" | "video" | "link" | "folder",
    category: "",
    attachments: [] as File[],
  });

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
      setResourceForm({ ...resourceForm, attachments: Array.from(e.target.files) });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newResource: Resource = {
      id: isEditing || Date.now().toString(),
      title: resourceForm.title,
      description: resourceForm.description,
      type: resourceForm.type,
      category: resourceForm.category,
      uploadDate: new Date().toISOString(),
      attachments: resourceForm.attachments.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
      })),
    };
    
    setResources((prev) => {
      if (isEditing) {
        return prev.map((r) => (r.id === isEditing ? newResource : r));
      } else {
        return [...prev, newResource];
      }
    });

    setIsCreating(false);
    setIsEditing(null);
    setResourceForm({ id: "", title: "", description: "", type: "document", category: "", attachments: [] });
  };

  const handleDelete = (id: string) => {
    setResources(resources.filter((r) => r.id !== id));
  };

  const handleEdit = (resource: Resource) => {
    setIsCreating(true);
    setIsEditing(resource.id);
    setResourceForm({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      attachments: [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Course Resources</h2>
        <button
          onClick={() => {
            setIsCreating(true);
            setIsEditing(null);
            setResourceForm({ id: "", title: "", description: "", type: "document", category: "", attachments: [] });
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Resource
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {isCreating && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isEditing ? "Edit Resource" : "Add New Resource"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Title" value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} className="w-full rounded-md border-gray-300" required />
            <textarea placeholder="Description" value={resourceForm.description} onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })} className="w-full rounded-md border-gray-300" required />
            <select value={resourceForm.type} onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value as Resource["type"] })} className="w-full rounded-md border-gray-300">
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
              <option value="folder">Folder</option>
            </select>
            <select value={resourceForm.category} onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })} className="w-full rounded-md border-gray-300" required>
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input type="file" multiple onChange={handleFileChange} />
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => { setIsCreating(false); setIsEditing(null); }} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">
                {isEditing ? "Update Resource" : "Create Resource"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredResources.map((resource) => (
            <li key={resource.id} className="px-4 py-4 hover:bg-gray-50">
              <div className="flex justify-between">
                <div className="flex items-center">
                  {resource.type === "folder" ? <FolderIcon className="h-8 w-8 text-yellow-500" /> : <DocumentIcon className="h-8 w-8 text-blue-500" />}
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{resource.title}</h3>
                    <p className="text-sm text-gray-500">{resource.description}</p>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <span className="mr-4">{resource.category}</span>
                      {resource.size && <span>{resource.size}</span>}
                      <span className="mx-4">{new Date(resource.uploadDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(resource)} className="text-gray-400 hover:text-gray-600">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(resource.id)} className="text-gray-400 hover:text-red-500">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
