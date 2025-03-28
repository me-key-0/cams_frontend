import { useState } from "react";
import {
  UserGroupIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface StudentStats {
  totalStudents: number;
  averageGPA: number;
  attendanceRate: number;
  atRiskStudents: number;
}

interface PerformanceMetric {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down";
}

// Mock data - replace with actual API calls
const mockStats: StudentStats = {
  totalStudents: 45,
  averageGPA: 3.2,
  attendanceRate: 85,
  atRiskStudents: 3,
};

const mockPerformanceMetrics: PerformanceMetric[] = [
  {
    label: "Assignment Completion Rate",
    value: 92,
    change: 5,
    trend: "up",
  },
  {
    label: "Average Quiz Score",
    value: 78,
    change: 2,
    trend: "up",
  },
  {
    label: "Participation Rate",
    value: 65,
    change: 3,
    trend: "down",
  },
  {
    label: "Project Submission Rate",
    value: 88,
    change: 7,
    trend: "up",
  },
];

export default function LecturerDashboard() {
  const [stats] = useState(mockStats);
  const [metrics] = useState(mockPerformanceMetrics);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total Students
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average GPA</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.averageGPA.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <AcademicCapIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Attendance Rate
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.attendanceRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                At Risk Students
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.atRiskStudents}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Performance Metrics
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">
                    {metric.label}
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      metric.trend === "up"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {metric.trend === "up" ? "+" : "-"}
                    {metric.change}%
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-gray-600">
                        {metric.value}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                    <div
                      style={{ width: `${metric.value}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
