import { useState, useEffect } from 'react';
import { Dropdown, Badge, Button } from 'react-bootstrap';
import { AlertService } from '../services/AlertService';
import type { Alert } from '../models/Alert';
import CardAlert from './CardAlert';

interface NotificationBellProps {
  userId?: string;
}

function NotificationBell({ userId }: NotificationBellProps): React.ReactNode {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAlerts = async () => {
    if (!userId) {
      console.log('NotificationBell: No userId provided, skipping alert fetch');
      return;
    }
    
    console.log('NotificationBell: Fetching alerts for userId:', userId);
    try {
      setLoading(true);
      const alertsData = await AlertService.getUserAlerts(userId);
      // Asegura que cada alerta tenga eventId (si no, asigna string vacío para robustez)
      const alertsWithEventId = alertsData.map(a => ({ ...a, eventId: a.eventId ?? '' }));
      setAlerts(alertsWithEventId);
      console.log('NotificationBell: Received alerts data:', alertsWithEventId);
    } catch (error) {
      console.error('NotificationBell: Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    console.log('NotificationBell: alerts state', alerts);
    alerts.forEach((a, i) => console.log('NotificationBell: alert', i, a));
  }, [alerts]);

  const handleMarkAsRead = async (alertId: string) => {
    console.log('NotificationBell: Marking alert as read, alertId:', alertId);
    try {
      const updatedAlert = await AlertService.markAsRead(alertId);
      console.log('NotificationBell: Alert marked as read, response:', updatedAlert);
      // Actualizar estado local
      setAlerts(alerts.map(alert => 
        alert._id === alertId || alert.id === alertId ? {...alert, status: 'read'} : alert
      ));
    } catch (error) {
      console.error('NotificationBell: Error marking alert as read:', error);
    }
  };

  const unreadCount = alerts.filter(alert => alert.status === 'sent').length;

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" id="notification-dropdown" className="position-relative p-0 bg-transparent border-0">
        <span className="fs-5">🔔</span>
        {unreadCount > 0 && (
          <Badge 
            bg="danger" 
            pill 
            className="position-absolute top-0 start-100 translate-middle"
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ minWidth: '300px', maxHeight: '400px', overflow: 'auto' }}>
        <Dropdown.Header>Notificaciones</Dropdown.Header>
        {loading ? (
          <Dropdown.Item disabled>Cargando notificaciones...</Dropdown.Item>
        ) : alerts.length === 0 ? (
          <Dropdown.Item disabled>No tienes notificaciones</Dropdown.Item>
        ) : (
          alerts.map(alert => (
            <Dropdown.Item 
              key={alert._id || alert.id} 
              className={alert.status === 'sent' ? 'fw-bold' : ''}
              as="div"
              style={{ padding: 0, background: 'none', border: 'none' }}
            >
              <CardAlert 
                alert={alert}
                onUpdate={updated => setAlerts(alerts.map(a => (a._id === updated._id || a.id === updated.id) ? updated : a))}
                onMarkAsRead={alertId => setAlerts(alerts.map(a => (a._id === alertId || a.id === alertId) ? { ...a, status: 'read' } : a))}
              />
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default NotificationBell;