import { EnrollmentSession, EnrollmentSessionsResponse } from "../../types/enrollment";
import  api  from "../config";

export const enrollmentService = {
  getEnrollmentSessions: async (
    studentId: number,
    year: number,
    semester: number,
    academicYear: number
  ): Promise<EnrollmentSessionsResponse> => {
    const response = await api.get(
      `/api/enrollment/sessions/${studentId}/${year}/${semester}/${academicYear}`
    );
    return response.data;
  },

  // getEnrollmentSession: async (
  //   studentId: number,
  //   classId: number
  // ): Promise<EnrollmentSession> => {
  //   const response = await api.get(
  //     `/api/enrollment/student/${studentId}/class/${classId}`
  //   );
  //   return response.data;
  // }
}; 