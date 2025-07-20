import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useState, useEffect } from 'react';
import type { Reservation } from "../models/reservation.ts";
import { ScheduleService } from '../services/ScheduleService.ts';
import { ReservationService } from '../services/ReservationService.ts';
import PlayerList from './PlayerList.tsx';
import * as React from "react";

interface ReservationProps {
  reservation: Reservation;
  onReservationCancelled?: (reservationId: string) => void;
  onUpdate?: (updatedReservation: Reservation) => void;
}

function CardReservation({ reservation, onReservationCancelled, onUpdate }: ReservationProps): ReturnType<React.FC> {
  const [clubName, setClubName] = useState<string>('');
  const [fieldName, setFieldName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showMembersModal, setShowMembersModal] = useState<boolean>(false);
  const [currentReservation, setCurrentReservation] = useState<Reservation>(reservation);

  useEffect(() => {
    setCurrentReservation(reservation);
  }, [reservation]);

  const handleReservationUpdate = (updatedReservation: Reservation) => {
    setCurrentReservation(updatedReservation);
    onUpdate?.(updatedReservation);
  };

  useEffect(() => {
    async function fetchScheduleInfo() {
      try {
        const schedule = await ScheduleService.getById(reservation.scheduleId);
        setClubName(schedule.clubName || '');
        setFieldName(schedule.fieldName || '');
      } catch (error) {
        console.error('Error fetching schedule info:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (reservation.scheduleId) {
      fetchScheduleInfo();
    } else {
      setLoading(false);
    }
  }, [reservation.scheduleId]);

  const getStateColor = (state: string) => {
    switch (state) {
      case 'confirmada': return 'success';
      case 'cancelada': return 'danger';
      default: return 'warning';
    }
  };

  const canCancelReservation = (reservation: Reservation) => {
    if (reservation.state !== 'confirmada') return false;
    const reservationDate = new Date(reservation.dateReservation);
    const now = new Date();
    const hoursDiff = (reservationDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 2;
  };

  const handleShowCancelModal = () => {
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
  };

  const handleConfirmCancel = async () => {
    const reservationId = reservation._id || reservation.id;
    if (!reservationId) {
      alert('Error: ID de reserva no válido');
      return;
    }

    try {
      // El backend se encargará de marcar el horario como disponible nuevamente
      await ReservationService.delete(reservationId);
      
      if (onReservationCancelled) {
        onReservationCancelled(reservationId);
      }
      setShowCancelModal(false);
      alert('Reserva cancelada exitosamente');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Error al cancelar la reserva');
    }
  };



  return (
    <Card>
      <Card.Img variant="top" src="holder.js/100px180?text=Reservation" />
      <Card.Body>
        <Card.Title>Reserva </Card.Title>
        <Card.Text>
          <span className={`badge bg-${getStateColor(reservation.state)}`}>
            {reservation.state.toUpperCase()}
          </span>
        </Card.Text>
      </Card.Body>
      <ListGroup className="list-group-flush">
        {loading ? (
          <ListGroup.Item>Cargando información...</ListGroup.Item>
        ) : (
          <>
            {clubName && <ListGroup.Item><strong>Club:</strong> {clubName}</ListGroup.Item>}
            {fieldName && <ListGroup.Item><strong>Cancha:</strong> {fieldName}</ListGroup.Item>}
            <ListGroup.Item><strong>Fecha:</strong> {reservation.dateReservation}</ListGroup.Item>
            <ListGroup.Item><strong>Hora:</strong> {reservation.startHour}</ListGroup.Item>
            <ListGroup.Item><strong>Precio:</strong> ${reservation.price?.toLocaleString()}</ListGroup.Item>
          </>
        )}
      </ListGroup>
      <Card.Body>
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={() => setShowMembersModal(true)}
          className="w-100 mb-2"
        >
          Participantes ({currentReservation.membersList?.length || 0})
        </Button>
        {canCancelReservation(reservation) && (
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={handleShowCancelModal}
            className="w-100"
          >
            Cancelar Reserva
          </Button>
        )}
      </Card.Body>
      
      {/* Modal de confirmación */}
      <Modal show={showCancelModal} onHide={handleCloseCancelModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancelar Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que quieres cancelar esta reserva?</p>
          <div className="bg-light p-3 rounded">
            {clubName && <><strong>Club:</strong> {clubName}<br/></>}
            {fieldName && <><strong>Cancha:</strong> {fieldName}<br/></>}
            <strong>Fecha:</strong> {reservation.dateReservation}<br/>
            <strong>Hora:</strong> {reservation.startHour}<br/>
            <strong>Precio:</strong> ${reservation.price?.toLocaleString()}
          </div>
          <small className="text-muted mt-2 d-block">
            Esta acción no se puede deshacer.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCancelModal}>
            Mantener Reserva
          </Button>
          <Button variant="danger" onClick={handleConfirmCancel}>
            Cancelar Reserva
          </Button>
        </Modal.Footer>
      </Modal>

      <PlayerList
        show={showMembersModal}
        onHide={() => setShowMembersModal(false)}
        reservation={currentReservation}
        onUpdate={handleReservationUpdate}
      />
    </Card>
  );
}

export default CardReservation;