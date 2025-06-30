import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  MegaphoneIcon,
  AcademicCapIcon,
  CalculatorIcon,
  CalendarIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../stores/authStore";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";
import { notificationService } from "../../api/services/notificationService";
import { communicationService } from "../../api/services/communicationService";

const studentNavigation = [
  { name: "Dashboard", href: "/student", icon: HomeIcon },
  {
    name: "Announcements",
    href: "/student/announcements",
    icon: MegaphoneIcon,
    hasNotifications: true,
  },
  { name: "Grades", href: "/student/grades", icon: AcademicCapIcon },
  {
    name: "GPA Calculator",
    href: "/student/gpa-calculator",
    icon: CalculatorIcon,
  },
  { name: "Schedules", href: "/student/schedules", icon: CalendarIcon },
  { name: "Class", href: "/student/Class", icon: BookOpenIcon },
  {
    name: "Contact Admin",
    href: "/student/contact-admin",
    icon: ChatBubbleLeftRightIcon,
  },
];

const lecturerNavigation = [
  { name: "Dashboard", href: "/lecturer", icon: HomeIcon },
  {
    name: "Announcements",
    href: "/lecturer/announcements",
    icon: MegaphoneIcon,
  },
  { name: "Classes", href: "/lecturer/classes", icon: BookOpenIcon },
  {
    name: "Notifications",
    href: "/lecturer/notifications",
    icon: BellIcon,
  },
  {
    name: "Contact Admin",
    href: "/lecturer/contact-admin",
    icon: ChatBubbleLeftRightIcon,
  },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearToken } = useAuthStore();
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);

  const navigation =
    user?.role.toLowerCase() === "lecturer" ? lecturerNavigation : studentNavigation;

  const currentPage = navigation.find((item) => item.href === location.pathname);

  useEffect(() => {
    // Fetch unread counts for student
    if (user?.role.toLowerCase() === "student") {
      fetchUnreadCounts();
    }
  }, [user?.role, location.pathname]);

  const fetchUnreadCounts = async () => {
    try {
      const count = await communicationService.getUnreadAnnouncementCount();
      setUnreadAnnouncements(count);
    } catch (err) {
      console.error('Error fetching unread counts:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-foreground/25 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-background border-r border-border shadow-strong">
          <div className="flex h-16 items-center justify-between px-6">
            <span className="heading-4 gradient-text">CAMS</span>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-foreground-secondary hover:text-foreground hover:bg-background-secondary rounded-lg transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.href
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                    : "text-foreground-secondary hover:bg-background-secondary hover:text-foreground"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                    location.pathname === item.href
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-foreground-tertiary group-hover:text-foreground-secondary"
                  }`}
                />
                <span className="flex-1">{item.name}</span>
                {item.name === "Announcements" && unreadAnnouncements > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                    {unreadAnnouncements}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="body-small">Theme</span>
              <ThemeSwitcher />
            </div>
            <button
              onClick={clearToken}
              className="flex w-full items-center justify-center rounded-lg bg-error-50 px-3 py-2.5 text-sm font-medium text-error-700 hover:bg-error-100 dark:bg-error-900/20 dark:text-error-300 dark:hover:bg-error-900/30 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-border bg-background">
          <div className="flex h-16 items-center px-6">
            <span className="heading-4 gradient-text">CAMS</span>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.href
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                    : "text-foreground-secondary hover:bg-background-secondary hover:text-foreground"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                    location.pathname === item.href
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-foreground-tertiary group-hover:text-foreground-secondary"
                  }`}
                />
                <span className="flex-1">{item.name}</span>
                {item.name === "Announcements" && unreadAnnouncements > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                    {unreadAnnouncements}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="body-small">Theme</span>
              <ThemeSwitcher />
            </div>
            <button
              onClick={clearToken}
              className="flex w-full items-center justify-center rounded-lg bg-error-50 px-3 py-2.5 text-sm font-medium text-error-700 hover:bg-error-100 dark:bg-error-900/20 dark:text-error-300 dark:hover:bg-error-900/30 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 flex-shrink-0 border-b border-border bg-background/80 backdrop-blur-md">
          <button
            type="button"
            className="border-r border-border px-4 text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden hover:text-foreground hover:bg-background-secondary transition-colors duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex flex-1 items-center">
              <h1 className="heading-3">
                {currentPage?.name || "Dashboard"}
              </h1>
            </div>
            <div className="ml-4 flex items-center space-x-4">
              <div className="hidden lg:block">
                <ThemeSwitcher />
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className="body-small font-medium text-foreground">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <div className="caption text-foreground-tertiary">
                    {user?.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="py-6 lg:py-8">
          <div className="container-responsive">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}