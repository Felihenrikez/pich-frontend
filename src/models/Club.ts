export interface Club {
  _id?: string;
  userId: string;
  name: string;
  address: string;
  phone: string;
  fieldId?: string[];
  descripcion?: string;
  imageUrl?: string;
}