import axios from "axios";
import type { Alert } from "../models/Alert";
import { AuthService } from "./AuthService";

export const AlertService = {
  getUserAlerts: async (userId: string): Promise<Alert[]> => {
    console.log('AlertService: Requesting alerts for userId:', userId);
    try {
      const token = AuthService.getToken();
      console.log('AlertService: Using token:', token ? 'Token exists' : 'No token found');
      
      const url = `http://localhost:3000/api/alerts/recipient/${userId}`;
      console.log('AlertService: Making GET request to:', url);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('AlertService: Response status:', response.status);
      console.log('AlertService: Response data:', response.data);
      if (Array.isArray(response.data)) {
        response.data.forEach((a, i) => console.log('AlertService: alert', i, a));
      }
      // Asegura que cada alerta tenga eventId para robustez
      return response.data.map((a: any) => ({ ...a, eventId: a.eventId ?? '' }));
    } catch (error) {
      console.error('AlertService: Error details:', error);
      if (axios.isAxiosError(error)) {
        console.error('AlertService: Request failed with status:', error.response?.status);
        console.error('AlertService: Error response data:', error.response?.data);
      }
      throw new Error('Error al obtener las notificaciones');
    }
  },
  
  markAsRead: async (alertId: string): Promise<Alert> => {
    console.log('AlertService: Marking alert as read, alertId:', alertId);
    try {
      const token = AuthService.getToken();
      console.log('AlertService: Using token:', token ? 'Token exists' : 'No token found');
      
      const url = `http://localhost:3000/api/alerts/${alertId}`;
      console.log('AlertService: Making PUT request to:', url);
      console.log('AlertService: Request payload:', { status: 'read' });
      
      const response = await axios.put(url, 
        { status: 'read' },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('AlertService: Response status:', response.status);
      console.log('AlertService: Response data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('AlertService: Error details:', error);
      if (axios.isAxiosError(error)) {
        console.error('AlertService: Request failed with status:', error.response?.status);
        console.error('AlertService: Error response data:', error.response?.data);
      }
      throw new Error('Error al marcar la notificación como leída');
    }
  }
};