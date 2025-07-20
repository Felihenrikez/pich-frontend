import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import type { Alert } from '../models/Alert';
import { AlertService } from '../services/AlertService';
import { ReservationService } from '../services/ReservationService';

interface CardAlertProps {
  alert: Alert;
  onUpdate?: (updated: Alert) => void;
  onMarkAsRead?: (alertId: string) => void;
}

export default function CardAlert({ alert, onMarkAsRead, onUpdate }: CardAlertProps) {
  const alertWithEventId = { ...alert, eventId: (alert as any).eventId ?? '' };
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'accepted' | 'rejected') => {
    setLoading(true);
    try {
      const updated = await ReservationService.update(alertWithEventId.eventId, action);
      onUpdate?.(updated);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    setLoading(true);
    try {
      const id = (alertWithEventId as any)._id || (alertWithEventId as any).id || alertWithEventId.eventId;
      await AlertService.markAsRead(id);
      onMarkAsRead?.(id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-2 shadow-sm">
      <Card.Body>
        <Card.Text>{alertWithEventId.message}</Card.Text>
        <div style={{fontSize:12, color:'#888'}}>type: {alertWithEventId.type} | status: {alertWithEventId.status}</div>
        <small className="text-muted d-block mb-2">
          {alertWithEventId.createdAt ? new Date(alertWithEventId.createdAt).toLocaleString() : ''}
        </small>
        {alertWithEventId.type === 'query' && (
          <div className="d-flex gap-2 mb-2">
            <Button
              variant="outline-success"
              size="sm"
              disabled={loading}
              onClick={() => handleAction('accepted')}
            >
              Aceptar
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              disabled={loading}
              onClick={() => handleAction('rejected')}
            >
              Rechazar
            </Button>
          </div>
        )}
        {alertWithEventId.status === 'sent' && alertWithEventId.type !== 'query' && (
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={loading}
            onClick={handleMarkAsRead}
          >
            Marcar como leída
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}
