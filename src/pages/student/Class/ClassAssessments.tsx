import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  ClipboardDocumentListIcon,
  DocumentIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface Assessment {
  id: string;
  title: string;
  type: "assignment" | "project" | "quiz";
  description: string;
  dueDate: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  status: "pending" | "submitted" | "graded";
  grade?: {
    score: number;
    maxScore: number;
    feedback?: string;
  };
}

// Mock data - replace with actual API calls
const mockAssessments: Assessment[] = [
  {
    id: "1",
    title: "Programming Assignment 2",
    type: "assignment",
    description:
      "Implement a binary search tree with the following operations: insert, delete, search, and inorder traversal.",
    dueDate: "2024-04-05",
    attachments: [
      {
        name: "Assignment2.pdf",
        url: "/mock-url/assignment2.pdf",
        type: "pdf",
      },
    ],
    status: "pending",
  },
  {
    id: "2",
    title: "Group Project: Web Application",
    type: "project",
    description:
      "Develop a full-stack web application using React and Node.js. The application should include user authentication, database integration, and RESTful API endpoints.",
    dueDate: "2024-04-15",
    attachments: [
      {
        name: "ProjectGuidelines.pdf",
        url: "/mock-url/project.pdf",
        type: "pdf",
      },
    ],
    status: "submitted",
    grade: {
      score: 85,
      maxScore: 100,
      feedback:
        "Good work! Consider adding more error handling and documentation.",
    },
  },
  {
    id: "3",
    title: "Quiz 3: Data Structures",
    type: "quiz",
    description:
      "Multiple choice questions covering arrays, linked lists, and stacks.",
    dueDate: "2024-03-30",
    status: "graded",
    grade: {
      score: 18,
      maxScore: 20,
      feedback:
        "Excellent performance! You have a strong understanding of the concepts.",
    },
  },
];

export default function ClassAssessments() {
  const { ClassId } = useParams();
  const [assessments] = useState(mockAssessments);

  const getStatusColor = (status: Assessment["status"]) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "submitted":
        return "text-blue-600 bg-blue-100";
      case "graded":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          Class Assessments
        </h2>
        <div className="flex items-center text-sm text-gray-500">
          <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
          {assessments.length} total
        </div>
      </div>

      <div className="space-y-4">
        {assessments.map((assessment) => (
          <div
            key={assessment.id}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {assessment.title}
                  </h3>
                  <span
                    className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      assessment.status
                    )}`}
                  >
                    {assessment.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {assessment.description}
                </p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Due: {assessment.dueDate}
                </div>
              </div>
              <div className="ml-4">
                {assessment.attachments && (
                  <div className="flex items-center text-sm text-gray-500">
                    <DocumentIcon className="h-4 w-4 mr-1" />
                    {assessment.attachments.length} attachment
                    {assessment.attachments.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>

            {assessment.grade && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Grade: {assessment.grade.score}/
                      {assessment.grade.maxScore}
                    </p>
                    {assessment.grade.feedback && (
                      <p className="mt-1 text-sm text-gray-500">
                        {assessment.grade.feedback}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
