import { Row, Col, Form, Button } from 'react-bootstrap';
import { useState, type ChangeEvent } from 'react';
import type { Schedule } from '../models/Schedule';
import CardSchedule from './CardSchedule';

interface ScheduleBoardProps {
  schedules: Schedule[];
}

type FormControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function ScheduleBoard({ schedules }: ScheduleBoardProps): React.ReactNode {
  const [filters, setFilters] = useState<{
    date: string;
    hour: string;
    isAvailable: string;
  }>({
    date: '',
    hour: '',
    isAvailable: '',
  });

  function handleFilterChange(e: ChangeEvent<FormControlElement>) {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }

  function clearFilters() {
    setFilters({ date: '', hour: '', isAvailable: '' });
  }

  // Filtrar schedules según los filtros aplicados
  const filteredSchedules = schedules.filter(schedule => {
    if (filters.date && schedule.date !== filters.date) return false;
    if (filters.hour && schedule.startHour !== filters.hour) return false;
    if (filters.isAvailable && schedule.isAvailable.toString() !== filters.isAvailable) return false;
    return true;
  });

  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    // Primero ordenar por fecha
    const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateComparison !== 0) {
      return dateComparison;
    }
    // Si las fechas son iguales, ordenar por hora
    return a.startHour.localeCompare(b.startHour);
  });

  // Obtener horas únicas para el filtro
  const uniqueHours = [...new Set(schedules.map(s => s.startHour))].sort();

  if (!schedules.length) {
    return (
      <div className="text-center mt-5">
        <h5 className="text-muted">No hay horarios disponibles</h5>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {/* Filtros */}
      <div className="mb-4 p-3 bg-light rounded">
        <h5 className="mb-3">Filtrar Horarios</h5>
        <Row>
          <Col md={3}>
            <Form.Group className="mb-2">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-2">
              <Form.Label>Hora</Form.Label>
              <Form.Select
                name="hour"
                value={filters.hour}
                onChange={handleFilterChange}
              >
                <option value="">Todas las horas</option>
                {uniqueHours.map(hour => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-2">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                name="isAvailable"
                value={filters.isAvailable}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="true">Disponible</option>
                <option value="false">No disponible</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3} className="d-flex align-items-end">
            <Button variant="outline-secondary" onClick={clearFilters} className="mb-2">
              Limpiar Filtros
            </Button>
          </Col>
        </Row>
      </div>

      {/* Resultados */}
      {sortedSchedules.length === 0 ? (
        <div className="text-center mt-4">
          <h5 className="text-muted">No se encontraron horarios con los filtros aplicados</h5>
        </div>
      ) : (
        <Row>
          {sortedSchedules.map((schedule) => (
            <Col md={6} lg={4} key={schedule._id || `${schedule.date}-${schedule.startHour}-${schedule.fieldId}`} className="mb-3">
              <CardSchedule schedule={schedule} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default ScheduleBoard;