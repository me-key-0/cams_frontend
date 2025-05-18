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

export default function LecturerClassDetails() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname.split("/").pop();
    return navigation.find((item) => item.href === path)?.href || "resources";
  });

  const classDetails = location.state || {
    code: "CS101",
    name: "Introduction to Programming",
    credits: 3,
    year: 1,
    semester: 1,
    academicYear: 2023,
    status: "ACTIVE"
  };

  return (
    <div className="space-y-6">
      {/* Class Header */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {classDetails.code}
                </h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    classDetails.status === "ACTIVE"
                      ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10"
                      : classDetails.status === "UPCOMING"
                      ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10"
                      : "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/10"
                  }`}
                >
                  {classDetails.status}
                </span>
              </div>
              <h2 className="text-xl font-medium text-gray-700 mb-4">
                {classDetails.name}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center text-gray-600">
              <AcademicCapIcon className="h-6 w-6 mr-3 text-gray-400" />
              <div>
                <span className="block text-sm font-medium text-gray-500">Credit Hours</span>
                <span className="text-base">{classDetails.credits} Credits</span>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <BookOpenIcon className="h-6 w-6 mr-3 text-gray-400" />
              <div>
                <span className="block text-sm font-medium text-gray-500">Academic Period</span>
                <span className="text-base">
                  Year {classDetails.year}, Semester {classDetails.semester}
                </span>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <ClipboardDocumentListIcon className="h-6 w-6 mr-3 text-gray-400" />
              <div>
                <span className="block text-sm font-medium text-gray-500">Academic Year</span>
                <span className="text-base">
                  {classDetails.academicYear} - {classDetails.academicYear + 1}
                </span>
              </div>
            </div>
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