export interface Schedule {
  _id?: string;
  fieldId: string;
  clubId: string;
  fieldName: string;
  clubName: string;
  price: number;// Relación con Cancha
  date: string; // Ej: 2025-04-05
  startHour: string; // Ej: "15:00"
  isAvailable: boolean;
}