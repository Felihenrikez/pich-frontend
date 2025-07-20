import axios from "axios";
import type { Field } from "../models/Field.ts";

export const FieldService = {
  getAll: async (): Promise<Field[]> => {
    try {
      const response = await axios.get('http://localhost:3000/api/fields');
      return response.data;
    } catch (error) {
      throw new Error('Error fetching fields');
    }
  },
  getById: async (id: string): Promise<Field> => {
    try {
      const response = await axios.get(`http://localhost:3000/api/fields/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching field with id ${id}`);
    }
  },
  getByClubId: async (clubId: string): Promise<Field[]> => {
    try {
      const response = await axios.get(`http://localhost:3000/api/fields/club/${clubId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching fields for club ${clubId}`);
    }
  },
  create: async (field: Field): Promise<Field> => {
    try {
      const response = await axios.post('http://localhost:3000/api/fields', field);
      return response.data;
    } catch (error) {
      throw new Error('Error creating field');
    }
  },
  update: async (id: string, field: Partial<Field>): Promise<Field> => {
    try {
      const response = await axios.put(`http://localhost:3000/api/fields/${id}`, field);
      return response.data;
    } catch (error) {
      throw new Error(`Error updating field with id ${id}`);
    }
  },
  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`http://localhost:3000/api/fields/${id}`);
    } catch (error) {
      throw new Error(`Error deleting field with id ${id}`);
    }
  }
};
