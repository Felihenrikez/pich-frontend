import { Container, Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import ScheduleSearch from '../components/ScheduleSearch.tsx';
import Navigation from '../components/Navigation.tsx';
import Login from './Login.tsx';
import CreateUserForm from '../components/CreateUserForm.tsx';
import HomePlayer from './HomePlayer.tsx';
import HomeOwner from './HomeOwner.tsx';
import { AuthService } from '../services/AuthService.ts';

type PageType = 'home' | 'login' | 'register';

function Home(): React.ReactNode {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const authenticated = AuthService.isAuthenticated();
    const user = AuthService.getUser();
    setIsAuthenticated(authenticated);
    setUserRole(user?.role || null);
  }, []);

  function handleLoginClick() {
    setCurrentPage('login');
  }

  function handleRegisterClick() {
    setCurrentPage('register');
  }

  function handleBackToHome() {
    setCurrentPage('home');
  }

  function handleLogout() {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentPage('home');
  }

  // Si está autenticado, mostrar la página según el rol
  if (isAuthenticated && userRole) {
    if (userRole === 'player') {
      return <HomePlayer onLogout={handleLogout} />;
    }
    if (userRole === 'owner') {
      return <HomeOwner onLogout={handleLogout} />;
    }
  }

  if (currentPage === 'login') {
    return (
      <>
        <Navigation onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
        <Login />
      </>
    );
  }

  if (currentPage === 'register') {
    return (
      <>
        <Navigation onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
        <CreateUserForm onSuccess={handleLoginClick} />
      </>
    );
  }

  return (
    <>
      <Navigation onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <Row className="w-100">
          <Col md={8} lg={6} className="mx-auto">
            <ScheduleSearch />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Home;