import { useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface CourseInput {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

const gradePoints: { [key: string]: number } = {
  "A+": 4.0,
  A: 3.7,
  "A-": 3.3,
  "B+": 3.0,
  B: 2.7,
  "B-": 2.3,
  "C+": 2.0,
  C: 1.7,
  "C-": 1.3,
  "D+": 1.0,
  D: 0.7,
  F: 0.0,
};

const grades = Object.keys(gradePoints);

export default function GPACalculator() {
  const [courses, setCourses] = useState<CourseInput[]>([
    { id: "1", name: "", credits: 0, grade: "A" },
  ]);

  const addCourse = () => {
    setCourses([
      ...courses,
      {
        id: Date.now().toString(),
        name: "",
        credits: 0,
        grade: "A",
      },
    ]);
  };

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses(courses.filter((course) => course.id !== id));
    }
  };

  const updateCourse = (
    id: string,
    field: keyof CourseInput,
    value: string | number
  ) => {
    setCourses(
      courses.map((course) =>
        course.id === id ? { ...course, [field]: value } : course
      )
    );
  };

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach((course) => {
      if (course.credits > 0) {
        totalPoints += gradePoints[course.grade] * course.credits;
        totalCredits += course.credits;
      }
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            GPA Calculator
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Enter your courses and grades to calculate your GPA.</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {courses.map((course) => (
              <div key={course.id} className="flex items-start space-x-4">
                <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor={`course-name-${course.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Course Name
                    </label>
                    <input
                      type="text"
                      id={`course-name-${course.id}`}
                      value={course.name}
                      onChange={(e) =>
                        updateCourse(course.id, "name", e.target.value)
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="e.g., Introduction to Programming"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`credits-${course.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Credits
                    </label>
                    <input
                      type="number"
                      id={`credits-${course.id}`}
                      value={course.credits}
                      onChange={(e) =>
                        updateCourse(
                          course.id,
                          "credits",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`grade-${course.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Grade
                    </label>
                    <select
                      id={`grade-${course.id}`}
                      value={course.grade}
                      onChange={(e) =>
                        updateCourse(course.id, "grade", e.target.value)
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      {grades.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {courses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCourse(course.id)}
                    className="mt-8 inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={addCourse}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Course
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Calculated GPA
            </h3>
            <span className="text-3xl font-bold text-primary-600">
              {calculateGPA()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
