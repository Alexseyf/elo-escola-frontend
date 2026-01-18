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

export const updateSchool = async (id: number, data: Partial<CreateSchoolInput>) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const { adminUser, ...updateData } = data as any;
  const response = await api(`/api/v1/schools/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
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

export const deleteSchool = async (id: number) => {
  const response = await api(`/api/v1/schools/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
     if (response.status === 204) return;
     try {
        const errorData = await response.json();
        throw errorData;
     } catch (e) { // eslint-disable-line @typescript-eslint/no-unused-vars
        throw new Error('Erro ao deletar escola');
     }
  }
};
