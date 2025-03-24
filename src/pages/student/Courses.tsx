import { useState } from "react";
import {
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  schedule: string;
  room: string;
  status: "Enrolled" | "Completed" | "In Progress";
  grade?: string;
}

// Mock data - replace with actual API calls
const mockCourses: Course[] = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Programming",
    instructor: "Dr. John Smith",
    credits: 3,
    schedule: "Mon, Wed 9:00 AM - 10:30 AM",
    room: "Room 101",
    status: "In Progress",
  },
  {
    id: "2",
    code: "MATH201",
    name: "Calculus II",
    instructor: "Prof. Sarah Johnson",
    credits: 4,
    schedule: "Tue, Thu 11:00 AM - 12:30 PM",
    room: "Room 202",
    status: "In Progress",
  },
  {
    id: "3",
    code: "PHYS101",
    name: "Physics I",
    instructor: "Dr. Michael Brown",
    credits: 4,
    schedule: "Mon, Wed 2:00 PM - 3:30 PM",
    room: "Room 303",
    status: "In Progress",
  },
  {
    id: "4",
    code: "ENG101",
    name: "English Composition",
    instructor: "Prof. Emily Davis",
    credits: 3,
    schedule: "Tue, Thu 9:00 AM - 10:30 AM",
    room: "Room 404",
    status: "Completed",
    grade: "A",
  },
];

export default function Courses() {
  const [selectedSemester, setSelectedSemester] = useState("Spring 2024");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = mockCourses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              My Courses
            </h3>
            <div className="flex gap-4">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="Spring 2024">Spring 2024</option>
                <option value="Fall 2023">Fall 2023</option>
              </select>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">
                    {course.code}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">{course.name}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    course.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : course.status === "In Progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {course.status}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  {course.instructor}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  {course.schedule}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  {course.room}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  {course.credits} Credits
                </div>
              </div>

              {course.grade && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    Final Grade:{" "}
                    <span className="text-primary-600">{course.grade}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
