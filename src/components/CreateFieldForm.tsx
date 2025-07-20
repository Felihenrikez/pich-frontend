import { Form, Button } from 'react-bootstrap';
import { useState, type ChangeEvent } from 'react';
import type {Field} from "../models/Field.tsx";


// Props para recibir clubId y callback de éxito
interface CreateFieldFormProps {
  clubId: string;
  onSuccess?: () => void;
}

// Tipo para FormControlElement, compatible con react-bootstrap
type FormControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function CreateFieldForm({ clubId, onSuccess }: CreateFieldFormProps): ReturnType<React.FC> {
  console.log('clubId recibido:', clubId);
  // Estado para los datos del formulario
  const [formData, setFormData] = useState<Omit<Field, '_id' | 'clubId' | 'isAvailable'>>(
    {
      name: '',
      sportType: 'Futbolito 6',
      description: '',
      imageUrl: '',
    }
  );
  // Estado para los errores de validación
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Manejo de cambios en los campos del formulario
  function handleChange(e: ChangeEvent<FormControlElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Validación del formulario
  function validateForm(): boolean {
    const newErrors: { [key: string]: string } = {};

    // Validar campos obligatorios
    if (!formData.name.trim()) newErrors.name = 'El nombre del campo es obligatorio';
    if (!formData.sportType) newErrors.sportType = 'El tipo de deporte es obligatorio';
    else if (formData.sportType !== 'Futbolito 6')
      newErrors.sportType = 'Selecciona un tipo de deporte válido';
    if (formData.imageUrl && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(formData.imageUrl))
      newErrors.imageUrl = 'La URL de la imagen no es válida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Manejo del envío del formulario
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validateForm()) {
      const field: Omit<Field, '_id'> = {
        clubId,
        isAvailable: true,
        ...formData,
      };
      console.log('JSON enviado:', JSON.stringify(field, null, 2));
      try {
        const response = await fetch('http://localhost:3000/api/fields', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(field),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear el campo');
        }
        
        const data = await response.json();
        console.log('Campo creado:', data);
        
        // Reiniciar el formulario
        setFormData({
          name: '',
          sportType: 'Futbolito 6',
          description: '',
          imageUrl: '',
        });
        setErrors({});
        
        // Llamar callback de éxito si existe
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error('Error creating field:', error);
        setErrors({ 
          form: error instanceof Error ? error.message : 'Error al crear el campo'
        });
      }
    }
  }

  return (
    <div className="container mt-4 pt-5">
      <h2 className="mb-4">Crear Campo</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label>Nombre del Campo</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Escribe el nombre del campo (ej: Cancha 1)"
            required
            isInvalid={!!errors.name}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formSportType">
          <Form.Label>Tipo de Deporte</Form.Label>
          <Form.Select
            name="sportType"
            value={formData.sportType}
            onChange={handleChange}
            required
            isInvalid={!!errors.sportType}
          >
            <option value="">Selecciona un tipo de deporte</option>
            <option value="Futbolito 6">Futbolito 6</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.sportType}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formDescription">
          <Form.Label>Descripción (Opcional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe el campo"
            isInvalid={!!errors.description}
          />
          <Form.Control.Feedback type="invalid">
            {errors.description}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formImageUrl">
          <Form.Label>URL de la Imagen (Opcional)</Form.Label>
          <Form.Control
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="Escribe la URL de la imagen"
            isInvalid={!!errors.imageUrl}
          />
          <Form.Control.Feedback type="invalid">
            {errors.imageUrl}
          </Form.Control.Feedback>
        </Form.Group>

        {errors.form && (
          <div className="alert alert-danger" role="alert">
            {errors.form}
          </div>
        )}

        <Button variant="primary" type="submit">
          Crear Campo
        </Button>
      </Form>
    </div>
  );
}

export default CreateFieldForm;