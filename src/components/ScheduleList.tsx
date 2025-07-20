import { Button, Modal, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import type { Schedule } from '../models/Schedule.ts';
import type { Reservation} from "../models/reservation.ts";
import { ScheduleService } from "../services/ScheduleService.ts";
import { ReservationService } from "../services/ReservationService.ts";
import { AuthService } from '../services/AuthService.ts';
import CardSchedule from './CardSchedule';

interface ScheduleListProps {
  schedules: Schedule[];
  onScheduleReserved?: (scheduleId: string) => void;
}

function ScheduleList({ schedules, onScheduleReserved }: ScheduleListProps): React.ReactNode {
  const [sortBy, setSortBy] = useState<'startHour' | 'fieldName' | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const availableSchedules = schedules.filter((schedule) => schedule.isAvailable);

  function handleSort(by: 'startHour' | 'fieldName') {
    if (sortBy === by) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(by);
      setSortOrder('asc');
    }

    const sortedSchedules = [...availableSchedules].sort((a, b) => {
      if (by === 'startHour') return sortOrder === 'asc' ? a.startHour.localeCompare(b.startHour) : b.startHour.localeCompare(a.startHour);
      if (by === 'fieldName') return sortOrder === 'asc' ? a.fieldName.localeCompare(b.fieldName) : b.fieldName.localeCompare(a.fieldName);
      return 0;
    });
    // Aquí puedes actualizar el estado si usas ordenamiento local
  }

  const handleConfirmReservation = async () => {
    if (!selectedSchedule) return;

    try {
      // Obtener usuario autenticado
      const user = AuthService.getUser();
      if (!user) {
        alert('Debes estar autenticado para hacer una reserva');
        return;
      }

      // Datos de la nueva reserva
      const newReservation = {
        scheduleId: selectedSchedule.id || selectedSchedule._id || '',
        userId: user.id || user._id || '',
        state: 'confirmada',
        dateReservation: selectedSchedule.date,
        startHour: selectedSchedule.startHour,
        price: selectedSchedule.price,
      };

      // Crear la reserva (el backend se encargará de marcar el horario como no disponible)
      await ReservationService.create(newReservation);

      // Obtener el ID del horario para notificar al componente padre
      const scheduleId = selectedSchedule.id || selectedSchedule._id;
      
      // Notificar al componente padre sobre la reserva
      if (onScheduleReserved && scheduleId) {
        onScheduleReserved(scheduleId);
      }

      // 4. Cerrar modal y mostrar mensaje
      handleCloseModal();
      alert('¡Reserva confirmada con éxito!');
    } catch (error) {
      console.error('Error al confirmar la reserva:', error);
      alert('Hubo un error al crear la reserva. Inténtalo nuevamente.');
    }
  };

  // Abre el modal con el horario seleccionado
  const handleReserveClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowModal(true);
  };

  // Cierra el modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSchedule(null);
  };

  if (!availableSchedules.length) return null;

  return (
    <div className="mt-5">
      <h4 className="mb-3 text-center">Resultados de la búsqueda</h4>
      <div className="d-flex justify-content-between mb-2">
        <Button variant="link" onClick={() => handleSort('startHour')} className="p-0">
          Ordenar por Horario {sortBy === 'startHour' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
        <Button variant="link" onClick={() => handleSort('fieldName')} className="p-0">
          Ordenar por Cancha {sortBy === 'fieldName' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
      </div>

      <Row>
        {availableSchedules.map((schedule) => (
          <Col md={6} lg={4} key={schedule._id || schedule.fieldId} className="mb-3">
            <div>
              <CardSchedule schedule={schedule} />
              <div className="text-center mt-2">
                <Button 
                  variant="success" 
                  onClick={() => handleReserveClick(schedule)}
                >
                  Reservar
                </Button>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSchedule && <CardSchedule schedule={selectedSchedule} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmReservation}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ScheduleList;