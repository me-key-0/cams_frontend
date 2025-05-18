interface Course {
  code: string;
  name: string;
  creditHour: number;
}

export interface EnrollmentSession {
  id: number;
  academicYear: number;
  semester: number;
  year: number;
  course: Course;
  lecturerName: string;
}

export type EnrollmentSessionsResponse = EnrollmentSession[]; 