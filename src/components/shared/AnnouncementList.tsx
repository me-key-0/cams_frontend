import { useState } from "react";
import {
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  type: "info" | "warning" | "success";
  category: "academic" | "administrative" | "event";
}

interface AnnouncementListProps {
  announcements: Announcement[];
  onDelete?: (id: string) => void;
  onEdit?: (announcement: Announcement) => void;
}

export default function AnnouncementList({ announcements, onDelete, onEdit }: AnnouncementListProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "academic", name: "Academic" },
    { id: "administrative", name: "Administrative" },
  ];

  const filteredAnnouncements = announcements
    .filter((announcement) => {
      const matchesCategory =
        selectedCategory === "all" ||
        announcement.category === selectedCategory;
      const matchesSearch =
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const announcementTypeIcon = (type: Announcement["type"]) => {
    switch (type) {
      case "info":
        return <BellIcon className="h-5 w-5 text-blue-500" />;
      case "warning":
        return <BellIcon className="h-5 w-5 text-yellow-500" />;
      case "success":
        return <BellIcon className="h-5 w-5 text-green-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 text-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-lg rounded-md shadow-sm"
                  placeholder="Search announcements..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {sortOrder === "asc" ? <ArrowUpIcon className="h-5 w-5" /> : <ArrowDownIcon className="h-5 w-5" />}
                Sort
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white shadow sm:rounded-lg">
        <ul role="list" className="divide-y divide-gray-200">
          {filteredAnnouncements.map((announcement) => (
            <li key={announcement.id} className="px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {announcementTypeIcon(announcement.type)}
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {announcement.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {announcement.content}
                    </p>
                    <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
                      <span>{announcement.author}</span>
                      <span>•</span>
                      <span>
                        {new Date(announcement.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {onDelete && (
                  <button
                    onClick={() => onDelete(announcement.id)}
                    className="ml-4 inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(announcement)}
                    className="ml-4 inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
