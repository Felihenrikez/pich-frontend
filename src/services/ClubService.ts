import axios from "axios";
import { API_BASE_URL } from '../config/api';
import type { Club } from "../models/Club.ts";

// Crear una instancia de axios para reutilizar configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000, // 10 segundos
});

export const ClubService = {
  getAll: async (): Promise<Club[]> => {
    try {
      const response = await apiClient.get<Club[]>('/clubs');
      return response.data;
    } catch (error) {
      return handleError(error, 'Error fetching clubs');
    }
  },
  getById: async (id: string): Promise<Club> => {
    try {
      const response = await apiClient.get<Club>(`/clubs/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error, `Error fetching club with id ${id}`);
    }
  },
  getByUserId: async (userId: string): Promise<Club[]> => {
    try {
      const response = await apiClient.get<Club[]>(`/clubs/user/${userId}`);
      return response.data;
    } catch (error) {
      return handleError(error, `Error fetching clubs for user ${userId}`);
    }
  },
  create: async (club: Club): Promise<Club> => {
    try {
      const response = await apiClient.post('/clubs', club);
      return response.data;
    } catch (error) {
      return handleError(error, 'Error creating club');
    }
  },
  update: async (id: string, club: Partial<Club>): Promise<Club> => {
    try {
      const response = await apiClient.put(`/clubs/${id}`, club);
      return response.data;
    } catch (error) {
      return handleError(error, `Error updating club with id ${id}`);
    }
  },
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/clubs/${id}`);
    } catch (error) {
      return handleError(error, `Error deleting club with id ${id}`);
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