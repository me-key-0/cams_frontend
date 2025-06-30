import { useState, useEffect } from "react";
import {
  AcademicCapIcon,
  CalendarIcon,
  BookOpenIcon,
  ClockIcon,
  ChartBarIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TrophyIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../stores/authStore";
import { communicationService } from "../../api/services/communicationService";
import { enrollmentService } from "../../api/services/enrollmentService";
import { gradeService } from "../../api/services/gradeService";
import api from "../../api/config";

interface DashboardStats {
  currentGPA: number;
  totalCourses: number;
  completedCourses: number;
  upcomingDeadlines: number;
  unreadAnnouncements: number;
  totalCredits: number;
  semesterProgress: number;
}

interface RecentActivity {
  id: string;
  type: 'grade' | 'announcement' | 'assignment' | 'resource';
  title: string;
  description: string;
  date: string;
  status?: 'success' | 'warning' | 'info';
}

interface UpcomingEvent {
  id: string;
  title: string;
  type: 'exam' | 'assignment' | 'class' | 'deadline';
  date: string;
  course: string;
  priority: 'high' | 'medium' | 'low';
}

interface CourseProgress {
  courseCode: string;
  courseName: string;
  progress: number;
  grade: number;
  status: 'excellent' | 'good' | 'average' | 'needs_attention';
}

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    currentGPA: 0,
    totalCourses: 0,
    completedCourses: 0,
    upcomingDeadlines: 0,
    unreadAnnouncements: 0,
    totalCredits: 0,
    semesterProgress: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        setError("User not authenticated");
        return;
      }

      // Fetch data in parallel from available APIs
      const [
        unreadCount,
        enrollmentData,
        gradeData,
        announcements,
        assessmentOverview,
      ] = await Promise.all([
        communicationService.getUnreadAnnouncementCount().catch(() => 0),
        enrollmentService.getEnrollmentSessions(
          parseInt(user.id.toString()),
          1, // Current year
          1, // Current semester
          new Date().getFullYear()
        ).catch(() => []),
        gradeService.getGradeReports(
          parseInt(user.id.toString()),
          1,
          1
        ).catch(() => []),
        communicationService.getAnnouncements().catch(() => []),
        // Try to get assessment overview for current semester
        api.get(`/api/grades/grading/my-assessments/course-session/1`).catch(() => ({ data: null })),
      ]);

      // Calculate stats from real data
      const totalCourses = enrollmentData.length;
      const totalCredits = enrollmentData.reduce((sum, course) => sum + course.course.creditHour, 0);
      const averageGrade = gradeData.length > 0 
        ? gradeData.reduce((sum, grade) => sum + grade.finalGrade, 0) / gradeData.length 
        : 0;
      const gpa = calculateGPA(averageGrade);

      // Calculate semester progress (based on current date)
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const semesterStart = currentMonth < 6 ? 0 : 6; // Jan-Jun = 1st semester, Jul-Dec = 2nd semester
      const monthsInSemester = 6;
      const monthsCompleted = currentMonth - semesterStart + 1;
      const semesterProgress = Math.min(100, Math.round((monthsCompleted / monthsInSemester) * 100));

      // Count pending assessments from assessment overview
      const pendingAssessments = assessmentOverview.data?.pendingAssessments || 0;

      setStats({
        currentGPA: gpa,
        totalCourses,
        completedCourses: gradeData.length,
        upcomingDeadlines: pendingAssessments,
        unreadAnnouncements: unreadCount,
        totalCredits,
        semesterProgress,
      });

      // Set course progress from real enrollment and grade data
      const progressData: CourseProgress[] = enrollmentData.map(course => {
        const grade = gradeData.find(g => g.courseCode === course.course.code);
        const gradeValue = grade?.finalGrade || 0;
        // Calculate progress based on semester progress and grade availability
        const progress = grade ? 100 : semesterProgress;
        return {
          courseCode: course.course.code,
          courseName: course.course.name,
          progress,
          grade: gradeValue,
          status: getGradeStatus(gradeValue),
        };
      });
      setCourseProgress(progressData);

      // Create recent activities from announcements and other data
      const activities: RecentActivity[] = [];
      
      // Add recent announcements
      announcements.slice(0, 2).forEach((announcement, index) => {
        activities.push({
          id: `announcement-${announcement.id}`,
          type: 'announcement',
          title: 'New Announcement',
          description: announcement.title,
          date: announcement.createdAt,
          status: 'info',
        });
      });

      // Add grade activities if available
      if (gradeData.length > 0) {
        activities.push({
          id: 'grade-latest',
          type: 'grade',
          title: 'Grade Available',
          description: `${gradeData[0].courseCode} - Final Grade: ${gradeData[0].finalGrade}%`,
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'success',
        });
      }

      // Add assessment reminder if there are pending assessments
      if (pendingAssessments > 0) {
        activities.push({
          id: 'assessment-reminder',
          type: 'assignment',
          title: 'Pending Assessments',
          description: `You have ${pendingAssessments} pending assessments`,
          date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          status: 'warning',
        });
      }

      setRecentActivities(activities);

      // Create upcoming events from course data
      const events: UpcomingEvent[] = [];
      
      // Add course-based events
      enrollmentData.slice(0, 3).forEach((course, index) => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + (index + 1) * 2);
        
        events.push({
          id: `event-${course.id}`,
          title: index === 0 ? 'Upcoming Class' : index === 1 ? 'Assignment Due' : 'Lab Session',
          type: index === 0 ? 'class' : index === 1 ? 'assignment' : 'class',
          date: futureDate.toISOString(),
          course: course.course.code,
          priority: index === 1 ? 'high' : 'medium',
        });
      });

      setUpcomingEvents(events);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const calculateGPA = (averageGrade: number): number => {
    if (averageGrade >= 90) return 4.0;
    if (averageGrade >= 85) return 3.7;
    if (averageGrade >= 80) return 3.3;
    if (averageGrade >= 75) return 3.0;
    if (averageGrade >= 70) return 2.7;
    if (averageGrade >= 65) return 2.3;
    if (averageGrade >= 60) return 2.0;
    return 0.0;
  };

  const getGradeStatus = (grade: number): CourseProgress['status'] => {
    if (grade >= 85) return 'excellent';
    if (grade >= 75) return 'good';
    if (grade >= 65) return 'average';
    return 'needs_attention';
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
      case 'grade': return AcademicCapIcon;
      case 'announcement': return BellIcon;
      case 'assignment': return ClockIcon;
      case 'resource': return BookOpenIcon;
      default: return CheckCircleIcon;
    }
  };

  const getEventIcon = (type: UpcomingEvent['type']) => {
    switch (type) {
      case 'exam': return AcademicCapIcon;
      case 'assignment': return ClockIcon;
      case 'class': return BookOpenIcon;
      case 'deadline': return ExclamationTriangleIcon;
      default: return CalendarIcon;
    }
  };

  const getPriorityColor = (priority: UpcomingEvent['priority']) => {
    switch (priority) {
      case 'high': return 'text-error-600 bg-error-50 dark:bg-error-900/20';
      case 'medium': return 'text-warning-600 bg-warning-50 dark:bg-warning-900/20';
      case 'low': return 'text-success-600 bg-success-50 dark:bg-success-900/20';
      default: return 'text-primary-600 bg-primary-50 dark:bg-primary-900/20';
    }
  };

  const getStatusColor = (status: CourseProgress['status']) => {
    switch (status) {
      case 'excellent': return 'text-success-600 bg-success-500';
      case 'good': return 'text-blue-600 bg-blue-500';
      case 'average': return 'text-warning-600 bg-warning-500';
      case 'needs_attention': return 'text-error-600 bg-error-500';
      default: return 'text-primary-600 bg-primary-500';
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
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="body-default text-primary-700 dark:text-primary-300 mt-2">
              Here's what's happening with your studies today
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
          <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
            <AcademicCapIcon className="h-8 w-8 text-primary-600" />
          </div>
          <div className="heading-3 text-primary-600 mb-1">{stats.currentGPA.toFixed(2)}</div>
          <div className="body-small text-foreground-secondary">Current GPA</div>
          <div className="flex items-center justify-center mt-2">
            {stats.currentGPA >= 3.5 ? (
              <ArrowTrendingUpIcon className="h-4 w-4 text-success-600 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 text-warning-600 mr-1" />
            )}
            <span className={`body-small ${stats.currentGPA >= 3.5 ? 'text-success-600' : 'text-warning-600'}`}>
              {stats.currentGPA >= 3.5 ? 'Excellent' : 'Keep improving'}
            </span>
          </div>
        </div>

        <div className="card text-center group hover:shadow-medium transition-all duration-200">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
            <BookOpenIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="heading-3 text-blue-600 mb-1">{stats.totalCourses}</div>
          <div className="body-small text-foreground-secondary">Enrolled Courses</div>
          <div className="body-small text-foreground-tertiary mt-2">
            {stats.totalCredits} total credits
          </div>
        </div>

        <div className="card text-center group hover:shadow-medium transition-all duration-200">
          <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
            <ClockIcon className="h-8 w-8 text-warning-600" />
          </div>
          <div className="heading-3 text-warning-600 mb-1">{stats.upcomingDeadlines}</div>
          <div className="body-small text-foreground-secondary">Pending Assessments</div>
          <div className="body-small text-warning-600 mt-2">Requires attention</div>
        </div>

        <div className="card text-center group hover:shadow-medium transition-all duration-200">
          <div className="p-3 bg-success-50 dark:bg-success-900/20 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
            <ChartBarIcon className="h-8 w-8 text-success-600" />
          </div>
          <div className="heading-3 text-success-600 mb-1">{stats.semesterProgress}%</div>
          <div className="body-small text-foreground-secondary">Semester Progress</div>
          <div className="w-full bg-background-secondary rounded-full h-2 mt-2">
            <div 
              className="bg-success-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.semesterProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Progress */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="heading-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-primary-500" />
                Course Progress
              </h3>
              <span className="body-small text-foreground-secondary">
                {courseProgress.length} courses
              </span>
            </div>

            {courseProgress.length === 0 ? (
              <div className="text-center py-8">
                <BookOpenIcon className="h-12 w-12 text-foreground-tertiary mx-auto mb-3" />
                <p className="body-default text-foreground-secondary">
                  No course data available
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {courseProgress.map((course) => (
                  <div key={course.courseCode} className="p-4 bg-background-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="body-default font-medium text-foreground">
                          {course.courseCode} - {course.courseName}
                        </h4>
                        <p className="body-small text-foreground-secondary">
                          Current Grade: {course.grade > 0 ? `${course.grade}%` : 'Not graded yet'}
                        </p>
                      </div>
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${getStatusColor(course.status)}
                      `}>
                        {course.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getStatusColor(course.status).split(' ')[1]}`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="body-small text-foreground-tertiary">Progress</span>
                      <span className="body-small text-foreground-secondary">{Math.round(course.progress)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="heading-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-primary-500" />
              Upcoming Events
            </h3>
            <span className="body-small text-foreground-secondary">
              Next 7 days
            </span>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-foreground-tertiary mx-auto mb-3" />
              <p className="body-default text-foreground-secondary">
                No upcoming events
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const IconComponent = getEventIcon(event.type);
                return (
                  <div key={event.id} className="flex items-center p-3 bg-background-secondary rounded-lg">
                    <div className={`p-2 rounded-lg mr-3 ${getPriorityColor(event.priority)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="body-small font-medium text-foreground truncate">
                        {event.title}
                      </h4>
                      <p className="body-small text-foreground-secondary">
                        {event.course} • {new Date(event.date).toLocaleDateString()}
                      </p>
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
                  <div className={`
                    p-2 rounded-lg mr-4 mt-1
                    ${activity.status === 'success' ? 'bg-success-50 dark:bg-success-900/20 text-success-600' :
                      activity.status === 'warning' ? 'bg-warning-50 dark:bg-warning-900/20 text-warning-600' :
                      'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                    }
                  `}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="body-default font-medium text-foreground mb-1">
                      {activity.title}
                    </h4>
                    <p className="body-small text-foreground-secondary mb-2">
                      {activity.description}
                    </p>
                    <span className="body-small text-foreground-tertiary">
                      {formatRelativeTime(activity.date)}
                    </span>
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
            onClick={() => window.location.href = '/student/class'}
            className="btn btn-secondary flex flex-col items-center p-4 h-auto"
          >
            <BookOpenIcon className="h-6 w-6 mb-2" />
            <span className="body-small">View Classes</span>
          </button>
          <button 
            onClick={() => window.location.href = '/student/grades'}
            className="btn btn-secondary flex flex-col items-center p-4 h-auto"
          >
            <AcademicCapIcon className="h-6 w-6 mb-2" />
            <span className="body-small">Check Grades</span>
          </button>
          <button 
            onClick={() => window.location.href = '/student/schedules'}
            className="btn btn-secondary flex flex-col items-center p-4 h-auto"
          >
            <CalendarIcon className="h-6 w-6 mb-2" />
            <span className="body-small">View Schedule</span>
          </button>
          <button 
            onClick={() => window.location.href = '/student/announcements'}
            className="btn btn-secondary flex flex-col items-center p-4 h-auto"
          >
            <BellIcon className="h-6 w-6 mb-2" />
            <span className="body-small">Announcements</span>
            {stats.unreadAnnouncements > 0 && (
              <span className="bg-error-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mt-1">
                {stats.unreadAnnouncements}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}