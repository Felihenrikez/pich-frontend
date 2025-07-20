import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { AuthService } from '../services/AuthService.ts';
import { ClubService } from '../services/ClubService.ts';
import { FieldService } from '../services/FieldService.ts';
import { ScheduleService } from '../services/ScheduleService.ts';
import { ReservationService } from '../services/ReservationService.ts';
import NotificationBell from '../components/NotificationBell.tsx';
import ClubList from '../components/ClubList.tsx';
import FieldList from '../components/FieldList.tsx';
import ScheduleList from '../components/ScheduleList.tsx';
import ReservationList from '../components/ReservationList.tsx';
import CreateClubForm from '../components/CreateClubForm.tsx';
import CreateFieldForm from '../components/CreateFieldForm.tsx';
import ScheduleAdmin from './ScheduleAdmin.tsx';
import CreateScheduleForm from '../components/CreateScheduleForm.tsx';
import type { Club } from '../models/Club.ts';
import type { Field } from '../models/Field.ts';
import type { Schedule } from '../models/Schedule.ts';
import type { Reservation } from '../models/reservation.ts';

type ViewType = 'dashboard' | 'clubs' | 'fields' | 'schedules' | 'reservations' | 'createClub' | 'createField' | 'scheduleAdmin' | 'createSchedule';

interface HomeOwnerProps {
  onLogout: () => void;
}

