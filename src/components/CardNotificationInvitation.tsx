import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import type { Alert } from "../models/Alert.ts";
import { AlertService } from '../services/AlertService.ts';

interface NotificationInvitationProps {
  alert: Alert;
  onUpdate?: (updatedAlert: Alert) => void;
}

function CardNotificationInvitation({ alert, onUpdate }: NotificationInvitationProps): React.ReactNode {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const updatedAlert = await AlertService.update(alert._id || '', { status: 'accepted' });
      onUpdate?.(updatedAlert);
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const updatedAlert = await AlertService.update(alert._id || '', { status: 'rejected' });
      onUpdate?.(updatedAlert);
    } catch (error) {
      console.error('Error rejecting invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      const updatedAlert = await AlertService.markAsRead(alert._id || '');
      onUpdate?.(updatedAlert);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      case 'read': return 'secondary';
      default: return 'warning';
    }
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Card.Title className="h6">
              {alert.type === 'query' ? 'Invitación' : 'Información'}
            </Card.Title>
            <Card.Text>{alert.message}</Card.Text>
            <small className="text-muted">{new Date(alert.createdAt).toLocaleString()}</small>
          </div>
          <span className={`badge bg-${getStatusColor(alert.status)}`}>
            {alert.status.toUpperCase()}
          </span>
        </div>
        
        {alert.status === 'sent' && alert.type === 'query' && (
          <div className="mt-3 d-flex gap-2">
            <Button 
              variant="success" 
              size="sm" 
              onClick={handleAccept}
              disabled={loading}
            >
              Aceptar
            </Button>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={handleReject}
              disabled={loading}
            >
              Rechazar
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={handleMarkAsRead}
              disabled={loading}
            >
              Marcar como leída
            </Button>
          </div>
        )}
        
        {alert.status === 'sent' && alert.type === 'info' && (
          <div className="mt-3 d-flex gap-2">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={handleMarkAsRead}
              disabled={loading}
            >
              Marcar como leída
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default CardNotificationInvitation;