import { useState } from "react";
import {
  AcademicCapIcon,
  CalendarIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  type: "info" | "warning" | "success";
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
  },
  {
    id: "2",
    title: "Important: Course Registration Deadline",
    content:
      "The deadline for course registration is approaching. Please complete your registration by the end of this week.",
    date: "2024-03-23",
    author: "Academic Office",
    type: "warning",
  },
];

const quickStats = [
  {
    name: "Current GPA",
    value: "3.8",
    icon: AcademicCapIcon,
  },
  {
    name: "Courses This Semester",
    value: "5",
    icon: BookOpenIcon,
  },
  {
    name: "Upcoming Exams",
    value: "2",
    icon: CalendarIcon,
  },
];

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {quickStats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-primary-500 p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Announcements */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Announcements
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode("card")}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  viewMode === "card"
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Card View
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  viewMode === "list"
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                List View
              </button>
            </div>
          </div>

          <div className="mt-5">
            {viewMode === "card" ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {mockAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="overflow-hidden rounded-lg bg-white shadow"
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              announcement.type === "info"
                                ? "bg-blue-500"
                                : announcement.type === "warning"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                          />
                        </div>
                        <div className="ml-3 w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {announcement.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {announcement.author} •{" "}
                            {new Date(announcement.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">
                          {announcement.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {mockAnnouncements.map((announcement) => (
                    <li key={announcement.id} className="py-5">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              announcement.type === "info"
                                ? "bg-blue-500"
                                : announcement.type === "warning"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {announcement.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {announcement.author} •{" "}
                            {new Date(announcement.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {announcement.content}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
