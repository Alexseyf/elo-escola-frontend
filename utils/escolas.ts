import { api } from '@/lib/api';
import { CreateSchoolInput } from '@/types/escola';

export const getSchools = async () => {
  return await api('/api/v1/platform/schools', {
    method: 'GET',
  });
};

export const createSchool = async (data: CreateSchoolInput) => {
  const response = await api('/api/v1/schools', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
        'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }

  return response.json();
};
