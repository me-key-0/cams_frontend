import { useState, useEffect } from "react";
import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpenIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  AcademicCapIcon,
  CalendarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Resources", href: "resources", icon: BookOpenIcon },
  { name: "Notifications", href: "notifications", icon: BellIcon },
  { name: "Assessments", href: "assessments", icon: ClipboardDocumentListIcon },
  { name: "Chat", href: "chat", icon: ChatBubbleLeftRightIcon },
  { name: "Evaluation", href: "evaluation", icon: ClipboardDocumentCheckIcon },
];

export default function ClassDetails() {
  const { ClassId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname.split("/").pop();
    return navigation.find((item) => item.href === path)?.href || "resources";
  });

  const classDetails = location.state || {
    courseSessionId: ClassId,
    code: "CS101",
    name: "Introduction to Programming",
    instructor: "Dr. John Smith",
    credits: 3,
    year: 1,
    semester: 1,
    academicYear: new Date().getFullYear()
  };

  return (
    <div className="space-y-6">
      {/* Class Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <h1 className="heading-1 text-primary-600">
                {classDetails.code}
              </h1>
              <span className="status-success px-3 py-1 rounded-full text-sm font-medium">
                Enrolled
              </span>
            </div>
            <h2 className="heading-3 text-foreground mb-4">
              {classDetails.name}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center text-foreground-secondary">
            <AcademicCapIcon className="h-6 w-6 mr-3 text-primary-500" />
            <div>
              <span className="block body-small font-medium text-foreground">Credit Hours</span>
              <span className="body-default">{classDetails.credits} Credits</span>
            </div>
          </div>

          <div className="flex items-center text-foreground-secondary">
            <CalendarIcon className="h-6 w-6 mr-3 text-primary-500" />
            <div>
              <span className="block body-small font-medium text-foreground">Academic Period</span>
              <span className="body-default">
                Year {classDetails.year}, Semester {classDetails.semester}
              </span>
            </div>
          </div>

          <div className="flex items-center text-foreground-secondary">
            <BookOpenIcon className="h-6 w-6 mr-3 text-primary-500" />
            <div>
              <span className="block body-small font-medium text-foreground">Academic Year</span>
              <span className="body-default">
                {classDetails.academicYear} - {classDetails.academicYear + 1}
              </span>
            </div>
          </div>

          <div className="flex items-center text-foreground-secondary">
            <UserGroupIcon className="h-6 w-6 mr-3 text-primary-500" />
            <div>
              <span className="block body-small font-medium text-foreground">Instructor</span>
              <span className="body-default">{classDetails.instructor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card p-0 overflow-hidden">
        <div className="border-b border-border">
          <nav className="flex overflow-x-auto" aria-label="Tabs">
            {navigation.map((item) => {
              const isActive = activeTab === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.href);
                    navigate(`/student/class/${ClassId}/${item.href}`, {
                      state: classDetails
                    });
                  }}
                  className={`
                    group inline-flex items-center border-b-2 py-4 px-6 text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${
                      isActive
                        ? "border-primary-500 text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                        : "border-transparent text-foreground-secondary hover:border-border-secondary hover:text-foreground hover:bg-background-secondary"
                    }
                  `}
                >
                  <item.icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5 transition-colors duration-200
                      ${
                        isActive
                          ? "text-primary-500"
                          : "text-foreground-tertiary group-hover:text-foreground-secondary"
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
      <div className="card">
        <Outlet context={{ classDetails }} />
      </div>
    </div>
  );
}