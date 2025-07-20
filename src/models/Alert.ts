export interface Alert {
  _id?: string;
  id?: string;
  recipientId: string;
  senderId?: string;
  message: string;
  status: 'sent' | 'read' | 'accepted' | 'rejected';
  createdAt: string;
  type: 'query' | 'info';
  eventId: string;
}