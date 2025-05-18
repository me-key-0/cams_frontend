import api from '../config';
import { GradeReportResponse } from '../../types/grade';

export const gradeService = {
  getGradeReports: async (
    studentId: number,
    year: number,
    semester: number
  ): Promise<GradeReportResponse> => {
    const response = await api.get<GradeReportResponse>(
      `/api/grades/grade_reports/student/${studentId}/${year}/${semester}`
    );
    return response.data;
  },
}; 