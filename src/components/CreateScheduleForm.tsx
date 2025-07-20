import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { useState, useEffect, type ChangeEvent } from 'react';
import { ScheduleService } from '../services/ScheduleService';
import { FieldService } from '../services/FieldService';
import { ClubService } from '../services/ClubService';
import type { Club } from "../models/Club";
import type { Field } from "../models/Field";
import type { Schedule } from "../models/Schedule";

interface ScheduleFormProps {
  clubId: string;
  onSuccess?: () => void;
}

function CreateScheduleForm({ clubId, onSuccess }: ScheduleFormProps): ReturnType<React.FC> {
  const [club, setClub] = useState<Club | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  // Estado para los filtros y datos del formulario
  const [formData, setFormData] = useState<{
    period: 'weekly' | 'monthly';
    price: number;
    selectAll: boolean;
    selectedFields: { [key: string]: boolean };
    weekdays: { startHour: string; endHour: string };
    saturday: { startHour: string; endHour: string };
    sunday: { startHour: string; endHour: string };
  }>({
    period: 'weekly',
    price: 25000,
    selectAll: true,
    selectedFields: {},
    weekdays: { startHour: '08:00', endHour: '22:00' },
    saturday: { startHour: '08:00', endHour: '22:00' },
    sunday: { startHour: '08:00', endHour: '22:00' },
  });
  // Estado para errores
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const clubData = await ClubService.getById(clubId);
        setClub(clubData);
        
        // Obtener fields usando los fieldId del club
        if (clubData.fieldId && clubData.fieldId.length > 0) {
          const fieldsData = await Promise.all(
            clubData.fieldId.map(fieldId => FieldService.getById(fieldId))
          );
          setFields(fieldsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    if (clubId) {
      fetchData();
    }
  }, [clubId]);

  // Seleccionar todas las canchas por defecto
  useEffect(() => {
    if (fields.length > 0 && Object.keys(formData.selectedFields).length === 0) {
      const availableFields = fields.filter((field) => field.isAvailable);
      const allSelected = availableFields.reduce((acc, field) => {
        const fieldId = field._id || field.id;
        if (fieldId) {
          acc[fieldId] = true;
        }
        return acc;
      }, {} as { [key: string]: boolean });

      setFormData(prev => ({ ...prev, selectedFields: allSelected, selectAll: true }));
    }
  }, [fields, formData.selectedFields]);

  if (loading) {
    return (
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <h4>Cargando...</h4>
      </Container>
    );
  }

  if (!club) {
    return (
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <h4>Club no encontrado</h4>
      </Container>
    );
  }

  // Filtrar canchas disponibles
  const availableFields = fields.filter((field) => field.isAvailable);

  // Generar horarios disponibles
  const generateHours = (start: string, end: string): string[] => {
    const hours: string[] = [];
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    for (let i = startHour; i <= endHour; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return hours;
  };

  // Manejo de cambios en el formulario
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      if (type === 'checkbox' && name === 'selectAll') {
        const newSelectedFields = availableFields.reduce((acc, field) => {
          const fieldId = field._id || field.id;
          if (fieldId) {
            acc[fieldId] = checked || false;
          }
          return acc;
        }, {} as { [key: string]: boolean });
        return {
          ...prev,
          selectAll: checked,
          selectedFields: newSelectedFields,
        };
      } else if (type === 'checkbox') {
        const fieldId = value;
        return {
          ...prev,
          selectedFields: {
            ...prev.selectedFields,
            [fieldId]: checked || false,
          },
        };
      } else if (name.includes('.')) {
        const [section, field] = name.split('.');
        return {
          ...prev,
          [section]: {
            ...prev[section as keyof typeof prev],
            [field]: value,
          },
        };
      } else {
        const finalValue = name === 'price' ? parseInt(value) || 0 : value;
        return { ...prev, [name]: finalValue };
      }
    });
  }

  // Validación del formulario
  function validateForm(): boolean {
    const newErrors: { [key: string]: string } = {};

    // Validar horarios
    const validateHours = (start: string, end: string, label: string) => {
      const startHour = parseInt(start.split(':')[0]);
      const endHour = parseInt(end.split(':')[0]);
      if (startHour >= endHour) {
        newErrors[label] = `La hora de fin debe ser mayor a la de inicio en ${label}`;
      }
    };

    validateHours(formData.weekdays.startHour, formData.weekdays.endHour, 'weekdays');
    validateHours(formData.saturday.startHour, formData.saturday.endHour, 'saturday');
    validateHours(formData.sunday.startHour, formData.sunday.endHour, 'sunday');

    if (Object.values(formData.selectedFields).every((v) => !v)) {
      newErrors.fields = 'Debe seleccionar al menos una cancha';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Generar y enviar horarios
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validateForm()) {
      const schedules: Schedule[] = [];
      const selectedFieldIds = Object.keys(formData.selectedFields).filter(
        (fieldId) => formData.selectedFields[fieldId]
      );
      // Generar fechas según el período
      const generateDates = () => {
        const dates: { date: string; dayType: 'weekdays' | 'saturday' | 'sunday' }[] = [];
        const today = new Date();
        const endDate = new Date(today);
        
        if (formData.period === 'weekly') {
          endDate.setDate(today.getDate() + 7);
        } else {
          endDate.setMonth(today.getMonth() + 1);
        }

        let currentDate = new Date(today);
        while (currentDate < endDate) {
          const dayOfWeek = currentDate.getDay();
          let dayType: 'weekdays' | 'saturday' | 'sunday';
          
          if (dayOfWeek === 0) dayType = 'sunday';
          else if (dayOfWeek === 6) dayType = 'saturday';
          else dayType = 'weekdays';

          dates.push({
            date: currentDate.toISOString().split('T')[0],
            dayType
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
      };

      const dates = generateDates();


      dates.forEach(({ date, dayType }) => {
        const hours = generateHours(formData[dayType].startHour, formData[dayType].endHour);

        
        hours.forEach(hour => {
          selectedFieldIds.forEach((fieldId) => {
            if (fieldId === 'undefined') return; // Skip undefined IDs
            const field = availableFields.find((f) => (f._id || f.id) === fieldId);

            if (field) {
              const schedule = {
                fieldId,
                clubId: club.id || club._id || '',
                fieldName: field.name,
                clubName: club.name,
                price: formData.price,
                date,
                startHour: hour,
                isAvailable: true,
              };

              schedules.push(schedule);
            }
          });
        });
      });

      try {

        await ScheduleService.createBulk(schedules);

        onSuccess?.();
      } catch (error) {
        console.error('Error al crear horarios:', error);
        setErrors({ form: 'Error al crear horarios' });
      }
    }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100 pt-5">
      <Row className="w-100">
        <Col md={8} lg={6} className="mx-auto">
          <h3 className="mb-4 text-center">Crear Horarios</h3>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Período</Form.Label>
                  <Form.Select name="period" value={formData.period} onChange={handleChange}>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Precio por hora</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="1000"
                    step="1000"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <h5>Lunes a Viernes</h5>
                <Form.Group className="mb-2">
                  <Form.Label>Hora Inicio</Form.Label>
                  <Form.Select name="weekdays.startHour" value={formData.weekdays.startHour} onChange={handleChange}>
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(hour => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Hora Fin</Form.Label>
                  <Form.Select name="weekdays.endHour" value={formData.weekdays.endHour} onChange={handleChange}>
                    {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(hour => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                {errors.weekdays && <div className="text-danger small">{errors.weekdays}</div>}
              </Col>
              <Col md={4}>
                <h5>Sábado</h5>
                <Form.Group className="mb-2">
                  <Form.Label>Hora Inicio</Form.Label>
                  <Form.Select name="saturday.startHour" value={formData.saturday.startHour} onChange={handleChange}>
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(hour => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Hora Fin</Form.Label>
                  <Form.Select name="saturday.endHour" value={formData.saturday.endHour} onChange={handleChange}>
                    {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(hour => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                {errors.saturday && <div className="text-danger small">{errors.saturday}</div>}
              </Col>
              <Col md={4}>
                <h5>Domingo</h5>
                <Form.Group className="mb-2">
                  <Form.Label>Hora Inicio</Form.Label>
                  <Form.Select name="sunday.startHour" value={formData.sunday.startHour} onChange={handleChange}>
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(hour => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Hora Fin</Form.Label>
                  <Form.Select name="sunday.endHour" value={formData.sunday.endHour} onChange={handleChange}>
                    {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(hour => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                {errors.sunday && <div className="text-danger small">{errors.sunday}</div>}
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="selectAll"
                label="Seleccionar todas las canchas"
                checked={formData.selectAll}
                onChange={handleChange}
              />
              {!formData.selectAll && availableFields.map((field) => (
                <Form.Check
                  key={field._id}
                  type="checkbox"
                  name="field"
                  value={field._id!}
                  label={field.name}
                  checked={formData.selectedFields[field._id!] || false}
                  onChange={handleChange}
                />
              ))}
            </Form.Group>
            {errors.fields && <div className="text-danger">{errors.fields}</div>}
            {errors.form && <div className="alert alert-danger">{errors.form}</div>}
            <div className="text-center">
              <Button variant="primary" type="submit">
                Crear Horarios
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default CreateScheduleForm;