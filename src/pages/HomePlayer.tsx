import { Container, Row, Col, Button, Tab, Tabs } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import ScheduleSearch from '../components/ScheduleSearch.tsx';
import ReservationList from '../components/ReservationList.tsx';
import NotificationBell from '../components/NotificationBell.tsx';
import { AuthService } from '../services/AuthService.ts';
import { ReservationService } from '../services/ReservationService.ts';
import type { Reservation } from '../models/reservation.ts';

interface HomePlayerProps {
  onLogout: () => void;
}

function HomePlayer({ onLogout }: HomePlayerProps): React.ReactNode {
  const user = AuthService.getUser();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('search');

  const fetchReservations = async () => {
    if (user?._id) {
      try {
        setLoading(true);
        const userReservations = await ReservationService.getByUserId(user._id);
        setReservations(userReservations);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user?._id]);

  const handleTabSelect = (key: string | null) => {
    if (key) {
      setActiveTab(key);
      if (key === 'reservations') {
        fetchReservations();
      }
    }
  };

  function handleLogout() {
    AuthService.logout();
    onLogout();
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
      
      <Container className="mt-5 pt-5">
        <Row className="w-100">
          <Col md={10} lg={8} className="mx-auto">
            <Tabs activeKey={activeTab} onSelect={handleTabSelect} className="mb-3">
              <Tab eventKey="search" title="Buscar Horarios">
                <ScheduleSearch onReservationMade={() => {
                  if (activeTab === 'reservations') {
                    fetchReservations();
                  }
                }} />
              </Tab>
              <Tab eventKey="reservations" title="Mis Reservas">
                {loading ? (
                  <div className="text-center">
                    <h4>Cargando reservas...</h4>
                  </div>
                ) : (
                  <ReservationList 
                    reservations={reservations.filter(r => r.state !== 'cancelada')} 
                    onReservationCancelled={(reservationId) => {
                      setReservations(prev => prev.filter(r => (r._id || r.id) !== reservationId));
                    }}
                  />
                )}
              </Tab>
              <Tab eventKey="history" title="Historial">
                {loading ? (
                  <div className="text-center">
                    <h4>Cargando historial...</h4>
                  </div>
                ) : (
                  <ReservationList 
                    reservations={reservations.filter(r => r.state === 'cancelada')} 
                    onReservationCancelled={() => {}}
                  />
                )}
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default HomePlayer;