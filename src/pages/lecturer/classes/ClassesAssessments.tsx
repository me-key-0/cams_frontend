import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import {
  PlusIcon,
  TrashIcon,
  DocumentIcon,
  ClockIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../../stores/authStore";
import { assignmentService, Assignment, AssignmentSubmission, CreateAssignmentRequest, UpdateAssignmentRequest, GradeSubmissionRequest } from "../../../api/services/assignmentService";
import toast from "react-hot-toast";

export default function ClassesAssessments() {
  const { classId } = useParams();
  const { classDetails } = useOutletContext<{ classDetails: any }>();
  const { lecturer } = useAuthStore();
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<{ [key: number]: AssignmentSubmission[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<number | null>(null);
  const [gradeData, setGradeData] = useState<GradeSubmissionRequest>({ score: 0, feedback: "" });
  
  const [newAssignment, setNewAssignment] = useState<CreateAssignmentRequest>({
    title: "",
    description: "",
    courseSessionId: parseInt(classId!),
    dueDate: "",
    maxScore: 100,
    type: "INDIVIDUAL",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (classId) {
      fetchAssignments();
    }
  }, [classId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!classId || !lecturer?.id) {
        setError("Missing required information to load assignments.");
        return;
      }

      // Fetch assignments for this course session
      const assignmentsData = await assignmentService.getAssignmentsByCourseSession(parseInt(classId));
      setAssignments(assignmentsData);

    } catch (err: any) {
      console.error('Error fetching assignments:', err);
      setError("Failed to load assignments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId: number) => {
    try {
      const submissionsData = await assignmentService.getAssignmentSubmissions(assignmentId);
      setSubmissions(prev => ({ ...prev, [assignmentId]: submissionsData }));
    } catch (err) {
      console.error('Error fetching submissions:', err);
      toast.error('Failed to load submissions');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => file.size <= 25 * 1024 * 1024); // 25MB limit
      
      if (validFiles.length !== files.length) {
        toast.error('Some files were too large (max 25MB per file)');
      }
      
      setSelectedFiles(validFiles);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAssignment.title.trim() || !newAssignment.description.trim() || !newAssignment.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const assignment = await assignmentService.createAssignment(
        newAssignment,
        selectedFiles.length > 0 ? selectedFiles : undefined
      );

      setAssignments([assignment, ...assignments]);
      setIsCreating(false);
      setNewAssignment({
        title: "",
        description: "",
        courseSessionId: parseInt(classId!),
        dueDate: "",
        maxScore: 100,
        type: "INDIVIDUAL",
      });
      setSelectedFiles([]);
      
      toast.success('Assignment created successfully!');
    } catch (err) {
      console.error('Error creating assignment:', err);
      toast.error('Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishAssignment = async (assignmentId: number) => {
    try {
      await assignmentService.publishAssignment(assignmentId);
      setAssignments(assignments.map(a => 
        a.id === assignmentId ? { ...a, status: 'PUBLISHED' } : a
      ));
      toast.success('Assignment published successfully!');
    } catch (err) {
      console.error('Error publishing assignment:', err);
      toast.error('Failed to publish assignment');
    }
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await assignmentService.deleteAssignment(assignmentId);
      setAssignments(assignments.filter(a => a.id !== assignmentId));
      toast.success('Assignment deleted successfully!');
    } catch (err) {
      console.error('Error deleting assignment:', err);
      toast.error('Failed to delete assignment');
    }
  };

  const handleGradeSubmission = async (submissionId: number) => {
    if (gradeData.score < 0) {
      toast.error('Score cannot be negative');
      return;
    }

    try {
      await assignmentService.gradeSubmission(submissionId, gradeData);
      
      // Update local submissions
      setSubmissions(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(assignmentId => {
          updated[parseInt(assignmentId)] = updated[parseInt(assignmentId)].map(sub =>
            sub.id === submissionId 
              ? { ...sub, score: gradeData.score, feedback: gradeData.feedback, status: 'GRADED' as const }
              : sub
          );
        });
        return updated;
      });
      
      setGradingSubmission(null);
      setGradeData({ score: 0, feedback: "" });
      toast.success('Submission graded successfully!');
    } catch (err) {
      console.error('Error grading submission:', err);
      toast.error('Failed to grade submission');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading-3 flex items-center">
            <AcademicCapIcon className="h-6 w-6 mr-2 text-primary-500" />
            Course Assignments
          </h2>
          <p className="body-default text-foreground-secondary mt-1">
            Create and manage assignments for {classDetails?.code}
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Assignment
        </button>
      </div>

      {error && (
        <div className="status-error p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <p className="body-default">{error}</p>
          </div>
        </div>
      )}

      {/* Create Assignment Form */}
      {isCreating && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="heading-4">Create New Assignment</h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-foreground-secondary hover:text-foreground"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleCreateAssignment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="input"
                  placeholder="Assignment title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type
                </label>
                <select
                  value={newAssignment.type}
                  onChange={(e) => setNewAssignment({ ...newAssignment, type: e.target.value as "INDIVIDUAL" | "GROUP" })}
                  className="input"
                >
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="GROUP">Group</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <textarea
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                rows={4}
                className="input"
                placeholder="Assignment description and instructions"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Due Date *
                </label>
                <input
                  type="datetime-local"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Maximum Score
                </label>
                <input
                  type="number"
                  value={newAssignment.maxScore}
                  onChange={(e) => setNewAssignment({ ...newAssignment, maxScore: Number(e.target.value) })}
                  className="input"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Attach Files (Optional)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="input"
                accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
              />
              <p className="body-small text-foreground-tertiary mt-1">
                Max 25MB per file. Attach instructions, templates, or reference materials.
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <div>
                <h5 className="body-small font-medium text-foreground mb-2">Selected Files:</h5>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-background-secondary rounded">
                      <span className="body-small text-foreground">{file.name}</span>
                      <button
                        type="button"
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
                type="button"
                onClick={() => setIsCreating(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="card text-center py-12">
          <DocumentIcon className="h-16 w-16 text-foreground-tertiary mx-auto mb-4" />
          <h3 className="heading-4 mb-2">No Assignments Found</h3>
          <p className="body-default text-foreground-secondary">
            Create your first assignment to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <DocumentIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="heading-4">{assignment.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${assignment.status === 'PUBLISHED' 
                            ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300'
                            : 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300'
                          }
                        `}>
                          {assignment.status}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                          {assignment.type}
                        </span>
                      </div>
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
                        <span className="body-small">{assignment.submissionCount} submissions</span>
                      </div>
                    </div>

                    {/* Assignment Attachments */}
                    {assignment.attachments.length > 0 && (
                      <div className="mb-4">
                        <h4 className="body-small font-medium text-foreground mb-2">Attachments:</h4>
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

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      {assignment.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublishAssignment(assignment.id)}
                          className="btn btn-primary text-sm"
                        >
                          <BellIcon className="h-4 w-4 mr-1" />
                          Publish
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          if (selectedAssignment === assignment.id) {
                            setSelectedAssignment(null);
                          } else {
                            setSelectedAssignment(assignment.id);
                            fetchSubmissions(assignment.id);
                          }
                        }}
                        className="btn btn-secondary text-sm"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Submissions ({assignment.submissionCount})
                      </button>
                      
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="btn btn-danger text-sm"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submissions Section */}
              {selectedAssignment === assignment.id && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="heading-4 mb-4">Student Submissions</h4>
                  
                  {submissions[assignment.id]?.length === 0 ? (
                    <div className="text-center py-8">
                      <DocumentIcon className="h-12 w-12 text-foreground-tertiary mx-auto mb-3" />
                      <p className="body-default text-foreground-secondary">
                        No submissions yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {submissions[assignment.id]?.map((submission) => (
                        <div key={submission.id} className="p-4 bg-background-secondary rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="body-default font-medium text-foreground">
                                {submission.studentName}
                              </h5>
                              <p className="body-small text-foreground-secondary">
                                Submitted: {formatDate(submission.submittedAt)}
                                {submission.isLate && (
                                  <span className="text-warning-600 ml-2">(Late)</span>
                                )}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {submission.status === 'GRADED' ? (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300">
                                  Graded: {submission.score}/{assignment.maxScore}
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300">
                                  Pending Grade
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {submission.content && (
                            <div className="mb-3">
                              <span className="body-small font-medium text-foreground">Content:</span>
                              <p className="body-small text-foreground-secondary mt-1">{submission.content}</p>
                            </div>
                          )}
                          
                          {submission.attachments.length > 0 && (
                            <div className="mb-3">
                              <span className="body-small font-medium text-foreground">Files:</span>
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
                          
                          {submission.feedback && (
                            <div className="mb-3">
                              <span className="body-small font-medium text-foreground">Feedback:</span>
                              <p className="body-small text-foreground-secondary mt-1">{submission.feedback}</p>
                            </div>
                          )}
                          
                          {/* Grading Section */}
                          {gradingSubmission === submission.id ? (
                            <div className="space-y-3 p-3 bg-background rounded border">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-foreground mb-1">
                                    Score (out of {assignment.maxScore})
                                  </label>
                                  <input
                                    type="number"
                                    value={gradeData.score}
                                    onChange={(e) => setGradeData({ ...gradeData, score: Number(e.target.value) })}
                                    className="input text-sm"
                                    min="0"
                                    max={assignment.maxScore}
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                  Feedback (Optional)
                                </label>
                                <textarea
                                  value={gradeData.feedback}
                                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                  rows={3}
                                  className="input text-sm"
                                  placeholder="Provide feedback to the student..."
                                />
                              </div>
                              
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setGradingSubmission(null)}
                                  className="btn btn-secondary text-sm"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleGradeSubmission(submission.id)}
                                  className="btn btn-primary text-sm"
                                >
                                  Save Grade
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setGradingSubmission(submission.id);
                                setGradeData({ 
                                  score: submission.score || 0, 
                                  feedback: submission.feedback || "" 
                                });
                              }}
                              className="btn btn-primary text-sm"
                            >
                              <AcademicCapIcon className="h-4 w-4 mr-1" />
                              {submission.status === 'GRADED' ? 'Update Grade' : 'Grade Submission'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}