import { Button, Container } from 'react-bootstrap';

interface NavigationProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

function Navigation({ onLoginClick, onRegisterClick }: NavigationProps): React.ReactNode {
  return (
    <Container fluid className="position-absolute top-0 end-0 p-3">
      <div className="d-flex gap-2">
        <Button variant="outline-primary" onClick={onLoginClick}>
          Iniciar Sesión
        </Button>
        <Button variant="primary" onClick={onRegisterClick}>
          Crear Usuario
        </Button>
      </div>
    </Container>
  );
}

export default Navigation;