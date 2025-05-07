import { useState } from "react";
import {
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  type: "info" | "warning" | "success";
  category: "academic" | "administrative";
}

// Mock data - replace with actual API calls
const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Welcome to the New Academic Year",
    content:
      "We are excited to welcome you to the new academic year. Please make sure to check your schedules and course materials.",
    date: "2024-03-24",
    author: "Department Head",
    type: "info",
    category: "academic",
  },
  {
    id: "2",
    title: "Important: Course Registration Deadline",
    content:
      "The deadline for course registration is approaching. Please complete your registration by the end of this week.",
    date: "2024-03-23",
    author: "Academic Office",
    type: "warning",
    category: "administrative",
  },
  {
    id: "3",
    title: "Career Fair 2024",
    content:
      "Join us for the annual Career Fair where you can meet potential employers and explore internship opportunities.",
    date: "2024-03-22",
    author: "Career Services",
    type: "info",
    category: "administrative",
  },
];

const categories = [
  { id: "all", name: "All Categories" },
  { id: "academic", name: "Academic" },
  { id: "administrative", name: "Administrative" },
];

export default function Announcements() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAnnouncements = mockAnnouncements
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

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search announcements..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {sortOrder === "asc" ? (
                  <ArrowUpIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                )}
                <span className="ml-2">Sort by Date</span>
              </button>
            </div>
          </div>
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
                      className={`h-2 w-2 rounded-full mr-3 ${
                        announcement.type === "info"
                          ? "bg-blue-500"
                          : announcement.type === "warning"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    />
                    <p className="text-sm font-medium text-primary-600 truncate">
                      {announcement.title}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                      {announcement.category}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {announcement.author}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      {new Date(announcement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {announcement.content}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
