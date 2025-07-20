export interface User {
  _id?: string,
  name: string,
  birthDate: string;
  email: string;
  phone: string;
  password?: string;// No guardes contraseñas en texto plano
  role: string
}