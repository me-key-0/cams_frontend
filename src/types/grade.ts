export interface GradeReport {
  courseCode: string;
  courseName: string;
  creditHour: number;
  finalGrade: number;
}

export type GradeReportResponse = GradeReport[];

export const calculateGradePoint = (finalGrade: number): string => {
  if (finalGrade >= 90) return "4.0";
  if (finalGrade >= 85) return "3.75";
  if (finalGrade >= 80) return "3.5";
  if (finalGrade >= 75) return "3.0";
  if (finalGrade >= 70) return "2.75";
  if (finalGrade >= 65) return "2.5";
  if (finalGrade >= 60) return "2.0";
  return "0.0";
};

export const calculateLetterGrade = (finalGrade: number): string => {
  if (finalGrade >= 90) return "A+";
  if (finalGrade >= 85) return "A";
  if (finalGrade >= 80) return "A-";
  if (finalGrade >= 75) return "B+";
  if (finalGrade >= 70) return "B";
  if (finalGrade >= 65) return "B-";
  if (finalGrade >= 60) return "C+";
  if (finalGrade >= 55) return "C";
  if (finalGrade >= 50) return "C-";
  if (finalGrade >= 45) return "D+";
  if (finalGrade >= 40) return "D";
  return "F";
}; 