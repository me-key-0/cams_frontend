interface Course {
  id: number;
  code: string;
  name: string;
  creditHour: number;
  description: string | null;
  departmentId: number | null;
  prerequisites: any[];
}

export interface Assignment {
  id: number;
  academicYear: number;
  semester: number;
  year: number;
  course: Course;
  studentId: number;
  departmentId: number;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
}

export type AssignmentSessionsResponse = Assignment[]; 