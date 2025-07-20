import { Container, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { AuthService } from '../services/AuthService.ts';
import { ScheduleService } from '../services/ScheduleService.ts';
import NotificationBell from '../components/NotificationBell.tsx';
import ScheduleBoard from '../components/ScheduleBoard.tsx';
import type { Schedule } from '../models/Schedule.ts';

interface ScheduleAdminProps {
  clubId: string;
  onLogout: () => void;
  onBack: () => void;
  onCreateSchedule?: () => void;
}

function ScheduleAdmin({ clubId, onLogout, onBack, onCreateSchedule }: ScheduleAdminProps): React.ReactNode {
  const user = AuthService.getUser();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedules() {
      try {
        const allSchedules = await ScheduleService.getAll();
        const clubSchedules = allSchedules.filter(schedule => schedule.clubId === clubId);
        setSchedules(clubSchedules);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setLoading(false);
      }
    }
    if (clubId) {
      fetchSchedules();
    }
  }, [clubId]);

  function handleLogout() {
    AuthService.logout();
    onLogout();
  }

  return (
    <>
      <Container fluid className="position-absolute top-0 end-0 p-3">
        <div className="d-flex gap-2 align-items-center">
          <Button variant="outline-secondary" onClick={onBack}>Volver</Button>
          <NotificationBell userId={user?._id} />
          <span>Hola, {user?.name}</span>
          <Button variant="outline-danger" onClick={handleLogout}>Cerrar Sesión</Button>
        </div>
      </Container>
      
      <Container className="mt-5 pt-5">
        <h2 className="mb-4 text-center">Administrar Horarios</h2>
        {loading ? (
          <div className="text-center">
            <h4>Cargando horarios...</h4>
          </div>
        ) : (
          <ScheduleBoard schedules={schedules} />
        )}
      </Container>
      
      {onCreateSchedule && (
        <Button 
          variant="success" 
          className="position-fixed bottom-0 end-0 m-4"
          onClick={onCreateSchedule}
        >
          Crear Horario
        </Button>
      )}
    </>
  );
}

export default ScheduleAdmin;