import { useState } from "react";
import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpenIcon,
  BellIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Resources", href: "resources", icon: BookOpenIcon },
  { name: "Grades", href: "grades", icon: AcademicCapIcon },
  { name: "Assessments", href: "assessments", icon: ClipboardDocumentListIcon },
  { name: "Chat", href: "chat", icon: ChatBubbleLeftRightIcon },
];

export default function ClassDetails() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname.split("/").pop();
    return navigation.find((item) => item.href === path)?.href || "resources";
  });

  // TODO: Fetch class details using classId
  const classDetails = {
    code: "CS101",
    name: "Introduction to Programming",
    instructor: "Dr. John Smith",
    credits: 3,
    students: 45,
    schedule: "Mon, Wed 9:00 AM - 10:30 AM",
    room: "Room 101",
  };

  return (
    <div className="space-y-6">
      {/* Class Header */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {classDetails.code}
          </h1>
          <p className="mt-1 text-lg text-gray-500">{classDetails.name}</p>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <p className="text-sm text-gray-500">
              Instructor: {classDetails.instructor}
            </p>
            <p className="text-sm text-gray-500">
              Credits: {classDetails.credits}
            </p>
            <p className="text-sm text-gray-500">
              Students: {classDetails.students}
            </p>
            <p className="text-sm text-gray-500">
              Schedule: {classDetails.schedule}
            </p>
            <p className="text-sm text-gray-500">
              Room: {classDetails.room}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {navigation.map((item) => {
              const isActive = activeTab === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.href);
                    navigate(`/lecturer/classes/${classId}/${item.href}`);
                  }}
                  className={`
                    group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium
                    ${
                      isActive
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }
                  `}
                >
                  <item.icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${
                        isActive
                          ? "text-primary-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      }
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
} 