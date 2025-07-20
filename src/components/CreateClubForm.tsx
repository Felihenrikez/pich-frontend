import { Form, Button } from 'react-bootstrap';
import { useState, type ChangeEvent } from 'react';
import type {Club} from "../models/Club.ts";
import { ClubService } from '../services/ClubService.ts';



// Props para recibir userId
interface CreateClubFormProps {
  userId: string;
  onSuccess?: () => void;
}

// Tipo para FormControlElement, compatible con react-bootstrap
type FormControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function CreateClubForm({ userId, onSuccess }: CreateClubFormProps): ReturnType<React.FC> {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState<Omit<Club, '_id' | 'fieldId'>>({
    userId,
    name: '',
    address: '',
    phone: '',
    descripcion: '',
    imageURL: '',
  });
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
    if (!formData.name.trim()) newErrors.name = 'El nombre del club es obligatorio';
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    else if (!/^\+?[\d\s-]{8,}$/.test(formData.phone))
      newErrors.phone = 'El teléfono no es válido';
    if (formData.imageURL && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(formData.imageURL))
      newErrors.imageURL = 'La URL de la imagen no es válida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Manejo del envío del formulario
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validateForm()) {
      const club: Club = {
        ...formData,
        userId,
        fieldId: [],
      };
      console.log('JSON enviado:', JSON.stringify(club, null, 2));
      try {
        const createdClub = await ClubService.create(club as Club);
        console.log('Club creado:', createdClub);
        // Reiniciar el formulario
        setFormData({
          userId,
          name: '',
          address: '',
          phone: '',
          descripcion: '',
          imageURL: '',
        });
        setErrors({});
        onSuccess?.();
      } catch (error) {
        setErrors({ form: 'Error al crear el club' });
      }
    }
  }

  return (
    <div className="container mt-4 pt-5">
      <h2 className="mb-4">Crear Club</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label>Nombre del Club</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Escribe el nombre del club"
            required
            isInvalid={!!errors.name}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formAddress">
          <Form.Label>Dirección</Form.Label>
          <Form.Control
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Escribe la dirección del club"
            required
            isInvalid={!!errors.address}
          />
          <Form.Control.Feedback type="invalid">
            {errors.address}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPhone">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Escribe el número de teléfono"
            required
            isInvalid={!!errors.phone}
          />
          <Form.Control.Feedback type="invalid">
            {errors.phone}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formDescription">
          <Form.Label>Descripción (Opcional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Describe tu club"
            isInvalid={!!errors.descripcion}
          />
          <Form.Control.Feedback type="invalid">
            {errors.descripcion}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formImageUrl">
          <Form.Label>URL de la Imagen (Opcional)</Form.Label>
          <Form.Control
            type="url"
            name="imageURL"
            value={formData.imageURL}
            onChange={handleChange}
            placeholder="Escribe la URL de la imagen"
            isInvalid={!!errors.imageURL}
          />
          <Form.Control.Feedback type="invalid">
            {errors.imageURL}
          </Form.Control.Feedback>
        </Form.Group>

        {errors.form && (
          <div className="alert alert-danger" role="alert">
            {errors.form}
          </div>
        )}

        <Button variant="primary" type="submit">
          Crear Club
        </Button>
      </Form>
    </div>
  );
}

export default CreateClubForm;