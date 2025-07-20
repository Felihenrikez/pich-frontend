import { Button, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import type { Reservation } from '../models/reservation';
import CardReservation from './CardReservation.tsx';

interface ReservationListProps {
  reservations: Reservation[];
  onReservationCancelled?: (reservationId: string) => void;
}

function ReservationList({ reservations, onReservationCancelled }: ReservationListProps): React.ReactNode {
  const [sortBy, setSortBy] = useState<'dateReservation' | 'state' | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');


  function handleSort(by: 'dateReservation' | 'state') {
    if (sortBy === by) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(by);
      setSortOrder('asc');
    }
  }

  const sortedReservations = [...reservations].sort((a, b) => {
    if (sortBy === 'dateReservation') return sortOrder === 'asc' ? a.dateReservation.localeCompare(b.dateReservation) : b.dateReservation.localeCompare(a.dateReservation);
    if (sortBy === 'state') return sortOrder === 'asc' ? a.state.localeCompare(b.state) : b.state.localeCompare(a.state);
    return 0;
  });



  if (!reservations.length) {
    return (
      <div className="text-center mt-5">
        <h5 className="text-muted">No tienes reservas</h5>
        <p className="text-muted">Ve a "Buscar Horarios" para hacer tu primera reserva</p>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <h4 className="mb-3 text-center">Lista de Reservas</h4>
      <div className="d-flex justify-content-between mb-2">
        <Button variant="link" onClick={() => handleSort('dateReservation')} className="p-0">
          Ordenar por Fecha {sortBy === 'dateReservation' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
        <Button variant="link" onClick={() => handleSort('state')} className="p-0">
          Ordenar por Estado {sortBy === 'state' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
      </div>

      <Row>
        {sortedReservations.map((reservation) => (
          <Col md={6} lg={4} key={reservation._id || reservation.id} className="mb-3">
            <div className={`${reservation.state === 'cancelada' ? 'opacity-75' : ''}`}>
              <CardReservation 
                reservation={reservation} 
                onReservationCancelled={onReservationCancelled}
              />
            </div>
          </Col>
        ))}
      </Row>


    </div>
  );
}

export default ReservationList;