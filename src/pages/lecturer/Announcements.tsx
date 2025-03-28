import { useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  type: "info" | "warning" | "success";
  category: "academic" | "administrative" | "event";
}

// Mock data - replace with actual API calls
const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Welcome to the New Academic Year",
    content:
      "I hope you all had a great summer break. I'm excited to start this new academic year with you. Let's make it a productive and successful one!",
    date: "2024-03-15",
    author: "Dr. Sarah Wilson",
    type: "info",
    category: "academic",
  },
  {
    id: "2",
    title: "Course Registration Deadline",
    content:
      "Please note that the course registration deadline is approaching. Make sure to complete your registration by the end of this week.",
    date: "2024-03-14",
    author: "Dr. Sarah Wilson",
    type: "warning",
    category: "administrative",
  },
  {
    id: "3",
    title: "Career Fair Registration Open",
    content:
      "The annual career fair registration is now open. This is a great opportunity to network with industry professionals and explore career options.",
    date: "2024-03-13",
    author: "Dr. Sarah Wilson",
    type: "success",
    category: "event",
  },
];

const categories = [
  { id: "all", name: "All" },
  { id: "academic", name: "Academic" },
  { id: "administrative", name: "Administrative" },
  { id: "event", name: "Events" },
];

export default function LecturerAnnouncements() {
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(mockAnnouncements);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Announcements</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Announcement
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-4">
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
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {sortOrder === "asc" ? "Oldest First" : "Newest First"}
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredAnnouncements.map((announcement) => (
            <li key={announcement.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-full ${
                        announcement.type === "info"
                          ? "bg-blue-100"
                          : announcement.type === "warning"
                          ? "bg-yellow-100"
                          : "bg-green-100"
                      }`}
                    >
                      <BellIcon
                        className={`h-5 w-5 ${
                          announcement.type === "info"
                            ? "text-blue-600"
                            : announcement.type === "warning"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {announcement.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {new Date(announcement.date).toLocaleDateString()}
                    </span>
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
                        onClick={() => handleDelete(announcement.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
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
