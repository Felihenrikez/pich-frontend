import axios, { AxiosError } from "axios";
import type { Schedule } from "../models/Schedule.ts";

// Crear una instancia de axios para reutilizar configuración base
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10_000, // 10 segundos
});

export const ScheduleService = {
  getAll: async (): Promise<Schedule[]> => {
    try {
      const response = await apiClient.get<Schedule[]>('/schedules');
      return response.data;
    } catch (error) {
      return handleError(error, 'Error fetching schedules');
    }
  },
  getById: async (id: string): Promise<Schedule> => {
    try {
      const response = await apiClient.get<Schedule>(`/schedules/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error, `Error fetching schedule with id ${id}`);
    }
  },
  getAllFiltered: async (
    date?: string,
    time?: string
  ): Promise<Schedule[]> => {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (time) params.append('time', time);

      const response = await apiClient.get<Schedule[]>('/schedules', {
        params: Object.fromEntries(params),
      });
      return response.data;
    } catch (error) {
      return handleError(error, 'Error fetching filtered schedules');
    }
  },
  create: async (schedule: Schedule): Promise<Schedule> => {
    try {
      const response = await apiClient.post('/schedules', schedule);
      return response.data;
    } catch (error) {
      return handleError(error, 'Error creating schedule');
    }
  },
  createBulk: async (schedules: Schedule[]): Promise<Schedule[]> => {
    try {
      const response = await apiClient.post('/schedules/bulk', schedules);
      return response.data;
    } catch (error) {
      return handleError(error, 'Error creating schedules in bulk');
    }
  },
  update: async (id: string, schedule: Partial<Schedule>): Promise<Schedule> => {
    try {
      const response = await apiClient.put(`/schedules/${id}`, schedule);
      return response.data;
    } catch (error) {
      return handleError(error, `Error updating schedule with id ${id}`);
    }
  },
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/schedules/${id}`);
    } catch (error) {
      return handleError(error, `Error deleting schedule with id ${id}`);
    }
  }
};

// Función auxiliar para manejar errores
function handleError(error: unknown, defaultMessage: string): never {
  if (axios.isAxiosError(error)) {
    console.error('Error de API:', error.response?.data);
    throw new Error(error.response?.data?.message || error.message || defaultMessage);
  }
  console.error('Error desconocido:', error);
  throw new Error(defaultMessage);
}
