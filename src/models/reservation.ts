export interface Reservation {
  _id?: string;
  id?: string; // Algunos backends usan id en lugar de _id
  scheduleId: string; // Relación con Horario
  userId: string; // Relación con Usuario
  state: 'pendiente' | 'confirmada' | 'cancelada';
  dateReservation: string;
  startHour: string;
  paymentType?: string; // Ej: "Efectivo", "Tarjeta"
  price: number;
  membersList?: { name: string; number: string; confirmation: 'pending' | 'confirmed' | 'rejected' }[];
}