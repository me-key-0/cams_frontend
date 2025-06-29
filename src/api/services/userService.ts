import api from '../config';

// interface LecturerDto {
//   id: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   department: string;
// }

export const getLecturerIdFromUserId = async (userId: string): Promise<number | null> => {
  try {
    const response = await api.get(`/api/users/lecturer/user/${userId}`);
    
    if (response.data) {
      return response.data.id;
    }
    return null;
  } catch (error) {
    console.error('Error getting lecturer ID:', error);
    return null;
  }
};
