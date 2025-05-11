import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  DocumentIcon,
  PhotoIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

interface Resource {
  id: string;
  title: string;
  type: "pdf" | "doc" | "image";
  size: string;
  uploadedAt: string;
  url: string;
  category: string;
}

// Mock data - replace with actual API calls
const mockResources: Resource[] = [
  {
    id: "1",
    title: "Class Syllabus",
    type: "pdf",
    size: "2.4 MB",
    uploadedAt: "2024-01-15",
    url: "/mock-url/syllabus.pdf",
    category: "Class Information",
  },
  {
    id: "2",
    title: "Week 1 Lecture Notes",
    type: "doc",
    size: "1.8 MB",
    uploadedAt: "2024-01-16",
    url: "/mock-url/lecture1.docx",
    category: "Lecture Notes",
  },
  {
    id: "3",
    title: "Programming Assignment 1",
    type: "pdf",
    size: "1.2 MB",
    uploadedAt: "2024-01-17",
    url: "/mock-url/assignment1.pdf",
    category: "Assignments",
  },
  {
    id: "4",
    title: "Class Schedule",
    type: "image",
    size: "800 KB",
    uploadedAt: "2024-01-18",
    url: "/mock-url/schedule.png",
    category: "Class Information",
  },
];

const categories = [
  "All",
  "Class Information",
  "Lecture Notes",
  "Assignments",
];

export default function ClassResources() {
  const { ClassId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = mockResources.filter((resource) => {
    const matchesCategory =
      selectedCategory === "All" || resource.category === selectedCategory;
    const matchesSearch = resource.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownload = (resource: Resource) => {
    // TODO: Implement actual download functionality
    console.log("Downloading:", resource.title);
  };

  const getResourceIcon = (type: Resource["type"]) => {
    switch (type) {
      case "pdf":
        return <DocumentIcon className="h-6 w-6 text-red-500" />;
      case "doc":
        return <DocumentTextIcon className="h-6 w-6 text-blue-500" />;
      case "image":
        return <PhotoIcon className="h-6 w-6 text-green-500" />;
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          />
        </div>
        <div className="flex-1">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {getResourceIcon(resource.type)}
                  <div className="ml-3">
                    <h4 className="text-lg font-medium text-gray-900">
                      {resource.title}
                    </h4>
                    <p className="text-sm text-gray-500">{resource.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(resource)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <span>Size: {resource.size}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span>Uploaded: {resource.uploadedAt}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
