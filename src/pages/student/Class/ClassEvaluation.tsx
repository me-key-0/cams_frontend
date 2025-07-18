import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { 
  ClipboardDocumentCheckIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../../stores/authStore';
import api from '../../../api/config';

interface EvaluationQuestion {
  id: number;
  question: string;
  category: {
    id: number;
    name: string;
  };
}

interface EvaluationCategory {
  id: number;
  name: string;
  description: string;
}

interface EvaluationSession {
  id: number;
  courseSessionId: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  courseCode: string;
  courseName: string;
}

interface SubmissionAnswer {
  questionId: number;
  answerId: number;
}

interface EvaluationSubmissionStatus {
  hasSubmitted: boolean;
  submittedAt?: string;
  sessionId?: number;
}

const ratingOptions = [
  { id: 5, label: "Excellent", value: 5, color: "text-green-600" },
  { id: 4, label: "Very Good", value: 4, color: "text-blue-600" },
  { id: 3, label: "Good", value: 3, color: "text-yellow-600" },
  { id: 2, label: "Fair", value: 2, color: "text-orange-600" },
  { id: 1, label: "Poor", value: 1, color: "text-red-600" },
];

const ClassEvaluation: React.FC = () => {
  const { ClassId } = useParams<{ ClassId: string }>();
  const { classDetails } = useOutletContext<{ classDetails: any }>();
  const { user, student } = useAuthStore();
  
  const [evaluationSession, setEvaluationSession] = useState<EvaluationSession | null>(null);
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([]);
  const [categories, setCategories] = useState<EvaluationCategory[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<EvaluationSubmissionStatus>({ hasSubmitted: false });
  const [error, setError] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'inactive' | 'active' | 'not_found'>('inactive');

  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!ClassId || !user?.id || !student?.id) {
          setError("Required information is missing.");
          return;
        }

        // First, check if student has already submitted evaluation for this course session
        await checkSubmissionStatus();

        // If already submitted, don't fetch other data
        const submissionCheck = await checkIfAlreadySubmitted();
        if (submissionCheck.hasSubmitted) {
          setSubmissionStatus(submissionCheck);
          return;
        }

        // Check if there's an active evaluation session
        try {
          const sessionResponse = await api.get(`/api/users/v1/evaluation/session/${ClassId}/status`);
          
          if (sessionResponse.data?.success) {
            setSessionStatus('active');
            setEvaluationSession({
              id: parseInt(ClassId),
              courseSessionId: parseInt(ClassId),
              isActive: true,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              courseCode: classDetails?.code || '',
              courseName: classDetails?.name || ''
            });
          } else {
            setSessionStatus('inactive');
            return;
          }
        } catch (sessionErr: any) {
          console.log('Session check failed:', sessionErr.response?.status);
          
          if (sessionErr.response?.status === 404) {
            setSessionStatus('not_found');
            return;
          } else {
            setSessionStatus('inactive');
          }
        }

        // If we have an active session and no submission, fetch questions and categories
        if (sessionStatus === 'active' || sessionStatus === 'inactive') {
          try {
            // Fetch evaluation questions
            const questionsResponse = await api.get('/api/users/v1/evaluation/questions');
            if (questionsResponse.data && Array.isArray(questionsResponse.data)) {
              setQuestions(questionsResponse.data);
            }

            // Fetch evaluation categories
            const categoriesResponse = await api.get('/api/users/v1/evaluation/categories');
            if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
              setCategories(categoriesResponse.data);
            }
          } catch (dataErr: any) {
            console.error('Error fetching evaluation data:', dataErr);
          }
        }

      } catch (err: any) {
        console.error('Error in fetchEvaluationData:', err);
        setError("Failed to load evaluation data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluationData();
  }, [ClassId, classDetails, user?.id, student?.id]);

  const checkIfAlreadySubmitted = async (): Promise<EvaluationSubmissionStatus> => {
    try {
      if (!ClassId || !student?.id) {
        return { hasSubmitted: false };
      }

      // Check if there's a submission record for this student and course session
      const response = await api.get(`/api/users/v1/evaluation/submission-status/${ClassId}/${student.id}`);
      
      if (response.data?.hasSubmitted) {
        return {
          hasSubmitted: true,
          submittedAt: response.data.submittedAt,
          sessionId: response.data.sessionId
        };
      }
      
      return { hasSubmitted: false };
    } catch (err: any) {
      // If endpoint doesn't exist or returns 404, assume no submission
      if (err.response?.status === 404) {
        return { hasSubmitted: false };
      }
      
      // For other errors, check localStorage as fallback
      const localStorageKey = `evaluation_submitted_${ClassId}_${student?.id}`;
      const localSubmission = localStorage.getItem(localStorageKey);
      
      if (localSubmission) {
        const submissionData = JSON.parse(localSubmission);
        return {
          hasSubmitted: true,
          submittedAt: submissionData.submittedAt,
          sessionId: submissionData.sessionId
        };
      }
      
      return { hasSubmitted: false };
    }
  };

  const checkSubmissionStatus = async () => {
    const status = await checkIfAlreadySubmitted();
    setSubmissionStatus(status);
  };

  const handleAnswerChange = (questionId: number, answerId: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError("Please answer all questions before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const submissionAnswers: SubmissionAnswer[] = Object.entries(answers).map(([questionId, answerId]) => ({
        questionId: parseInt(questionId),
        answerId: answerId
      }));

      await api.post('/api/users/v1/evaluation/submit', {
        lecturerId: 1, // This should be fetched from the course session
        courseSessionId: parseInt(ClassId!),
        answers: submissionAnswers
      });

      // Mark as submitted in state and localStorage
      const submissionData = {
        hasSubmitted: true,
        submittedAt: new Date().toISOString(),
        sessionId: parseInt(ClassId!)
      };
      
      setSubmissionStatus(submissionData);
      
      // Store in localStorage as backup
      const localStorageKey = `evaluation_submitted_${ClassId}_${student?.id}`;
      localStorage.setItem(localStorageKey, JSON.stringify(submissionData));

    } catch (err: any) {
      console.error('Error submitting evaluation:', err);
      setError(err.response?.data?.message || "Failed to submit evaluation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    return questions.length > 0 && questions.every(q => answers[q.id]);
  };

  const getCompletionPercentage = () => {
    if (questions.length === 0) return 0;
    const answeredQuestions = Object.keys(answers).length;
    return Math.round((answeredQuestions / questions.length) * 100);
  };

  const formatSubmissionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show confirmation page if already submitted
  if (submissionStatus.hasSubmitted) {
    return (
      <div className="text-center py-12">
        <CheckCircleIcon className="h-20 w-20 text-success-500 mx-auto mb-6" />
        <h3 className="heading-2 mb-4">Evaluation Already Submitted!</h3>
        <p className="body-default text-foreground-secondary mb-6">
          You have successfully submitted your evaluation for this course.
        </p>
        
        <div className="max-w-md mx-auto">
          <div className="status-success p-6 rounded-lg">
            <div className="text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="body-small font-medium">Course:</span>
                <span className="body-small">{classDetails?.code} - {classDetails?.name}</span>
              </div>
              
              {submissionStatus.submittedAt && (
                <div className="flex items-center justify-between">
                  <span className="body-small font-medium">Submitted:</span>
                  <span className="body-small">{formatSubmissionDate(submissionStatus.submittedAt)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="body-small font-medium">Status:</span>
                <span className="body-small font-medium text-success-700">Completed</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-background-secondary rounded-lg">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <p className="body-small font-medium mb-2">Thank you for your feedback!</p>
                <ul className="body-small space-y-1 text-foreground-secondary">
                  <li>• Your responses help improve the quality of education</li>
                  <li>• Evaluations are anonymous and confidential</li>
                  <li>• Results are used for course and instructor improvement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle different session states
  if (sessionStatus === 'not_found' || sessionStatus === 'inactive') {
    return (
      <div className="text-center py-12">
        <ClockIcon className="h-16 w-16 text-warning-500 mx-auto mb-4" />
        <h3 className="heading-4 mb-2">Evaluation Not Available</h3>
        <p className="body-default text-foreground-secondary mb-6">
          {sessionStatus === 'not_found' 
            ? "No evaluation session has been created for this course yet."
            : "The evaluation period for this course is currently inactive."
          }
        </p>
        <div className="status-info p-4 rounded-lg max-w-md mx-auto">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-left">
              <p className="body-small font-medium mb-2">What does this mean?</p>
              <ul className="body-small space-y-1 text-foreground-secondary">
                <li>• Evaluation periods are activated by course administrators</li>
                <li>• You'll be notified when evaluation becomes available</li>
                <li>• Check back later or contact your instructor for updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !evaluationSession) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-16 w-16 text-error-500 mx-auto mb-4" />
        <h3 className="heading-4 mb-2">Error Loading Evaluation</h3>
        <p className="body-default text-foreground-secondary mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If no questions are available, show a message
  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardDocumentCheckIcon className="h-16 w-16 text-foreground-tertiary mx-auto mb-4" />
        <h3 className="heading-4 mb-2">No Evaluation Questions Available</h3>
        <p className="body-default text-foreground-secondary">
          Evaluation questions have not been set up for this course yet.
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
            <ClipboardDocumentCheckIcon className="h-6 w-6 mr-2 text-primary-500" />
            Course Evaluation
          </h2>
          <p className="body-default text-foreground-secondary mt-1">
            Help us improve by sharing your feedback about this course
          </p>
        </div>
        <div className="text-right">
          <div className="body-small text-foreground-secondary">Progress</div>
          <div className="heading-4 text-primary-600">{getCompletionPercentage()}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-background-secondary rounded-full h-2">
        <div 
          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${getCompletionPercentage()}%` }}
        ></div>
      </div>

      {/* Course Information */}
      <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
          <div>
            <h4 className="body-default font-medium text-primary-900 dark:text-primary-100">
              {classDetails?.code} - {classDetails?.name}
            </h4>
            <p className="body-small text-primary-700 dark:text-primary-300 mt-1">
              Instructor: {classDetails?.instructor} | Credits: {classDetails?.credits}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="status-error p-4 rounded-lg">
          <p className="body-default">{error}</p>
        </div>
      )}

      {/* Evaluation Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {categories.map((category) => {
          const categoryQuestions = questions.filter(q => q.category.id === category.id);
          
          if (categoryQuestions.length === 0) return null;

          return (
            <div key={category.id} className="card">
              <div className="mb-6">
                <h3 className="heading-4 text-primary-600 mb-2">{category.name}</h3>
                <p className="body-small text-foreground-secondary">{category.description}</p>
              </div>

              <div className="space-y-6">
                {categoryQuestions.map((question) => (
                  <div key={question.id} className="space-y-3">
                    <h4 className="body-default font-medium text-foreground">
                      {question.question}
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {ratingOptions.map((option) => (
                        <label
                          key={option.id}
                          className={`
                            flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200
                            ${answers[question.id] === option.id
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-border hover:border-primary-300 hover:bg-background-secondary'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.id}
                            checked={answers[question.id] === option.id}
                            onChange={() => handleAnswerChange(question.id, option.id)}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className={`body-small font-medium ${option.color}`}>
                              {option.value}
                            </div>
                            <div className="caption mt-1">{option.label}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-border">
          <button
            type="submit"
            disabled={!isFormValid() || submitting}
            className="btn btn-primary px-8 py-3 text-base"
          >
            {submitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              "Submit Evaluation"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassEvaluation;