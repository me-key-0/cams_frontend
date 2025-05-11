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
  { name: "Notifications", href: "notifications", icon: BellIcon },
  { name: "Grades", href: "grades", icon: AcademicCapIcon },
  { name: "Assessments", href: "assessments", icon: ClipboardDocumentListIcon },
  { name: "Chat", href: "chat", icon: ChatBubbleLeftRightIcon },
];

export default function ClassDetails() {
  const { ClassId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname.split("/").pop();
    return navigation.find((item) => item.href === path)?.href || "resources";
  });

  // TODO: Fetch Class details using ClassId
  const ClassDetails = {
    code: "CS101",
    name: "Introduction to Programming",
    instructor: "Dr. John Smith",
    credits: 3,
  };

  return (
    <div className="space-y-6">
      {/* Class Header */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {ClassDetails.code}
          </h1>
          <p className="mt-1 text-lg text-gray-500">{ClassDetails.name}</p>
          <p className="mt-1 text-sm text-gray-500">
            Instructor: {ClassDetails.instructor} | Credits:{" "}
            {ClassDetails.credits}
          </p>
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
                    navigate(`/student/Class/${ClassId}/${item.href}`);
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