function HomeOwner({ onLogout }: HomeOwnerProps): React.ReactNode {
  const user = AuthService.getUser();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  
  useEffect(() => {
    async function fetchData() {
      try {
        const [clubsData, fieldsData, schedulesData, reservationsData] = await Promise.all([
          ClubService.getAll(),
          FieldService.getAll(),
          ScheduleService.getAll(),
          ReservationService.getAll()
        ]);
        setClubs(clubsData);
        setFields(fieldsData);
        setSchedules(schedulesData);
        setReservations(reservationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);




  function handleLogout() {
    AuthService.logout();
    onLogout();
  }

  if (currentView === 'clubs') {
    return (
      <>
        <Container fluid className="position-absolute top-0 end-0 p-3">
          <div className="d-flex gap-2 align-items-center">
            <Button variant="outline-secondary" onClick={() => setCurrentView('dashboard')}>Volver</Button>
            <NotificationBell userId={user?._id} />
            <span>Hola, {user?.name}</span>
            <Button variant="outline-danger" onClick={handleLogout}>Cerrar Sesión</Button>
          </div>
        </Container>
        <Container className="mt-5 pt-5">
          <ClubList
            clubs={clubs}
            onManageClub={(clubId) => {
              setSelectedClubId(clubId);
              setCurrentView('fields');
            }}
          />
        </Container>
        <Button
          variant="success"
          className="position-fixed bottom-0 end-0 m-4"
          onClick={() => setCurrentView('createClub')}
        >
          Crear Club
        </Button>
      </>
    );
  }

  if (currentView === 'createClub') {
    return (
      <>
        <Container fluid className="position-absolute top-0 end-0 p-3">
          <div className="d-flex gap-2 align-items-center">
            <Button variant="outline-secondary" onClick={() => setCurrentView('clubs')}>Volver</Button>
            <NotificationBell userId={user?._id} />
            <span>Hola, {user?.name}</span>
            <Button variant="outline-danger" onClick={handleLogout}>Cerrar Sesión</Button>
          </div>
        </Container>
        <Container className="mt-5 pt-5">
          <CreateClubForm userId={user?._id || ''} onSuccess={async () => {
            try {
              const [clubsData, fieldsData, schedulesData, reservationsData] = await Promise.all([
                ClubService.getAll(),
                FieldService.getAll(),
                ScheduleService.getAll(),
                ReservationService.getAll()
              ]);
              setClubs(clubsData);
              setFields(fieldsData);
              setSchedules(schedulesData);
              setReservations(reservationsData);
              setCurrentView('clubs');
            } catch (error) {
              console.error('Error refreshing data:', error);
            }
          }} />
        </Container>
      </>
    );
  }

  if (currentView === 'fields') {
    return (
      <>
        <Container fluid className="position-absolute top-0 end-0 p-3">
          <div className="d-flex gap-2 align-items-center">
            <Button variant="outline-secondary" onClick={() => setCurrentView('clubs')}>Volver</Button>
            <NotificationBell userId={user?._id} />
            <span>Hola, {user?.name}</span>
            <Button variant="outline-danger" onClick={handleLogout}>Cerrar Sesión</Button>
          </div>
        </Container>
        <Container className="mt-5 pt-5">
          <FieldList
            clubId={selectedClubId}
            onCreateField={() => setCurrentView('createField')}
            onManageSchedules={() => setCurrentView('scheduleAdmin')}
          />
        </Container>
      </>
    );
  }

  if (currentView === 'schedules') {
    return (
      <>
        <Container fluid className="position-absolute top-0 end-0 p-3">
          <div className="d-flex gap-2 align-items-center">
            <Button variant="outline-secondary" onClick={() => setCurrentView('dashboard')}>Volver</Button>
            <NotificationBell userId={user?._id} />
            <span>Hola, {user?.name}</span>
            <Button variant="outline-danger" onClick={handleLogout}>Cerrar Sesión</Button>
          </div>
        </Container>
        <Container className="mt-5 pt-5">
          <ScheduleList schedules={schedules} />
        </Container>
      </>
    );
  }

  if (currentView === 'createField') {
    return (
      <>
        <Container fluid className="position-absolute top-0 end-0 p-3">
          <div className="d-flex gap-2 align-items-center">
            <Button variant="outline-secondary" onClick={() => setCurrentView('fields')}>Volver</Button>
            <NotificationBell userId={user?._id} />
            <span>Hola, {user?.name}</span>
            <Button variant="outline-danger" onClick={handleLogout}>Cerrar Sesión</Button>
          </div>
        </Container>
        <Container className="mt-5 pt-5">
          <CreateFieldForm 
            clubId={selectedClubId} 
            onSuccess={() => setCurrentView('fields')}
          />
        </Container>
      </>
    );
  }

  if (currentView === 'scheduleAdmin') {
    return (
      <ScheduleAdmin
        clubId={selectedClubId}
        onLogout={handleLogout}
        onBack={() => setCurrentView('fields')}
        onCreateSchedule={() => setCurrentView('createSchedule')}
      />
    );
  }

  if (currentView === 'createSchedule') {
    return (
      <>
        <Container fluid className="position-absolute top-0 end-0 p-3">
          <div className="d-flex gap-2 align-items-center">
            <Button variant="outline-secondary" onClick={() => setCurrentView('scheduleAdmin')}>Volver</Button>
            <NotificationBell userId={user?._id} />
            <span>Hola, {user?.name}</span>
            <Button variant="outline-danger" onClick={handleLogout}>Cerrar Sesión</Button>
          </div>
        </Container>
        <Container className="mt-5 pt-5">
          <CreateScheduleForm
            clubId={selectedClubId}
            onSuccess={() => setCurrentView('scheduleAdmin')}
          />
        </Container>
      </>
    );
  }

  if (currentView === 'reservations') {
    return (
      <>
        <Container fluid className="position-absolute top-0 end-0 p-3">
          <div className="d-flex gap-2 align-items-center">
            <Button variant="outline-secondary" onClick={() => setCurrentView('dashboard')}>Volver</Button>
            <NotificationBell userId={user?._id} />
            <span>Hola, {user?.name}</span>
            <Button variant="outline-danger" onClick={handleLogout}>Cerrar Sesión</Button>
          </div>
        </Container>
        <Container className="mt-5 pt-5">
          <ReservationList 
            reservations={reservations} 
            onReservationCancelled={(reservationId) => {
              setReservations(prev => prev.filter(r => (r._id || r.id) !== reservationId));
            }}
          />
        </Container>
      </>
    );
  }

  return (
    <>
      <Container fluid className="position-absolute top-0 end-0 p-3">
        <div className="d-flex gap-2 align-items-center">
          <NotificationBell userId={user?._id} />
          <span>Hola, {user?.name}</span>
          <Button variant="outline-danger" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </Container>

      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <Row className="w-100">
          <Col md={10} lg={8} className="mx-auto">
            <h2 className="mb-4 text-center">Panel de Propietario</h2>
            <Row>
              <Col md={6} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>Gestionar Clubes</Card.Title>
                    <Card.Text>Administra tus clubes deportivos</Card.Text>
                    <Button variant="primary" onClick={() => setCurrentView('clubs')}>Ver Clubes</Button>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>Horarios</Card.Title>
                    <Card.Text>Gestiona los horarios disponibles</Card.Text>
                    <Button variant="primary" onClick={() => setCurrentView('schedules')}>Ver Horarios</Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>Reservas</Card.Title>
                    <Card.Text>Revisa las reservas realizadas</Card.Text>
                    <Button variant="primary" onClick={() => setCurrentView('reservations')}>Ver Reservas</Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default HomeOwner;