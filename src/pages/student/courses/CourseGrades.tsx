import { useState } from "react";
import { useParams } from "react-router-dom";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

interface Grade {
  id: string;
  title: string;
  type: "midterm" | "final" | "assignment" | "project";
  score: number;
  maxScore: number;
  percentage: number;
  date: string;
  feedback?: string;
}

// Mock data - replace with actual API calls
const mockGrades: Grade[] = [
  {
    id: "1",
    title: "Midterm Exam",
    type: "midterm",
    score: 85,
    maxScore: 100,
    percentage: 20,
    date: "2024-03-15",
    feedback: "Good work! Consider reviewing chapter 3 for the final exam.",
  },
  {
    id: "2",
    title: "Assignment 1",
    type: "assignment",
    score: 18,
    maxScore: 20,
    percentage: 10,
    date: "2024-03-10",
    feedback: "Excellent submission! Your code is well-documented.",
  },
  {
    id: "3",
    title: "Project 1",
    type: "project",
    score: 45,
    maxScore: 50,
    percentage: 15,
    date: "2024-03-20",
    feedback: "Great project! Your implementation is very efficient.",
  },
];

export default function CourseGrades() {
  const { courseId } = useParams();
  const [grades] = useState(mockGrades);

  const calculateTotalGrade = () => {
    return grades.reduce((total, grade) => {
      const gradePercentage = (grade.score / grade.maxScore) * grade.percentage;
      return total + gradePercentage;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Grade Summary */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-primary-500 mr-3" />
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Grade Summary
              </h2>
              <p className="mt-1 text-3xl font-semibold text-primary-600">
                {calculateTotalGrade().toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grades List */}
      <div className="space-y-4">
        {grades.map((grade) => (
          <div
            key={grade.id}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {grade.title}
                </h3>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <span className="capitalize">{grade.type}</span>
                  <span className="mx-2">•</span>
                  <span>{grade.date}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium text-gray-900">
                  {grade.score}/{grade.maxScore}
                </div>
                <div className="text-sm text-gray-500">
                  {grade.percentage}% of total grade
                </div>
              </div>
            </div>

            {grade.feedback && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">{grade.feedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
