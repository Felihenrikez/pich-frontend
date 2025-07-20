import axios from "axios";
import type { Reservation } from "../models/reservation.ts";

export const ReservationService = {
  getAll: async (): Promise<Reservation[]> => {
    try {
      const response = await axios.get('http://localhost:3000/api/reservations');
      return response.data;
    } catch (error) {
      throw new Error('Error fetching reservations');
    }
  },
  getById: async (id: string): Promise<Reservation> => {
    try {
      const response = await axios.get(`http://localhost:3000/api/reservations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching reservation with id ${id}`);
    }
  },
  getByUserId: async (userId: string): Promise<Reservation[]> => {
    try {
      const allReservations = await axios.get('http://localhost:3000/api/reservations');
      return allReservations.data.filter((reservation: Reservation) => reservation.userId === userId);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw new Error(`Error fetching reservations for user ${userId}`);
    }
  },
  create: async (reservation: Partial<Reservation>): Promise<Reservation> => {
    try {
      const response = await axios.post('http://localhost:3000/api/reservations', reservation);
      return response.data;
    } catch (error) {
      throw new Error('Error creating reservation');
    }
  },
  update: async (id: string, reservation: Partial<Reservation>): Promise<Reservation> => {
    try {
      const response = await axios.put(`http://localhost:3000/api/reservations/${id}`, reservation);
      return response.data;
    } catch (error) {
      throw new Error(`Error updating reservation with id ${id}`);
    }
  },
  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`http://localhost:3000/api/reservations/${id}`);
    } catch (error) {
      throw new Error(`Error deleting reservation with id ${id}`);
    }
  }
};
