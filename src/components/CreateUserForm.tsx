import { Form, Button, InputGroup } from 'react-bootstrap';
import { useState, type ChangeEvent } from 'react';
import type {User} from "../models/User.ts";
import { UserService } from '../services/UserService.ts';
// Tipo para FormControlElement, compatible con react-bootstrap
type FormControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

interface CreateUserFormProps {
  onSuccess?: () => void;
}

function CreateUserForm({ onSuccess }: CreateUserFormProps): ReturnType<React.FC> {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState<User>({
    _id: '',
    name: '',
    birthDate: '',
    email: '',
    phone: '',
    password: '',
    role: 'player',
  });
  // Estado para la confirmación de la contraseña
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  // Estado para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  // Estado para los errores de validación
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Manejo de cambios en los campos del formulario
  function handleChange(e: ChangeEvent<FormControlElement>) {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  // Validación del formulario
  function validateForm(): boolean {
    const newErrors: { [key: string]: string } = {};
    const today = new Date();
    const birthDate = new Date(formData.birthDate);

    // Validar campos obligatorios
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.email.trim()) newErrors.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'El correo no es válido';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    if (!formData.birthDate)
      newErrors.birthDate = 'La fecha de nacimiento es obligatoria';
    else if (birthDate >= today)
      newErrors.birthDate = 'La fecha debe ser anterior a hoy';
    if (!formData.password)
      newErrors.password = 'La contraseña es obligatoria';
    else if (formData.password.length < 6)
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    if (!confirmPassword)
      newErrors.confirmPassword = 'Confirma tu contraseña';
    else if (formData.password !== confirmPassword)
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    if (!formData.role) newErrors.role = 'El rol es obligatorio';
    else if (!['player', 'owner'].includes(formData.role))
      newErrors.role = 'Selecciona un rol válido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Manejo del envío del formulario
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validateForm()) {
      const user: User = {
        _id: crypto.randomUUID(),
        ...formData,
      };
      try {
        const createdUser = await UserService.create(user);
        console.log('Usuario creado:', createdUser);
        // Reiniciar el formulario
        setFormData({
          _id: '',
          name: '',
          birthDate: '',
          email: '',
          phone: '',
          password: '',
          role: 'player',
        });
        setConfirmPassword('');
        setErrors({});
        // Llamar al callback de éxito si existe
        onSuccess?.();
      } catch (error) {
        setErrors({ form: 'Error al crear el usuario' });
      }
    }
  }

  return (
    <div className="container mt-4 pt-5">
      <h2 className="mb-4">Crear Usuario</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Escribe tu nombre"
            required
            isInvalid={!!errors.name}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBirthDate">
          <Form.Label>Fecha de Nacimiento</Form.Label>
          <Form.Control
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            required
            isInvalid={!!errors.birthDate}
          />
          <Form.Control.Feedback type="invalid">
            {errors.birthDate}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Correo Electrónico</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Escribe tu correo"
            required
            isInvalid={!!errors.email}
          />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPhone">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Escribe tu número de teléfono"
            required
            isInvalid={!!errors.phone}
          />
          <Form.Control.Feedback type="invalid">
            {errors.phone}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Contraseña</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Escribe tu contraseña"
              required
              isInvalid={!!errors.password}
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </Button>
          </InputGroup>
          {errors.password && (
            <div className="invalid-feedback d-block">
              {errors.password}
            </div>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="formConfirmPassword">
          <Form.Label>Confirmar Contraseña</Form.Label>
          <InputGroup>
            <Form.Control
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Confirma tu contraseña"
              required
              isInvalid={!!errors.confirmPassword}
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </Button>
          </InputGroup>
          {errors.confirmPassword && (
            <div className="invalid-feedback d-block">
              {errors.confirmPassword}
            </div>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="formRole">
          <Form.Label>Rol</Form.Label>
          <Form.Select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            isInvalid={!!errors.role}
          >
            <option value="">Selecciona un rol</option>
            <option value="player">Player</option>
            <option value="owner">Owner</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.role}
          </Form.Control.Feedback>
        </Form.Group>

        {errors.form && (
          <div className="alert alert-danger" role="alert">
            {errors.form}
          </div>
        )}

        <Button variant="primary" type="submit">
          Crear
        </Button>
      </Form>
    </div>
  );
}

export default CreateUserForm;