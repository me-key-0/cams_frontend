import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../../stores/authStore";
import api from "../../../api/config";

interface GradeType {
  id: number;
  name: string;
  description: string;
  maxScore: number;
  weightPercentage: number;
  category: "QUIZ" | "ASSIGNMENT" | "MIDTERM" | "FINAL" | "PROJECT";
  courseSessionId: number;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
}

interface Grade {
  id: number;
  studentId: number;
  gradeTypeId: number;
  score: number;
  feedback?: string;
  gradedAt: string;
}

interface GradebookEntry {
  student: Student;
  grades: { [gradeTypeId: number]: Grade };
  totalGrade: number;
  letterGrade: string;
}

export default function LecturerClassesGrades() {
  const { classId } = useParams();
  const { classDetails } = useOutletContext<{ classDetails: any }>();
  const { lecturer } = useAuthStore();
  
  const [gradeTypes, setGradeTypes] = useState<GradeType[]>([]);
  const [gradebook, setGradebook] = useState<GradebookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingGradeType, setIsAddingGradeType] = useState(false);
  const [editingGrade, setEditingGrade] = useState<{
    studentId: number;
    gradeTypeId: number;
    score: number;
    feedback: string;
  } | null>(null);
  
  const [newGradeType, setNewGradeType] = useState({
    name: "",
    description: "",
    maxScore: 100,
    weightPercentage: 0,
    category: "ASSIGNMENT" as GradeType["category"],
  });

  useEffect(() => {
    const fetchGradingData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!classId) {
          setError("Course session ID is required.");
          return;
        }

        // Fetch grade types for this course session
        const gradeTypesResponse = await api.get(`/api/grades/grading/grade-types/course-session/${classId}`);
        const gradeTypesData = gradeTypesResponse.data || [];
        setGradeTypes(gradeTypesData);

        // Fetch gradebook data
        const gradebookResponse = await api.get(`/api/grades/grading/gradebook/course-session/${classId}`);
        const gradebookData = gradebookResponse.data || [];
        setGradebook(gradebookData);

      } catch (err: any) {
        console.error('Error fetching grading data:', err);
        if (err.response?.status === 404) {
          setError("No grading data found for this course session.");
        } else {
          setError("Failed to load grading data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGradingData();
  }, [classId]);

  const handleCreateGradeType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gradeTypeData = {
        ...newGradeType,
        courseSessionId: parseInt(classId!),
      };

      const response = await api.post('/api/grades/grading/grade-types', gradeTypeData);
      setGradeTypes([...gradeTypes, response.data]);
      setIsAddingGradeType(false);
      setNewGradeType({
        name: "",
        description: "",
        maxScore: 100,
        weightPercentage: 0,
        category: "ASSIGNMENT",
      });
    } catch (err) {
      console.error('Error creating grade type:', err);
      setError('Failed to create grade type.');
    }
  };

  const handleCreateDefaultGradeTypes = async () => {
    try {
      await api.post(`/api/grades/grading/grade-types/course-session/${classId}/defaults`);
      // Refresh grade types
      const response = await api.get(`/api/grades/grading/grade-types/course-session/${classId}`);
      setGradeTypes(response.data || []);
    } catch (err) {
      console.error('Error creating default grade types:', err);
      setError('Failed to create default grade types.');
    }
  };

  const handleUpdateGrade = async () => {
    if (!editingGrade) return;

    try {
      const gradeData = {
        studentId: editingGrade.studentId,
        gradeTypeId: editingGrade.gradeTypeId,
        score: editingGrade.score,
        feedback: editingGrade.feedback,
      };

      await api.post('/api/grades/grading/grades', gradeData);
      
      // Update local gradebook
      setGradebook(gradebook.map(entry => {
        if (entry.student.id === editingGrade.studentId) {
          const updatedGrades = {
            ...entry.grades,
            [editingGrade.gradeTypeId]: {
              id: entry.grades[editingGrade.gradeTypeId]?.id || 0,
              studentId: editingGrade.studentId,
              gradeTypeId: editingGrade.gradeTypeId,
              score: editingGrade.score,
              feedback: editingGrade.feedback,
              gradedAt: new Date().toISOString(),
            }
          };
          
          // Recalculate total grade
          const totalGrade = calculateTotalGrade(updatedGrades);
          
          return {
            ...entry,
            grades: updatedGrades,
            totalGrade,
            letterGrade: calculateLetterGrade(totalGrade),
          };
        }
        return entry;
      }));
      
      setEditingGrade(null);
    } catch (err) {
      console.error('Error updating grade:', err);
      setError('Failed to update grade.');
    }
  };

  const calculateTotalGrade = (grades: { [gradeTypeId: number]: Grade }): number => {
    let totalPoints = 0;
    let totalWeight = 0;

    gradeTypes.forEach(gradeType => {
      const grade = grades[gradeType.id];
      if (grade) {
        const percentage = (grade.score / gradeType.maxScore) * 100;
        totalPoints += percentage * (gradeType.weightPercentage / 100);
        totalWeight += gradeType.weightPercentage;
      }
    });

    return totalWeight > 0 ? (totalPoints / totalWeight) * 100 : 0;
  };

  const calculateLetterGrade = (totalGrade: number): string => {
    if (totalGrade >= 90) return "A+";
    if (totalGrade >= 85) return "A";
    if (totalGrade >= 80) return "A-";
    if (totalGrade >= 75) return "B+";
    if (totalGrade >= 70) return "B";
    if (totalGrade >= 65) return "B-";
    if (totalGrade >= 60) return "C+";
    if (totalGrade >= 55) return "C";
    if (totalGrade >= 50) return "C-";
    if (totalGrade >= 45) return "D+";
    if (totalGrade >= 40) return "D";
    return "F";
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
            Student Grades
          </h2>
          <p className="body-default text-foreground-secondary mt-1">
            Manage grades and assessments for {classDetails?.code}
          </p>
        </div>
        <div className="flex gap-2">
          {gradeTypes.length === 0 && (
            <button
              onClick={handleCreateDefaultGradeTypes}
              className="btn btn-secondary"
            >
              Create Default Grade Types
            </button>
          )}
          <button
            onClick={() => setIsAddingGradeType(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Grade Type
          </button>
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

      {/* Add Grade Type Form */}
      {isAddingGradeType && (
        <div className="card">
          <h3 className="heading-4 mb-4">Add New Grade Type</h3>
          <form onSubmit={handleCreateGradeType} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newGradeType.name}
                  onChange={(e) => setNewGradeType({ ...newGradeType, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  value={newGradeType.category}
                  onChange={(e) => setNewGradeType({ ...newGradeType, category: e.target.value as GradeType["category"] })}
                  className="input"
                >
                  <option value="QUIZ">Quiz</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="MIDTERM">Midterm</option>
                  <option value="FINAL">Final</option>
                  <option value="PROJECT">Project</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={newGradeType.description}
                onChange={(e) => setNewGradeType({ ...newGradeType, description: e.target.value })}
                className="input"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Maximum Score
                </label>
                <input
                  type="number"
                  value={newGradeType.maxScore}
                  onChange={(e) => setNewGradeType({ ...newGradeType, maxScore: Number(e.target.value) })}
                  className="input"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Weight Percentage
                </label>
                <input
                  type="number"
                  value={newGradeType.weightPercentage}
                  onChange={(e) => setNewGradeType({ ...newGradeType, weightPercentage: Number(e.target.value) })}
                  className="input"
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingGradeType(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Grade Type
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grades Table */}
      {gradeTypes.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                    Student
                  </th>
                  {gradeTypes.map((gradeType) => (
                    <th
                      key={gradeType.id}
                      className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div>{gradeType.name}</div>
                          <div className="text-xs text-foreground-tertiary">
                            {gradeType.weightPercentage}% • Max: {gradeType.maxScore}
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                    Total Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {gradebook.map((entry) => (
                  <tr key={entry.student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {entry.student.firstName} {entry.student.lastName}
                        </div>
                        <div className="text-sm text-foreground-secondary">
                          ID: {entry.student.studentId}
                        </div>
                      </div>
                    </td>
                    {gradeTypes.map((gradeType) => (
                      <td key={gradeType.id} className="px-6 py-4 whitespace-nowrap">
                        {editingGrade?.studentId === entry.student.id &&
                        editingGrade?.gradeTypeId === gradeType.id ? (
                          <div className="space-y-2">
                            <input
                              type="number"
                              value={editingGrade.score}
                              onChange={(e) =>
                                setEditingGrade({
                                  ...editingGrade,
                                  score: Number(e.target.value),
                                })
                              }
                              className="w-20 input text-sm"
                              min="0"
                              max={gradeType.maxScore}
                            />
                            <input
                              type="text"
                              value={editingGrade.feedback}
                              onChange={(e) =>
                                setEditingGrade({
                                  ...editingGrade,
                                  feedback: e.target.value,
                                })
                              }
                              className="w-full input text-sm"
                              placeholder="Feedback (optional)"
                            />
                            <div className="flex space-x-1">
                              <button
                                onClick={handleUpdateGrade}
                                className="p-1 text-success-600 hover:text-success-700"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingGrade(null)}
                                className="p-1 text-error-600 hover:text-error-700"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-background-secondary p-2 rounded"
                            onClick={() =>
                              setEditingGrade({
                                studentId: entry.student.id,
                                gradeTypeId: gradeType.id,
                                score: entry.grades[gradeType.id]?.score || 0,
                                feedback: entry.grades[gradeType.id]?.feedback || "",
                              })
                            }
                          >
                            <div className="text-sm font-medium">
                              {entry.grades[gradeType.id]?.score || "-"} / {gradeType.maxScore}
                            </div>
                            {entry.grades[gradeType.id]?.feedback && (
                              <div className="text-xs text-foreground-secondary">
                                {entry.grades[gradeType.id].feedback}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        {entry.totalGrade.toFixed(1)}% ({entry.letterGrade})
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <AcademicCapIcon className="h-16 w-16 text-foreground-tertiary mx-auto mb-4" />
          <h3 className="heading-4 mb-2">No Grade Types Found</h3>
          <p className="body-default text-foreground-secondary mb-4">
            Create grade types to start managing student grades.
          </p>
          <button
            onClick={handleCreateDefaultGradeTypes}
            className="btn btn-primary"
          >
            Create Default Grade Types
          </button>
        </div>
      )}
    </div>
  );
}