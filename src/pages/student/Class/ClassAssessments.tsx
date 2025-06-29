import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import {
  ClipboardDocumentListIcon,
  DocumentIcon,
  ClockIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../../stores/authStore";
import api from "../../../api/config";

interface Assessment {
  id: number;
  title: string;
  description: string;
  type: "INDIVIDUAL" | "GROUP";
  dueDate: string;
  createdAt: string;
  maxScore: number;
  status: "DRAFT" | "PUBLISHED";
  lecturerName: string;
  attachments: Array<{
    id: number;
    title: string;
    fileName: string;
    downloadUrl: string;
  }>;
  submissionCount: number;
  isOverdue: boolean;
  mySubmission?: {
    id: number;
    content: string;
    submittedAt: string;
    status: "SUBMITTED" | "GRADED";
    score?: number;
    feedback?: string;
    isLate: boolean;
    attachments: Array<{
      id: number;
      title: string;
      fileName: string;
      downloadUrl: string;
    }>;
  };
}

interface AssessmentOverview {
  courseSessionId: number;
  courseCode: string;
  courseName: string;
  assessments: Assessment[];
  totalAssessments: number;
  completedAssessments: number;
  pendingAssessments: number;
  overallGrade: number;
  overallLetterGrade: string;
}

const statusConfig = {
  pending: {
    color: "text-warning-600",
    bgColor: "bg-warning-50 dark:bg-warning-900/20",
    borderColor: "border-warning-200 dark:border-warning-800",
    icon: ClockIcon
  },
  submitted: {
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: CheckCircleIcon
  },
  graded: {
    color: "text-success-600",
    bgColor: "bg-success-50 dark:bg-success-900/20",
    borderColor: "border-success-200 dark:border-success-800",
    icon: CheckCircleIcon
  },
  overdue: {
    color: "text-error-600",
    bgColor: "bg-error-50 dark:bg-error-900/20",
    borderColor: "border-error-200 dark:border-error-800",
    icon: ExclamationTriangleIcon
  }
};

export default function ClassAssessments() {
  const { ClassId } = useParams();
  const { classDetails } = useOutletContext<{ classDetails: any }>();
  const { user } = useAuthStore();
  const [assessmentOverview, setAssessmentOverview] = useState<AssessmentOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!ClassId || !user?.id) {
          setError("Missing required information to load assessments.");
          return;
        }

        // Fetch student's assessment overview for this course session
        const response = await api.get(`/api/grades/grading/my-assessments/course-session/${ClassId}`);
        
        // Validate response data
        if (!response.data) {
          console.warn('No data received from assessments API');
          setAssessmentOverview(null);
          return;
        }

        // Ensure assessments array exists and is valid
        const data = response.data;
        const validatedData: AssessmentOverview = {
          courseSessionId: data.courseSessionId || parseInt(ClassId),
          courseCode: data.courseCode || classDetails?.code || '',
          courseName: data.courseName || classDetails?.name || '',
          assessments: Array.isArray(data.assessments) ? data.assessments.map((assessment: any) => ({
            ...assessment,
            attachments: Array.isArray(assessment.attachments) ? assessment.attachments : [],
            mySubmission: assessment.mySubmission ? {
              ...assessment.mySubmission,
              attachments: Array.isArray(assessment.mySubmission.attachments) ? assessment.mySubmission.attachments : []
            } : undefined
          })) : [],
          totalAssessments: data.totalAssessments || 0,
          completedAssessments: data.completedAssessments || 0,
          pendingAssessments: data.pendingAssessments || 0,
          overallGrade: data.overallGrade || 0,
          overallLetterGrade: data.overallLetterGrade || 'N/A'
        };

        setAssessmentOverview(validatedData);
      } catch (err: any) {
        console.error('Error fetching assessments:', err);
        
        if (err.response?.status === 404) {
          setError("No assessments found for this course.");
        } else if (err.response?.status === 403) {
          setError("You don't have permission to view assessments for this course.");
        } else {
          setError("Failed to load assessments. Please try again later.");
        }
        
        // Set null on error to prevent further issues
        setAssessmentOverview(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [ClassId, user?.id, classDetails]);

  const getAssessmentStatus = (assessment: Assessment) => {
    if (assessment.isOverdue && !assessment.mySubmission) {
      return 'overdue';
    }
    if (assessment.mySubmission?.status === 'GRADED') {
      return 'graded';
    }
    if (assessment.mySubmission?.status === 'SUBMITTED') {
      return 'submitted';
    }
    return 'pending';
  };

  const handleDownloadAttachment = async (downloadUrl: string, fileName: string) => {
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading attachment:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-error p-4 rounded-lg">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          <p className="body-default">{error}</p>
        </div>
      </div>
    );
  }

  if (!assessmentOverview || !assessmentOverview.assessments || assessmentOverview.assessments.length === 0) {
    return (
      <div className="card text-center py-12">
        <ClipboardDocumentListIcon className="h-16 w-16 text-foreground-tertiary mx-auto mb-4" />
        <h3 className="heading-4 mb-2">No Assessments Found</h3>
        <p className="body-default text-foreground-secondary">
          No assessments have been published for this course yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading-3 flex items-center">
            <ClipboardDocumentListIcon className="h-6 w-6 mr-2 text-primary-500" />
            Class Assessments
          </h2>
          <p className="body-default text-foreground-secondary mt-1">
            Track your assignments, projects, and grades
          </p>
        </div>
        <div className="text-right">
          <div className="body-small text-foreground-secondary">Overall Grade</div>
          <div className="heading-4 text-primary-600">
            {assessmentOverview.overallGrade.toFixed(1)}% ({assessmentOverview.overallLetterGrade})
          </div>
        </div>
      </div>

      {/* Grade Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <AcademicCapIcon className="h-8 w-8 text-primary-500 mx-auto mb-2" />
          <div className="heading-4 text-primary-600">{assessmentOverview.overallGrade.toFixed(1)}%</div>
          <div className="body-small text-foreground-secondary">Overall Grade</div>
        </div>
        
        <div className="card text-center">
          <div className="heading-4 text-foreground">{assessmentOverview.totalAssessments}</div>
          <div className="body-small text-foreground-secondary">Total Assessments</div>
        </div>
        
        <div className="card text-center">
          <div className="heading-4 text-success-600">{assessmentOverview.completedAssessments}</div>
          <div className="body-small text-foreground-secondary">Completed</div>
        </div>
        
        <div className="card text-center">
          <div className="heading-4 text-warning-600">{assessmentOverview.pendingAssessments}</div>
          <div className="body-small text-foreground-secondary">Pending</div>
        </div>
      </div>

      {/* Assessments List */}
      <div className="space-y-4">
        {assessmentOverview.assessments.map((assessment) => {
          const status = getAssessmentStatus(assessment);
          const config = statusConfig[status];
          const IconComponent = config.icon;
          
          // Ensure attachments is always an array
          const attachments = Array.isArray(assessment.attachments) ? assessment.attachments : [];
          const submissionAttachments = assessment.mySubmission?.attachments && Array.isArray(assessment.mySubmission.attachments) 
            ? assessment.mySubmission.attachments 
            : [];
          
          return (
            <div key={assessment.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-lg ${config.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="heading-4">{assessment.title}</h3>
                      <span className={`
                        px-3 py-1 rounded-full text-sm font-medium capitalize
                        ${config.bgColor} ${config.color}
                      `}>
                        {status === 'pending' && assessment.isOverdue ? 'Overdue' : status}
                      </span>
                    </div>
                    
                    <p className="body-default text-foreground-secondary mb-3">
                      {assessment.description}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-foreground-secondary">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span className="body-small">
                          Due: {new Date(assessment.dueDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-foreground-secondary">
                        <AcademicCapIcon className="h-4 w-4 mr-2" />
                        <span className="body-small">Max Score: {assessment.maxScore}</span>
                      </div>
                      
                      <div className="flex items-center text-foreground-secondary">
                        <DocumentIcon className="h-4 w-4 mr-2" />
                        <span className="body-small capitalize">{assessment.type.toLowerCase()}</span>
                      </div>
                    </div>

                    {/* Attachments */}
                    {attachments.length > 0 && (
                      <div className="mb-4">
                        <h4 className="body-small font-medium text-foreground mb-2">Attachments:</h4>
                        <div className="space-y-2">
                          {attachments.map((attachment) => (
                            <button
                              key={attachment.id}
                              onClick={() => handleDownloadAttachment(attachment.downloadUrl, attachment.fileName)}
                              className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              <PaperClipIcon className="h-4 w-4 mr-2" />
                              <span className="body-small">{attachment.title}</span>
                              <ArrowDownTrayIcon className="h-4 w-4 ml-2" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submission Info */}
                    {assessment.mySubmission && (
                      <div className={`p-4 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
                        <h4 className="body-default font-medium mb-2">Your Submission</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="body-small text-foreground-secondary">Submitted:</span>
                            <div className="body-small">
                              {new Date(assessment.mySubmission.submittedAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {assessment.mySubmission.isLate && (
                                <span className="text-warning-600 ml-2">(Late)</span>
                              )}
                            </div>
                          </div>
                          
                          {assessment.mySubmission.score !== undefined && (
                            <div>
                              <span className="body-small text-foreground-secondary">Grade:</span>
                              <div className="body-default font-medium">
                                {assessment.mySubmission.score}/{assessment.maxScore}
                                <span className="text-foreground-secondary ml-2">
                                  ({((assessment.mySubmission.score / assessment.maxScore) * 100).toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {assessment.mySubmission.feedback && (
                          <div>
                            <span className="body-small text-foreground-secondary">Feedback:</span>
                            <p className="body-small mt-1">{assessment.mySubmission.feedback}</p>
                          </div>
                        )}
                        
                        {submissionAttachments.length > 0 && (
                          <div className="mt-3">
                            <span className="body-small text-foreground-secondary">Your Files:</span>
                            <div className="mt-1 space-y-1">
                              {submissionAttachments.map((attachment) => (
                                <button
                                  key={attachment.id}
                                  onClick={() => handleDownloadAttachment(attachment.downloadUrl, attachment.fileName)}
                                  className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                  <PaperClipIcon className="h-3 w-3 mr-1" />
                                  <span className="body-small">{attachment.title}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}