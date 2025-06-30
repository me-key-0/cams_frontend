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
  PaperAirplaneIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../../stores/authStore";
import { assignmentService, Assignment, AssignmentSubmission, SubmitAssignmentRequest } from "../../../api/services/assignmentService";
import toast from "react-hot-toast";

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
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<{ [key: number]: AssignmentSubmission }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingTo, setSubmittingTo] = useState<number | null>(null);
  const [submissionData, setSubmissionData] = useState<SubmitAssignmentRequest>({
    assignmentId: 0,
    content: ""
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ClassId) {
      fetchAssignments();
    }
  }, [ClassId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!ClassId || !user?.id) {
        setError("Missing required information to load assignments.");
        return;
      }

      // Fetch assignments for this course session
      const assignmentsData = await assignmentService.getAssignmentsByCourseSession(parseInt(ClassId));
      
      // Filter only published assignments for students
      const publishedAssignments = assignmentsData.filter(assignment => assignment.status === 'PUBLISHED');
      setAssignments(publishedAssignments);

      // Fetch submissions for each assignment
      const submissionsMap: { [key: number]: AssignmentSubmission } = {};
      for (const assignment of publishedAssignments) {
        try {
          const submission = await assignmentService.getMySubmissionForAssignment(assignment.id);
          if (submission) {
            submissionsMap[assignment.id] = submission;
          }
        } catch (err) {
          console.warn(`Failed to fetch submission for assignment ${assignment.id}`);
        }
      }
      setSubmissions(submissionsMap);

    } catch (err: any) {
      console.error('Error fetching assignments:', err);
      setError("Failed to load assignments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (assignment: Assignment) => {
    const submission = submissions[assignment.id];
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (submission?.status === 'GRADED') {
      return 'graded';
    }
    if (submission?.status === 'SUBMITTED') {
      return 'submitted';
    }
    if (now > dueDate) {
      return 'overdue';
    }
    return 'pending';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
      
      if (validFiles.length !== files.length) {
        toast.error('Some files were too large (max 10MB per file)');
      }
      
      setSelectedFiles(validFiles);
    }
  };

  const handleSubmitAssignment = async (assignmentId: number) => {
    if (!submissionData.content?.trim() && selectedFiles.length === 0) {
      toast.error('Please provide either content or attach files');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const submission = await assignmentService.submitAssignment(
        { ...submissionData, assignmentId },
        selectedFiles.length > 0 ? selectedFiles : undefined
      );

      setSubmissions(prev => ({ ...prev, [assignmentId]: submission }));
      setSubmittingTo(null);
      setSubmissionData({ assignmentId: 0, content: "" });
      setSelectedFiles([]);
      
      toast.success('Assignment submitted successfully!');
    } catch (err) {
      console.error('Error submitting assignment:', err);
      toast.error('Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadAttachment = async (downloadUrl: string, fileName: string) => {
    try {
      await assignmentService.downloadAttachment(downloadUrl, fileName);
      toast.success('Download started');
    } catch (err) {
      console.error('Error downloading attachment:', err);
      toast.error('Failed to download file');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
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

  if (assignments.length === 0) {
    return (
      <div className="card text-center py-12">
        <ClipboardDocumentListIcon className="h-16 w-16 text-foreground-tertiary mx-auto mb-4" />
        <h3 className="heading-4 mb-2">No Assignments Found</h3>
        <p className="body-default text-foreground-secondary">
          No assignments have been published for this course yet.
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
            Assignments
          </h2>
          <p className="body-default text-foreground-secondary mt-1">
            View and submit your course assignments
          </p>
        </div>
        <div className="text-right">
          <div className="body-small text-foreground-secondary">Total Assignments</div>
          <div className="heading-4 text-primary-600">{assignments.length}</div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-6">
        {assignments.map((assignment) => {
          const status = getAssignmentStatus(assignment);
          const config = statusConfig[status];
          const IconComponent = config.icon;
          const submission = submissions[assignment.id];
          
          return (
            <div key={assignment.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-lg ${config.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="heading-4">{assignment.title}</h3>
                      <span className={`
                        px-3 py-1 rounded-full text-sm font-medium capitalize
                        ${config.bgColor} ${config.color}
                      `}>
                        {status === 'pending' && assignment.isOverdue ? 'Overdue' : status}
                      </span>
                    </div>
                    
                    <p className="body-default text-foreground-secondary mb-4">
                      {assignment.description}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-foreground-secondary">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span className="body-small">
                          Due: {formatDate(assignment.dueDate)}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-foreground-secondary">
                        <AcademicCapIcon className="h-4 w-4 mr-2" />
                        <span className="body-small">Max Score: {assignment.maxScore}</span>
                      </div>
                      
                      <div className="flex items-center text-foreground-secondary">
                        <DocumentIcon className="h-4 w-4 mr-2" />
                        <span className="body-small capitalize">{assignment.type.toLowerCase()}</span>
                      </div>
                    </div>

                    {/* Assignment Attachments */}
                    {assignment.attachments.length > 0 && (
                      <div className="mb-4">
                        <h4 className="body-small font-medium text-foreground mb-2">Assignment Files:</h4>
                        <div className="space-y-2">
                          {assignment.attachments.map((attachment) => (
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

                    {/* Submission Section */}
                    {submission ? (
                      <div className={`p-4 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
                        <h4 className="body-default font-medium mb-2">Your Submission</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="body-small text-foreground-secondary">Submitted:</span>
                            <div className="body-small">
                              {formatDate(submission.submittedAt)}
                              {submission.isLate && (
                                <span className="text-warning-600 ml-2">(Late)</span>
                              )}
                            </div>
                          </div>
                          
                          {submission.score !== undefined && (
                            <div>
                              <span className="body-small text-foreground-secondary">Grade:</span>
                              <div className="body-default font-medium">
                                {submission.score}/{assignment.maxScore}
                                <span className="text-foreground-secondary ml-2">
                                  ({((submission.score / assignment.maxScore) * 100).toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {submission.content && (
                          <div className="mb-3">
                            <span className="body-small text-foreground-secondary">Content:</span>
                            <p className="body-small mt-1">{submission.content}</p>
                          </div>
                        )}
                        
                        {submission.feedback && (
                          <div className="mb-3">
                            <span className="body-small text-foreground-secondary">Feedback:</span>
                            <p className="body-small mt-1">{submission.feedback}</p>
                          </div>
                        )}
                        
                        {submission.attachments.length > 0 && (
                          <div>
                            <span className="body-small text-foreground-secondary">Your Files:</span>
                            <div className="mt-1 space-y-1">
                              {submission.attachments.map((attachment) => (
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
                    ) : (
                      // Submission Form
                      <div>
                        {submittingTo === assignment.id ? (
                          <div className="space-y-4 p-4 bg-background-secondary rounded-lg">
                            <div className="flex justify-between items-center">
                              <h4 className="body-default font-medium">Submit Assignment</h4>
                              <button
                                onClick={() => {
                                  setSubmittingTo(null);
                                  setSubmissionData({ assignmentId: 0, content: "" });
                                  setSelectedFiles([]);
                                }}
                                className="text-foreground-secondary hover:text-foreground"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">
                                Content (Optional)
                              </label>
                              <textarea
                                value={submissionData.content}
                                onChange={(e) => setSubmissionData({ ...submissionData, content: e.target.value })}
                                rows={4}
                                className="input"
                                placeholder="Enter any additional comments or explanations..."
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">
                                Attach Files
                              </label>
                              <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="input"
                                accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
                              />
                              <p className="body-small text-foreground-tertiary mt-1">
                                Max 10MB per file. Supported formats: PDF, DOC, TXT, ZIP, Images
                              </p>
                            </div>
                            
                            {selectedFiles.length > 0 && (
                              <div>
                                <h5 className="body-small font-medium text-foreground mb-2">Selected Files:</h5>
                                <div className="space-y-2">
                                  {selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                                      <span className="body-small text-foreground">{file.name}</span>
                                      <button
                                        onClick={() => removeFile(index)}
                                        className="text-error-600 hover:text-error-700"
                                      >
                                        <XMarkIcon className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => {
                                  setSubmittingTo(null);
                                  setSubmissionData({ assignmentId: 0, content: "" });
                                  setSelectedFiles([]);
                                }}
                                className="btn btn-secondary"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSubmitAssignment(assignment.id)}
                                disabled={isSubmitting || (!submissionData.content?.trim() && selectedFiles.length === 0)}
                                className="btn btn-primary"
                              >
                                {isSubmitting ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                  </div>
                                ) : (
                                  <>
                                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                                    Submit Assignment
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSubmittingTo(assignment.id);
                              setSubmissionData({ assignmentId: assignment.id, content: "" });
                            }}
                            disabled={assignment.isOverdue}
                            className={`btn ${assignment.isOverdue ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'}`}
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            {assignment.isOverdue ? 'Overdue' : 'Submit Assignment'}
                          </button>
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