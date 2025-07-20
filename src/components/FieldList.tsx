import { Button, Card, Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import type { Field } from '../models/Field';
import { FieldService } from '../services/FieldService';

interface FieldListProps {
  clubId: string;
  onCreateField?: () => void;
  onManageSchedules?: () => void;
}

function FieldList({ clubId, onCreateField, onManageSchedules }: FieldListProps): React.ReactNode {
  const [fields, setFields] = useState<Field[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'sportType' | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    async function fetchFields() {
      try {
        console.log('Buscando fields para clubId:', clubId);
        const fieldsData = await FieldService.getByClubId(clubId);
        console.log('Fields encontrados:', fieldsData);
        setFields(fieldsData);
      } catch (error) {
        console.error('Error fetching fields:', error);
      }
    }
    if (clubId) {
      fetchFields();
    }
  }, [clubId]);

  function handleSort(by: 'name' | 'sportType') {
    if (sortBy === by) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(by);
      setSortOrder('asc');
    }
  }

  const sortedFields = [...fields].sort((a, b) => {
    if (sortBy === 'name') return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    if (sortBy === 'sportType') return sortOrder === 'asc' ? a.sportType.localeCompare(b.sportType) : b.sportType.localeCompare(a.sportType);
    return 0;
  });

  return (
    <div className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Lista de Canchas</h4>
        {onManageSchedules && fields.length > 0 && (
          <Button variant="primary" onClick={onManageSchedules}>
            Administrar Horarios
          </Button>
        )}
      </div>
      
      {!fields.length && (
        <div className="text-center py-5">
          <p className="text-muted">Este club aún no tiene canchas registradas.</p>
        </div>
      )}
      
      {fields.length > 0 && (
        <>
          <div className="d-flex justify-content-between mb-2">
            <Button variant="link" onClick={() => handleSort('name')} className="p-0">
              Ordenar por Nombre {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
            <Button variant="link" onClick={() => handleSort('sportType')} className="p-0">
              Ordenar por Deporte {sortBy === 'sportType' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
          </div>

          <Row>
            {sortedFields.map((field) => (
              <Col md={6} lg={4} key={field._id || field.name} className="mb-3">
                <Card>
                  {field.imageUrl && <Card.Img variant="top" src={field.imageUrl} />}
                  <Card.Body>
                    <Card.Title>{field.name}</Card.Title>
                    <Card.Text>
                      <strong>{field.sportType}</strong><br/>
                      Estado: <span className={`badge ${field.isAvailable ? 'bg-success' : 'bg-danger'}`}>
                        {field.isAvailable ? 'Disponible' : 'No disponible'}
                      </span><br/>
                      {field.description && <>{field.description}</>}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
      
      {onCreateField && (
        <Button 
          variant="success" 
          className="position-fixed bottom-0 end-0 m-4"
          onClick={onCreateField}
        >
          Crear Cancha
        </Button>
      )}
    </div>
  );
}

export default FieldList;