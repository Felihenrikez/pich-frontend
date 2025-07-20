import axios from "axios";
import type { User } from "../models/User.ts";

// Crear una instancia de axios para reutilizar configuración base
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10_000, // 10 segundos
});

export const UserService = {
  getAll: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get<User[]>('/users');
      return response.data;
    } catch (error) {
      return handleError(error, 'Error fetching users');
    }
  },
  getById: async (id: string): Promise<User> => {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error, `Error fetching user with id ${id}`);
    }
  },
  create: async (user: User): Promise<User> => {
    try {
      const response = await apiClient.post('/users', user);
      return response.data;
    } catch (error) {
      return handleError(error, 'Error creating user');
    }
  },
  update: async (id: string, user: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.put(`/users/${id}`, user);
      return response.data;
    } catch (error) {
      return handleError(error, `Error updating user with id ${id}`);
    }
  },
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      return handleError(error, `Error deleting user with id ${id}`);
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