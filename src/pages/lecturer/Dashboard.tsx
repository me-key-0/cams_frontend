import { useState, useEffect } from "react";
import {
  UserGroupIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  ClockIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  DocumentIcon,
  CalendarIcon,
  TrophyIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../stores/authStore";
import { communicationService } from "../../api/services/communicationService";
import api from "../../api/config";

interface LecturerStats {
  totalStudents: number;
  totalCourses: number;
  averageAttendance: number;
  pendingGrading: number;
  unreadMessages: number;
  resourcesShared: number;
  averageGrade: number;
  completionRate: number;
}

interface CourseOverview {
  courseCode: string;
  courseName: string;
  enrolledStudents: number;
  averageGrade: number;
  attendanceRate: number;
  status: 'excellent' | 'good' | 'needs_attention';
  trend: 'up' | 'down' | 'stable';
}

interface RecentActivity {
  id: string;
  type: 'submission' | 'message' | 'grade' | 'resource';
  title: string;
  description: string;
  date: string;
  student?: string;
  course?: string;
}

interface UpcomingTask {
  id: string;
  title: string;
  type: 'grading' | 'class' | 'meeting' | 'deadline';
  dueDate: string;
  course: string;
  priority: 'high' | 'medium' | 'low';
  progress?: number;
}

export default function LecturerDashboard() {
  const { user, lecturer } = useAuthStore();
  const [stats, setStats] = useState<LecturerStats>({
    totalStudents: 0,
    totalCourses: 0,
    averageAttendance: 0,
    pendingGrading: 0,
    unreadMessages: 0,
    resourcesShared: 0,
    averageGrade: 0,
    completionRate: 0,
  });
  const [courseOverviews, setCourseOverviews] = useState<CourseOverview[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!lecturer?.id) {
        setError("Lecturer information not available");
        return;
      }

      // Fetch data from available APIs
      const [
        courseSessions,
        announcements,
        supportTickets,
      ] = await Promise.all([
        // Get course sessions for this lecturer
        api.get(`/api/course-sessions/department/${lecturer.id}`).catch(() => ({ data: [] })),
        // Get announcements
        communicationService.getAnnouncements().catch(() => []),
        // Get support tickets if lecturer has admin access
        communicationService.getMyTickets().catch(() => []),
      ]);

      // Filter course sessions assigned to this lecturer
      const lecturerSessions = courseSessions.data.filter((session: any) => 
        session.lecturerIds && session.lecturerIds.includes(lecturer.id)
      );

      // Calculate total students across all courses
      let totalStudents = 0;
      const courseOverviewsData: CourseOverview[] = [];

      for (const session of lecturerSessions) {
        try {
          // Get enrolled students for each course session
          const enrollmentResponse = await api.get(`/api/enrollment/course-session/${session.id}/students`);
          const studentIds = enrollmentResponse.data || [];
          const enrolledCount = Array.isArray(studentIds) ? studentIds.length : 0;
          totalStudents += enrolledCount;

          // Create course overview
          courseOverviewsData.push({
            courseCode: session.course.code,
            courseName: session.course.name,
            enrolledStudents: enrolledCount,
            averageGrade: 75 + Math.random() * 20, // Mock average grade
            attendanceRate: 80 + Math.random() * 15, // Mock attendance
            status: enrolledCount > 30 ? 'excellent' : enrolledCount > 20 ? 'good' : 'needs_attention',
            trend: Math.random() > 0.5 ? 'up' : 'stable',
          });
        } catch (err) {
          console.warn(`Failed to fetch enrollment for session ${session.id}`);
        }
      }

      setCourseOverviews(courseOverviewsData);

      // Calculate stats
      const averageGrade = courseOverviewsData.length > 0 
        ? courseOverviewsData.reduce((sum, course) => sum + course.averageGrade, 0) / courseOverviewsData.length
        : 0;

      const averageAttendance = courseOverviewsData.length > 0
        ? courseOverviewsData.reduce((sum, course) => sum + course.attendanceRate, 0) / courseOverviewsData.length
        : 0;

      setStats({
        totalStudents,
        totalCourses: lecturerSessions.length,
        averageAttendance,
        pendingGrading: Math.floor(totalStudents * 0.15), // Estimate 15% pending grading
        unreadMessages: supportTickets.filter((ticket: any) => ticket.status === 'OPEN').length,
        resourcesShared: lecturerSessions.length * 8, // Estimate 8 resources per course
        averageGrade,
        completionRate: 85 + Math.random() * 10, // Mock completion rate
      });

      // Create recent activities from announcements and course data
      const activities: RecentActivity[] = [];

      // Add recent announcements created by this lecturer
      const lecturerAnnouncements = announcements.filter((ann: any) => 
        ann.createdBy === `${user?.firstName} ${user?.lastName}`
      );
      
      lecturerAnnouncements.slice(0, 2).forEach((announcement: any) => {
        activities.push({
          id: `announcement-${announcement.id}`,
          type: 'resource',
          title: 'Announcement Posted',
          description: announcement.title,
          date: announcement.createdAt,
          course: 'All Courses',
        });
      });

      // Add mock activities for submissions and grading
      if (totalStudents > 0) {
        activities.push({
          id: 'submission-latest',
          type: 'submission',
          title: 'New Assignment Submission',
          description: 'Student submitted Programming Assignment 3',
          date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          student: 'John Doe',
          course: courseOverviewsData[0]?.courseCode || 'CS101',
        });

        activities.push({
          id: 'grading-completed',
          type: 'grade',
          title: 'Grading Completed',
          description: 'Finished grading midterm exams',
          date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          course: courseOverviewsData[1]?.courseCode || 'CS201',
        });
      }

      setRecentActivities(activities);

      // Create upcoming tasks based on course data
      const tasks: UpcomingTask[] = [];

      if (stats.pendingGrading > 0) {
        tasks.push({
          id: 'grading-task',
          title: 'Grade Pending Assignments',
          type: 'grading',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          course: 'Multiple Courses',
          priority: 'high',
          progress: 35,
        });
      }

      // Add course-based tasks
      lecturerSessions.slice(0, 3).forEach((session: any, index: number) => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + (index + 1) * 2);

        tasks.push({
          id: `task-${session.id}`,
          title: index === 0 ? 'Prepare Lecture Materials' : index === 1 ? 'Faculty Meeting' : 'Submit Grade Reports',
          type: index === 0 ? 'class' : index === 1 ? 'meeting' : 'deadline',
          dueDate: futureDate.toISOString(),
          course: session.course.code,
          priority: index === 2 ? 'high' : 'medium',
          progress: index === 0 ? 80 : undefined,
        });
      });

      setUpcomingTasks(tasks);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'submission': return DocumentIcon;
      case 'message': return ChatBubbleLeftRightIcon;
      case 'grade': return AcademicCapIcon;
      case 'resource': return BookOpenIcon;
      default: return BellIcon;
    }
  };

  const getTaskIcon = (type: UpcomingTask['type']) => {
    switch (type) {
      case 'grading': return AcademicCapIcon;
      case 'class': return BookOpenIcon;
      case 'meeting': return UserGroupIcon;
      case 'deadline': return ExclamationTriangleIcon;
      default: return CalendarIcon;
    }
  };

  const getPriorityColor = (priority: UpcomingTask['priority']) => {
    switch (priority) {
      case 'high': return 'text-error-600 bg-error-50 dark:bg-error-900/20';
      case 'medium': return 'text-warning-600 bg-warning-50 dark:bg-warning-900/20';
      case 'low': return 'text-success-600 bg-success-50 dark:bg-success-900/20';
      default: return 'text-primary-600 bg-primary-50 dark:bg-primary-900/20';
    }
  };

  const getStatusColor = (status: CourseOverview['status']) => {
    switch (status) {
      case 'excellent': return 'text-success-600 bg-success-50 dark:bg-success-900/20';
      case 'good': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'needs_attention': return 'text-error-600 bg-error-50 dark:bg-error-900/20';
      default: return 'text-primary-600 bg-primary-50 dark:bg-primary-900/20';
    }
  };

  const getTrendIcon = (trend: CourseOverview['trend']) => {
    switch (trend) {
      case 'up': return ArrowTrendingUpIcon;
      case 'down': return ArrowTrendingDownIcon;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-primary-200 dark:border-primary-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-2 text-primary-900 dark:text-primary-100">
              Good morning, Dr. {user?.lastName}! 👨‍🏫
            </h1>
            <p className="body-default text-primary-700 dark:text-primary-300 mt-2">
              Here's an overview of your teaching activities and student progress
            </p>
          </div>
          <div className="hidden md:block">
            <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <TrophyIcon className="h-12 w-12 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="status-error p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <p className="body-default">{error}</p>
          </div>
        </div>
      )}

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card text-center group hover:shadow-medium transition-all duration-200">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="heading-3 text-blue-600 mb-1">{stats.totalStudents}</div>
          <div className="body-small text-foreground-secondary">Total Students</div>
          <div className="body-small text-foreground-tertiary mt-2">
            Across {stats.totalCourses} courses
          </div>
        </div>

        <div className="card text-center group hover:shadow-medium transition-all duration-200">
          <div className="p-3 bg-success-50 dark:bg-success-900/20 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
            <ChartBarIcon className="h-8 w-8 text-success-600" />
          </div>
          <div className="heading-3 text-success-600 mb-1">{stats.averageGrade.toFixed(1)}%</div>
          <div className="body-small text-foreground-secondary">Average Grade</div>
          <div className="flex items-center justify-center mt-2">
            <ArrowTrendingUpIcon className="h-4 w-4 text-success-600 mr-1" />
            <span className="body-small text-success-600">Performing well</span>
          </div>
        </div>

        <div className="card text-center group hover:shadow-medium transition-all duration-200">
          <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
            <AcademicCapIcon className="h-8 w-8 text-warning-600" />
          </div>
          <div className="heading-3 text-warning-600 mb-1">{stats.pendingGrading}</div>
          <div className="body-small text-foreground-secondary">Pending Grading</div>
          <div className="body-small text-warning-600 mt-2">Requires attention</div>
        </div>

        <div className="card text-center group hover:shadow-medium transition-all duration-200">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
            <EyeIcon className="h-8 w-8 text-primary-600" />
          </div>
          <div className="heading-3 text-primary-600 mb-1">{stats.averageAttendance.toFixed(1)}%</div>
          <div className="body-small text-foreground-secondary">Avg. Attendance</div>
          <div className="w-full bg-background-secondary rounded-full h-2 mt-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.averageAttendance}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Overview */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="heading-4 flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-2 text-primary-500" />
                Course Overview
              </h3>
              <span className="body-small text-foreground-secondary">
                {courseOverviews.length} active courses
              </span>
            </div>

            {courseOverviews.length === 0 ? (
              <div className="text-center py-8">
                <BookOpenIcon className="h-12 w-12 text-foreground-tertiary mx-auto mb-3" />
                <p className="body-default text-foreground-secondary">
                  No course assignments found
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {courseOverviews.map((course) => {
                  const TrendIcon = getTrendIcon(course.trend);
                  return (
                    <div key={course.courseCode} className="p-4 bg-background-secondary rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="body-default font-medium text-foreground">
                            {course.courseCode} - {course.courseName}
                          </h4>
                          <p className="body-small text-foreground-secondary">
                            {course.enrolledStudents} students enrolled
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {TrendIcon && (
                            <TrendIcon className={`h-4 w-4 ${
                              course.trend === 'up' ? 'text-success-600' : 
                              course.trend === 'down' ? 'text-error-600' : 'text-foreground-tertiary'
                            }`} />
                          )}
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${getStatusColor(course.status)}
                          `}>
                            {course.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="body-small text-foreground-tertiary">Average Grade</span>
                            <span className="body-small text-foreground-secondary">{course.averageGrade.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-background rounded-full h-2">
                            <div 
                              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${course.averageGrade}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="body-small text-foreground-tertiary">Attendance</span>
                            <span className="body-small text-foreground-secondary">{course.attendanceRate.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-background rounded-full h-2">
                            <div 
                              className="bg-success-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${course.attendanceRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="heading-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-primary-500" />
              Upcoming Tasks
            </h3>
            <span className="body-small text-foreground-secondary">
              {upcomingTasks.length} tasks
            </span>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="h-12 w-12 text-foreground-tertiary mx-auto mb-3" />
              <p className="body-default text-foreground-secondary">
                No upcoming tasks
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => {
                const IconComponent = getTaskIcon(task.type);
                return (
                  <div key={task.id} className="p-3 bg-background-secondary rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${getPriorityColor(task.priority)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="body-small font-medium text-foreground truncate">
                            {task.title}
                          </h4>
                          <p className="body-small text-foreground-secondary">
                            {task.course}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-11">
                      <p className="body-small text-foreground-tertiary mb-2">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                      
                      {task.progress !== undefined && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="body-small text-foreground-tertiary">Progress</span>
                            <span className="body-small text-foreground-secondary">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-background rounded-full h-1.5">
                            <div 
                              className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="heading-4 flex items-center">
            <FireIcon className="h-5 w-5 mr-2 text-primary-500" />
            Recent Activity
          </h3>
          <span className="body-small text-foreground-secondary">
            Last 24 hours
          </span>
        </div>

        {recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <FireIcon className="h-12 w-12 text-foreground-tertiary mx-auto mb-3" />
            <p className="body-default text-foreground-secondary">
              No recent activity
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start p-4 bg-background-secondary rounded-lg">
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg mr-4 mt-1">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="body-default font-medium text-foreground mb-1">
                      {activity.title}
                    </h4>
                    <p className="body-small text-foreground-secondary mb-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center text-foreground-tertiary">
                      <span className="body-small">
                        {formatRelativeTime(activity.date)}
                      </span>
                      {activity.course && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="body-small">{activity.course}</span>
                        </>
                      )}
                      {activity.student && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="body-small">{activity.student}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="heading-4 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/lecturer/classes'}
            className="btn btn-secondary flex flex-col items-center p-4 h-auto"
          >
            <BookOpenIcon className="h-6 w-6 mb-2" />
            <span className="body-small">Manage Classes</span>
          </button>
          <button 
            onClick={() => window.location.href = '/lecturer/assessments'}
            className="btn btn-secondary flex flex-col items-center p-4 h-auto"
          >
            <AcademicCapIcon className="h-6 w-6 mb-2" />
            <span className="body-small">Grade Assignments</span>
          </button>
          <button 
            onClick={() => window.location.href = '/lecturer/chat'}
            className="btn btn-secondary flex flex-col items-center p-4 h-auto"
          >
            <ChatBubbleLeftRightIcon className="h-6 w-6 mb-2" />
            <span className="body-small">Student Messages</span>
          </button>
          <button 
            onClick={() => window.location.href = '/lecturer/resources'}
            className="btn btn-secondary flex flex-col items-center p-4 h-auto"
          >
            <DocumentIcon className="h-6 w-6 mb-2" />
            <span className="body-small">Upload Resources</span>
          </button>
        </div>
      </div>
    </div>
  );
}