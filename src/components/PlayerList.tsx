import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useState, useEffect } from 'react';
import { ReservationService } from '../services/ReservationService.ts';
import type { Reservation } from '../models/reservation.ts';

interface PlayerListProps {
  show: boolean;
  onHide: () => void;
  reservation: Reservation;
  onUpdate?: (updatedReservation: Reservation) => void;
}

function PlayerList({ show, onHide, reservation, onUpdate }: PlayerListProps): React.ReactNode {
  const [members, setMembers] = useState<{ name: string; number: string; confirmation: 'pending' | 'confirmed' | 'rejected' }[]>(
    reservation.membersList || []
  );
  const [membersError, setMembersError] = useState<string>('');

  useEffect(() => {
    setMembers(reservation.membersList || []);
  }, [reservation.membersList]);

  const handleAddMember = () => {
    if (members.length < 14) {
      setMembers([...members, { name: '', number: '', confirmation: 'pending' }]);
    }
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: 'name' | 'number' | 'confirmation', value: string) => {
    const updatedMembers = [...members];
    if (field === 'confirmation') {
      updatedMembers[index][field] = value as 'pending' | 'confirmed' | 'rejected';
    } else {
      updatedMembers[index][field] = value;
    }
    setMembers(updatedMembers);
  };

  const handleSaveMembers = async () => {
    try {
      setMembersError('');
      const validMembers = members.filter(m => m.name.trim() && m.number.trim());
      const reservationId = reservation._id || reservation.id || '';
      const updateData = { membersList: validMembers };
      
      console.log('Updating reservation:', reservationId);
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      
      const updatedReservation = await ReservationService.update(reservationId, updateData);
      onUpdate?.(updatedReservation);
      onHide();
    } catch (error) {
      console.error('Error updating members:', error);
      setMembersError('Error al guardar los participantes. Inténtalo nuevamente.');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Participantes (Máximo 14)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {membersError && (
          <div className="alert alert-danger" role="alert">
            {membersError}
          </div>
        )}
        {members.map((member, index) => (
          <Row key={index} className="mb-2">
            <Col md={4}>
              <Form.Control
                placeholder="Nombre"
                value={member.name}
                onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Control
                placeholder="Teléfono"
                value={member.number}
                onChange={(e) => handleMemberChange(index, 'number', e.target.value)}
              />
            </Col>
            <Col md={2} className="d-flex align-items-center justify-content-center">
              <Form.Select
                value={member.confirmation}
                onChange={(e) => handleMemberChange(index, 'confirmation', e.target.value)}
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="rejected">Rechazado</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-danger" onClick={() => handleRemoveMember(index)}>
                ✕
              </Button>
            </Col>
          </Row>
        ))}
        {members.length < 14 && (
          <Button variant="outline-success" onClick={handleAddMember}>
            + Agregar Participante
          </Button>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSaveMembers}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PlayerList;