import { Form, Button, Row, Col } from 'react-bootstrap';
import { useState, type ChangeEvent } from 'react';
import type { Schedule } from "../models/Schedule.ts";
import { ScheduleService } from "../services/ScheduleService.ts";
import ScheduleList from './ScheduleList.tsx';

type FormControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const allHours = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00',
];

interface ScheduleSearchProps {
  onReservationMade?: () => void;
}

function ScheduleSearch({ onReservationMade }: ScheduleSearchProps = {}): React.ReactNode {
  const [searchData, setSearchData] = useState<{
    date: string;
    hour: string;
  }>({
    date: '',
    hour: '',
  });

  const [searchErrors, setSearchErrors] = useState<{ [key: string]: string }>({});
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const currentDate = new Date('2025-07-11T19:30:00-04:00');
  const todayStr = currentDate.getFullYear() + '-' + 
    String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
    String(currentDate.getDate()).padStart(2, '0');
  const maxDate = new Date(currentDate);
  maxDate.setDate(currentDate.getDate() + 14);
  const maxDateStr = maxDate.getFullYear() + '-' + 
    String(maxDate.getMonth() + 1).padStart(2, '0') + '-' + 
    String(maxDate.getDate()).padStart(2, '0');

  function getAvailableHours(selectedDate: string): string[] {
    if (selectedDate === todayStr) {
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();
      const nextHour = currentMinute >= 30 ? currentHour + 2 : currentHour + 1;
      return allHours.filter((hour) => {
        const [hourStr] = hour.split(':');
        const hourNum = parseInt(hourStr, 10);
        return hourNum >= nextHour;
      });
    }
    return allHours;
  }

  const availableHours = getAvailableHours(searchData.date);

  function handleSearchChange(e: ChangeEvent<FormControlElement>) {
    const { name, value } = e.target;
    setSearchData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'date') {
        newData.hour = getAvailableHours(value)[0] || '';
      }
      return newData;
    });
  }

  function validateSearch(): boolean {
    const newErrors: { [key: string]: string } = {};

    if (!searchData.date) newErrors.date = 'La fecha es obligatoria';
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(searchData.date))
      newErrors.date = 'La fecha debe tener el formato YYYY-MM-DD';
    else if (searchData.date < todayStr)
      newErrors.date = 'La fecha no puede ser anterior a hoy';
    else if (searchData.date > maxDateStr)
      newErrors.date = 'La fecha no puede ser posterior a 2 semanas';

    if (!searchData.hour) newErrors.hour = 'La hora es obligatoria';
    else if (!availableHours.includes(searchData.hour))
      newErrors.hour = 'Selecciona una hora válida';

    setSearchErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validateSearch()) {
      setLoading(true);
      try {
        // Obtener todos los schedules y filtrar en frontend
        const allSchedules = await ScheduleService.getAll();
        const filteredResults = allSchedules.filter(schedule => {
          // Filtrar por fecha
          if (searchData.date && schedule.date !== searchData.date) return false;
          // Filtrar por hora
          if (searchData.hour && schedule.startHour !== searchData.hour) return false;
          // Solo mostrar horarios disponibles
          if (!schedule.isAvailable) return false;
          return true;
        });
        setSchedules(filteredResults);
        setSearchErrors({});
      } catch (error) {
        console.error('Error al buscar horarios:', error);
        setSearchErrors({ form: 'Error al conectar con la API' });
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <h3 className="mb-4 text-center">Buscar Horarios</h3>
      <Form onSubmit={handleSearchSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="searchDate">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={searchData.date}
                onChange={handleSearchChange}
                required
                min={todayStr}
                max={maxDateStr}
                isInvalid={!!searchErrors.date}
              />
              <Form.Control.Feedback type="invalid">
                {searchErrors.date}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="searchHour">
              <Form.Label>Hora</Form.Label>
              <Form.Select
                name="hour"
                value={searchData.hour}
                onChange={handleSearchChange}
                required
                isInvalid={!!searchErrors.hour}
                disabled={!searchData.date}
              >
                <option value="">Selecciona una hora</option>
                {availableHours.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {searchErrors.hour}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <div className="text-center">
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
        {searchErrors.form && (
          <div className="alert alert-danger mt-3" role="alert">
            {searchErrors.form}
          </div>
        )}
      </Form>

      {schedules.length > 0 && (
        <div className="mt-4">
          <ScheduleList 
            schedules={schedules} 
            onScheduleReserved={(scheduleId) => {
              setSchedules(prev => prev.filter(s => (s._id || s.id) !== scheduleId));
              if (onReservationMade) {
                onReservationMade();
              }
            }}
          />
        </div>
      )}

      {schedules.length === 0 && !loading && searchData.date && searchData.hour && (
        <p className="text-center text-muted mt-4">No se encontraron horarios.</p>
      )}
    </>
  );
}

export default ScheduleSearch;