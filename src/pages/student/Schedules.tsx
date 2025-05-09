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
}

// Mock data - replace with actual API calls
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
    semester: "Spring 2024",
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
    semester: "Spring 2024",
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
    semester: "Spring 2024",
  },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = Array.from({ length: 14 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

export default function Schedules() {
  const [selectedSemester, setSelectedSemester] = useState("Spring 2024");

  const filteredSchedules = mockSchedules.filter(
    (schedule) => schedule.semester === selectedSemester
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
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="Spring 2024">Spring 2024</option>
              <option value="Fall 2023">Fall 2023</option>
            </select>
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
