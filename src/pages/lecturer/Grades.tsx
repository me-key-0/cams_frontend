import { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface EvaluationField {
  id: string;
  name: string;
  type: "mid" | "final" | "assignment" | "project";
  percentage: number;
  maxScore: number;
}

interface StudentGrade {
  studentId: string;
  name: string;
  grades: {
    [key: string]: {
      score: number;
      submittedAt: string;
      feedback?: string;
    };
  };
}

// Mock data - replace with actual API calls
const mockEvaluationFields: EvaluationField[] = [
  {
    id: "1",
    name: "Midterm Exam",
    type: "mid",
    percentage: 30,
    maxScore: 100,
  },
  {
    id: "2",
    name: "Final Exam",
    type: "final",
    percentage: 40,
    maxScore: 100,
  },
  {
    id: "3",
    name: "Programming Assignment 1",
    type: "assignment",
    percentage: 15,
    maxScore: 100,
  },
  {
    id: "4",
    name: "Final Project",
    type: "project",
    percentage: 15,
    maxScore: 100,
  },
];

const mockStudents: StudentGrade[] = [
  {
    studentId: "1",
    name: "John Doe",
    grades: {
      "1": { score: 85, submittedAt: "2024-03-15T10:30:00" },
      "2": { score: 90, submittedAt: "2024-03-20T14:15:00" },
      "3": { score: 95, submittedAt: "2024-03-10T09:45:00" },
      "4": { score: 88, submittedAt: "2024-03-25T16:20:00" },
    },
  },
  {
    studentId: "2",
    name: "Jane Smith",
    grades: {
      "1": { score: 92, submittedAt: "2024-03-15T11:15:00" },
      "2": { score: 88, submittedAt: "2024-03-20T15:30:00" },
      "3": { score: 90, submittedAt: "2024-03-10T10:20:00" },
      "4": { score: 95, submittedAt: "2024-03-25T17:00:00" },
    },
  },
];

export default function LecturerGrades() {
  const [evaluationFields, setEvaluationFields] =
    useState<EvaluationField[]>(mockEvaluationFields);
  const [students, setStudents] = useState<StudentGrade[]>(mockStudents);
  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState<Partial<EvaluationField>>({
    name: "",
    type: "assignment",
    percentage: 0,
    maxScore: 100,
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingGrade, setEditingGrade] = useState<{
    studentId: string;
    fieldId: string;
    grade: number;
  } | null>(null);

  const calculateTotalGrade = (student: StudentGrade) => {
    let total = 0;
    let totalPercentage = 0;

    evaluationFields.forEach((field) => {
      const grade = student.grades[field.id];
      if (grade) {
        total += (grade.score / field.maxScore) * field.percentage;
        totalPercentage += field.percentage;
      }
    });

    return totalPercentage > 0 ? (total / totalPercentage) * 100 : 0;
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newField.name &&
      newField.type &&
      newField.percentage &&
      newField.maxScore
    ) {
      const field: EvaluationField = {
        id: Date.now().toString(),
        name: newField.name,
        type: newField.type as EvaluationField["type"],
        percentage: newField.percentage,
        maxScore: newField.maxScore,
      };
      setEvaluationFields([...evaluationFields, field]);
      setIsAddingField(false);
      setNewField({
        name: "",
        type: "assignment",
        percentage: 0,
        maxScore: 100,
      });
    }
  };

  const handleDeleteField = (id: string) => {
    setEvaluationFields(evaluationFields.filter((f) => f.id !== id));
  };

  const handleUpdateGrade = (
    studentId: string,
    fieldId: string,
    grade: number
  ) => {
    setStudents(
      students.map((student) => {
        if (student.studentId === studentId) {
          return {
            ...student,
            grades: {
              ...student.grades,
              [fieldId]: {
                ...student.grades[fieldId],
                score: grade,
                submittedAt: new Date().toISOString(),
              },
            },
          };
        }
        return student;
      })
    );
    setEditingGrade(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Student Grades</h2>
        <button
          onClick={() => setIsAddingField(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Evaluation Field
        </button>
      </div>

      {/* Add Evaluation Field Form */}
      {isAddingField && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Add New Evaluation Field
          </h3>
          <form onSubmit={handleAddField} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={newField.name}
                onChange={(e) =>
                  setNewField({ ...newField, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700"
              >
                Type
              </label>
              <select
                id="type"
                value={newField.type}
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    type: e.target.value as EvaluationField["type"],
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="mid">Midterm</option>
                <option value="final">Final</option>
                <option value="assignment">Assignment</option>
                <option value="project">Project</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="percentage"
                  className="block text-sm font-medium text-gray-700"
                >
                  Percentage
                </label>
                <input
                  type="number"
                  id="percentage"
                  min="0"
                  max="100"
                  value={newField.percentage}
                  onChange={(e) =>
                    setNewField({
                      ...newField,
                      percentage: Number(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
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
                  value={newField.maxScore}
                  onChange={(e) =>
                    setNewField({
                      ...newField,
                      maxScore: Number(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingField(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add Field
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grades Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Student
              </th>
              {evaluationFields.map((field) => (
                <th
                  key={field.id}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center justify-between">
                    <span>{field.name}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingField(field.id)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </th>
              ))}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Grade
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.studentId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.name}
                </td>
                {evaluationFields.map((field) => (
                  <td
                    key={field.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {editingGrade?.studentId === student.studentId &&
                    editingGrade?.fieldId === field.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max={field.maxScore}
                          value={editingGrade.grade}
                          onChange={(e) =>
                            setEditingGrade({
                              ...editingGrade,
                              grade: Number(e.target.value),
                            })
                          }
                          className="w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                        <button
                          onClick={() =>
                            handleUpdateGrade(
                              student.studentId,
                              field.id,
                              editingGrade.grade
                            )
                          }
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingGrade(null)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer"
                        onClick={() =>
                          setEditingGrade({
                            studentId: student.studentId,
                            fieldId: field.id,
                            grade: student.grades[field.id]?.score || 0,
                          })
                        }
                      >
                        {student.grades[field.id]?.score || "-"}
                      </div>
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {calculateTotalGrade(student).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
