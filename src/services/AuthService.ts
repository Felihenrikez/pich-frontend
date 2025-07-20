import axios from "axios";
import type { User } from "../models/User.ts";

// Crear una instancia de axios para reutilizar configuración base
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10_000, // 10 segundos
});

// Clave para almacenar el usuario en localStorage
const USER_KEY = 'currentUser';

export const AuthService = {
  login: async (credentials: { email: string, password: string }): Promise<User> => {
    try {
      const response = await apiClient.post<{ user: { id: string, name: string, email: string, role: string }, token: string }>('/auth/login', credentials);
      const { user, token } = response.data;
      
      // Convertir el formato de usuario recibido al formato interno
      const userData: User = {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        // Estos campos no vienen en la respuesta pero son requeridos por el tipo User
        birthDate: '',
        phone: ''
      };
      
      // Guardar el usuario y token en localStorage
      localStorage.setItem(USER_KEY, JSON.stringify({ user: userData, token }));
      
      return userData;
    } catch (error) {
      return handleError(error, 'Error en el inicio de sesión');
    }
  },
  
  logout: (): void => {
    localStorage.removeItem(USER_KEY);
  },
  
  isAuthenticated: (): boolean => {
    const userData = localStorage.getItem(USER_KEY);
    return !!userData;
  },
  
  getUser: (): User | null => {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      const { user } = JSON.parse(userData);
      return user;
    }
    return null;
  },
  
  getToken: (): string | null => {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      const { token } = JSON.parse(userData);
      return token;
    }
    return null;
  }
};

// Función auxiliar para manejar errores
function handleError(error: unknown, defaultMessage: string): never {
  if (axios.isAxiosError(error)) {
    console.error('Error de API:', error.response?.data);
    // Adaptado para manejar el formato de error de la API
    throw new Error(error.response?.data?.error || error.response?.data?.message || error.message || defaultMessage);
  }
  console.error('Error desconocido:', error);
  throw new Error(defaultMessage);
}