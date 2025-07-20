export interface Field {
  clubId: string; // Relación con Local
  name: string; // Ej: "Cancha 1"
  sportType: string; // Ej: "Fútbol 5", "Básquet"
  isAvailable: boolean;
  imageUrl? : string;
  description?: string;
  _id?: string;
}