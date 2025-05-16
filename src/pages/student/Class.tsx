import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

interface Class {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  schedule: string;
  room: string;
  status: "Enrolled" | "Completed" | "In Progress";
  grade?: string;
  yearLevel: string;    
  semester: string;     
}

// Mock data - replace with actual API calls
const mockClass: Class[] = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Programming",
    instructor: "Dr. John Smith",
    credits: 3,
    schedule: "Mon, Wed 9:00 AM - 10:30 AM",
    room: "Room 101",
    status: "In Progress",
    yearLevel: "1st Year",
    semester: "1st Semester",
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
    yearLevel: "1st Year",
    semester: "1st Semester",
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
    yearLevel: "1st Year",
    semester: "2nd Semester",
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
    yearLevel: "1st Year",
    semester: "2nd Semester",
  },
];

const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const semesters = ["1st Semester", "2nd Semester"];

export default function Class() {
  const [selectedYear, setSelectedYear] = useState(yearLevels[0]);
  const [selectedSemester, setSelectedSemester] = useState(semesters[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Filter by year, semester, and search query
  const filteredClass = mockClass.filter(
    (Class) =>
      Class.yearLevel === selectedYear &&
      Class.semester === selectedSemester &&
      (
        Class.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Class.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleClassClick = (ClassId: string) => {
    navigate(`/student/Class/${ClassId}/resources`);
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              My Classes
            </h3>
            <div className="flex items-center space-x-4">
              {/* Year dropdown */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="min-w-[130px] pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {yearLevels.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {/* Semester dropdown */}
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="min-w-[150px] ml-2 pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search Class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-4 pr-12 py-3 text-lg border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-lg rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Class Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredClass.map((Class) => (
          <div
            key={Class.id}
            onClick={() => handleClassClick(Class.id)}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">
                    {Class.code}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">{Class.name}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    Class.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : Class.status === "In Progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {Class.status}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  {Class.instructor}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  {Class.schedule}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  {Class.room}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  {Class.credits} Credits
                </div>
              </div>

              {Class.grade && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    Final Grade:{" "}
                    <span className="text-primary-600">{Class.grade}</span>
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
