import api from '../config';
import { AssignmentSessionsResponse } from '../../types/assignment';

export const assignmentService = {
  getAssignmentSessions: async (lectureId: number): Promise<AssignmentSessionsResponse> => {
    const response = await api.get<AssignmentSessionsResponse>(
      `/api/assignment/sessions/${lectureId}`
    );
    return response.data;
  },
}; 