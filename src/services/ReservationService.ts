import axios from "axios";
import { API_BASE_URL } from '../config/api';
import type { Reservation } from "../models/reservation.ts";

export const ReservationService = {
  getAll: async (): Promise<Reservation[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reservations`);
      return response.data;
    } catch (error) {
      throw new Error('Error fetching reservations');
    }
  },

  getById: async (id: string): Promise<Reservation> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reservations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching reservation with id ${id}`);
    }
  },

  getByUserId: async (userId: string): Promise<Reservation[]> => {
    try {
      const allReservations = await axios.get(`${API_BASE_URL}/reservations`);
      return allReservations.data.filter((reservation: Reservation) => reservation.userId === userId);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw new Error(`Error fetching reservations for user ${userId}`);
    }
  },

  create: async (reservation: Partial<Reservation>): Promise<Reservation> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reservations`, reservation);
      return response.data;
    } catch (error) {
      throw new Error('Error creating reservation');
    }
  },

  update: async (id: string, reservation: Partial<Reservation>): Promise<Reservation> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/reservations/${id}`, reservation);
      return response.data;
    } catch (error) {
      throw new Error(`Error updating reservation with id ${id}`);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/reservations/${id}`);
    } catch (error) {
      throw new Error(`Error deleting reservation with id ${id}`);
    }
  }
};
