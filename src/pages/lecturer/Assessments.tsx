import { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  DocumentIcon,
  ClockIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: "assignment" | "project";
  deadline: string;
  maxScore: number;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  submissions: {
    [key: string]: {
      studentId: string;
      studentName: string;
      submittedAt: string;
      status: "submitted" | "late" | "not_submitted";
      score?: number;
      feedback?: string;
      attachments?: {
        name: string;
        url: string;
        type: string;
      }[];
    };
  };
}

// Mock data - replace with actual API calls
const mockAssessments: Assessment[] = [
  {
    id: "1",
    title: "Programming Assignment 1",
    description: "Create a simple calculator application using React",
    type: "assignment",
    deadline: "2024-03-20T23:59:59",
    maxScore: 100,
    attachments: [
      {
        name: "Assignment1.pdf",
        url: "/mock-url/assignment1.pdf",
        type: "pdf",
      },
    ],
    submissions: {
      "1": {
        studentId: "1",
        studentName: "John Doe",
        submittedAt: "2024-03-19T15:30:00",
        status: "submitted",
        score: 85,
        feedback: "Good implementation, but could improve error handling",
        attachments: [
          {
            name: "calculator.zip",
            url: "/mock-url/calculator.zip",
            type: "zip",
          },
        ],
      },
      "2": {
        studentId: "2",
        studentName: "Jane Smith",
        submittedAt: "2024-03-21T10:15:00",
        status: "late",
        score: 75,
        feedback: "Late submission, but implementation is solid",
        attachments: [
          {
            name: "calculator.zip",
            url: "/mock-url/calculator.zip",
            type: "zip",
          },
        ],
      },
    },
  },
  {
    id: "2",
    title: "Final Project",
    description: "Build a full-stack web application of your choice",
    type: "project",
    deadline: "2024-04-15T23:59:59",
    maxScore: 100,
    attachments: [
      {
        name: "ProjectGuidelines.pdf",
        url: "/mock-url/project-guidelines.pdf",
        type: "pdf",
      },
    ],
    submissions: {},
  },
];

const defaultNotificationTemplates = [
  "Your assignment is due soon. Please submit it before the deadline.",
  "Your submission is late. Please submit it as soon as possible.",
  "Great work on your submission! Keep up the good work.",
  "Your submission needs improvement. Please review the feedback.",
];

export default function LecturerAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>(mockAssessments);
  const [isCreating, setIsCreating] = useState(false);
  const [newAssessment, setNewAssessment] = useState<Partial<Assessment>>({
    title: "",
    description: "",
    type: "assignment",
    deadline: "",
    maxScore: 100,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(
    null
  );
  const [notificationMessage, setNotificationMessage] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newAssessment.title &&
      newAssessment.description &&
      newAssessment.deadline
    ) {
      const assessment: Assessment = {
        id: Date.now().toString(),
        title: newAssessment.title,
        description: newAssessment.description,
        type: newAssessment.type as "assignment" | "project",
        deadline: newAssessment.deadline,
        maxScore: newAssessment.maxScore || 100,
        submissions: {},
      };
      setAssessments([...assessments, assessment]);
      setIsCreating(false);
      setNewAssessment({
        title: "",
        description: "",
        type: "assignment",
        deadline: "",
        maxScore: 100,
      });
      setSelectedFiles([]);
    }
  };

  const handleDelete = (id: string) => {
    setAssessments(assessments.filter((a) => a.id !== id));
  };

  const handleSendNotification = (assessmentId: string) => {
    // Handle sending notification to selected students
    setSelectedStudents([]);
    setNotificationMessage("");
  };

  const handleUpdateSubmission = (
    assessmentId: string,
    studentId: string,
    score: number,
    feedback: string
  ) => {
    setAssessments(
      assessments.map((assessment) => {
        if (assessment.id === assessmentId) {
          return {
            ...assessment,
            submissions: {
              ...assessment.submissions,
              [studentId]: {
                ...assessment.submissions[studentId],
                score,
                feedback,
              },
            },
          };
        }
        return assessment;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Assessments</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Assessment
        </button>
      </div>

      {/* Create Assessment Form */}
      {isCreating && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Create New Assessment
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newAssessment.title}
                onChange={(e) =>
                  setNewAssessment({ ...newAssessment, title: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={newAssessment.description}
                onChange={(e) =>
                  setNewAssessment({
                    ...newAssessment,
                    description: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Type
                </label>
                <select
                  id="type"
                  value={newAssessment.type}
                  onChange={(e) =>
                    setNewAssessment({
                      ...newAssessment,
                      type: e.target.value as "assignment" | "project",
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-gray-700"
                >
                  Deadline
                </label>
                <input
                  type="datetime-local"
                  id="deadline"
                  value={newAssessment.deadline}
                  onChange={(e) =>
                    setNewAssessment({
                      ...newAssessment,
                      deadline: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="maxScore"
                className="block text-sm font-medium text-gray-700"
              >
                Maximum Score
              </label>
              <input
                type="number"
                id="maxScore"
                min="0"
                value={newAssessment.maxScore}
                onChange={(e) =>
                  setNewAssessment({
                    ...newAssessment,
                    maxScore: Number(e.target.value),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Attachments
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Attachments
                </label>
                {selectedFiles.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    {selectedFiles.length} file(s) selected
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Create Assessment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assessments List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {assessments.map((assessment) => (
            <li key={assessment.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentIcon className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {assessment.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {assessment.description}
                      </p>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <span className="mr-4">
                          {assessment.type === "assignment"
                            ? "Assignment"
                            : "Project"}
                        </span>
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>
                          Due: {new Date(assessment.deadline).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedAssessment(assessment.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      View Submissions
                    </button>
                    <button
                      onClick={() => handleDelete(assessment.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Submissions Section */}
              {selectedAssessment === assessment.id && (
                <div className="px-4 py-4 sm:px-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Submissions
                    </h4>
                    <div className="flex items-center space-x-2">
                      <select
                        value={notificationMessage}
                        onChange={(e) => setNotificationMessage(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="">Select a template</option>
                        {defaultNotificationTemplates.map((template) => (
                          <option key={template} value={template}>
                            {template}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleSendNotification(assessment.id)}
                        disabled={selectedStudents.length === 0}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        <BellIcon className="h-4 w-4 mr-1" />
                        Send Notification
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted At
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Feedback
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.values(assessment.submissions).map(
                          (submission) => (
                            <tr key={submission.studentId}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedStudents.includes(
                                      submission.studentId
                                    )}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedStudents([
                                          ...selectedStudents,
                                          submission.studentId,
                                        ]);
                                      } else {
                                        setSelectedStudents(
                                          selectedStudents.filter(
                                            (id) => id !== submission.studentId
                                          )
                                        );
                                      }
                                    }}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  />
                                  <span className="ml-2">
                                    {submission.studentName}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    submission.status === "submitted"
                                      ? "bg-green-100 text-green-800"
                                      : submission.status === "late"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {submission.status === "submitted" ? (
                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                  ) : submission.status === "late" ? (
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                  ) : (
                                    <XCircleIcon className="h-4 w-4 mr-1" />
                                  )}
                                  {submission.status
                                    .split("_")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1)
                                    )
                                    .join(" ")}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(
                                  submission.submittedAt
                                ).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {submission.score || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {submission.feedback || "-"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
