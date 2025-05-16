import { useState } from "react";

interface Schedule {
  id: string;
  ClassCode: string;
  ClassName: string;
  instructor: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  startTime: string;
  endTime: string;
  room: string;
  semester: string;
  yearLevel: string;
}

const mockSchedules: Schedule[] = [
  {
    id: "1",
    ClassCode: "CS101",
    ClassName: "Introduction to Programming",
    instructor: "Dr. John Smith",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:30",
    room: "Room 101",
    yearLevel: "1st Year",
    semester: "1st Semester",
  },
  {
    id: "2",
    ClassCode: "MATH201",
    ClassName: "Calculus II",
    instructor: "Prof. Sarah Johnson",
    day: "Tuesday",
    startTime: "11:00",
    endTime: "12:30",
    room: "Room 202",
    yearLevel: "1st Year",
    semester: "1st Semester",
  },
  {
    id: "3",
    ClassCode: "PHYS101",
    ClassName: "Physics I",
    instructor: "Dr. Michael Brown",
    day: "Wednesday",
    startTime: "14:00",
    endTime: "15:30",
    room: "Room 303",
    yearLevel: "1st Year",
    semester: "2nd Semester",
  },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = Array.from({ length: 14 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

export default function Schedules() {
 const [selectedYear, setSelectedYear] = useState("1st Year");
const [selectedSemester, setSelectedSemester] = useState("1st Semester");

const filteredSchedules = mockSchedules.filter(
  (schedule) =>
    schedule.yearLevel === selectedYear && schedule.semester === selectedSemester
);

  return (
    <div className="space-y-6">
      {/* Semester Selection */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Class Schedule
            </h3>
            <div className="flex items-center space-x-4">
              {/* Year Dropdown */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="min-w-[130px] pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              {/* Semester Dropdown */}
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="min-w-[150px] pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {["1st Semester", "2nd Semester"].map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Time
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map((time) => (
                <tr key={time}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {time}
                  </td>
                  {days.map((day) => {
                    const schedule = filteredSchedules.find(
                      (s) => s.day === day && s.startTime === time
                    );
                    return (
                      <td key={`${day}-${time}`} className="px-6 py-4">
                        {schedule && (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {schedule.ClassCode}
                            </div>
                            <div className="text-gray-500">
                              {schedule.ClassName}
                            </div>
                            <div className="text-gray-500">
                              {schedule.instructor}
                            </div>
                            <div className="text-gray-500">{schedule.room}</div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Schedule Legend
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSchedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-4 w-4 rounded-full bg-primary-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {schedule.ClassCode} - {schedule.ClassName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {schedule.day} {schedule.startTime}-{schedule.endTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
