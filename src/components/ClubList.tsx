import { Button, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import type { Club } from '../models/Club';
import CardClub from './CardClub';

interface ClubListProps {
  clubs: Club[];
  onManageClub?: (clubId: string) => void;
}

function ClubList({ clubs, onManageClub }: ClubListProps): React.ReactNode {
  const [sortBy, setSortBy] = useState<'name' | 'address' | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  function handleSort(by: 'name' | 'address') {
    if (sortBy === by) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(by);
      setSortOrder('asc');
    }
  }

  const sortedClubs = [...clubs].sort((a, b) => {
    if (sortBy === 'name') return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    if (sortBy === 'address') return sortOrder === 'asc' ? a.address.localeCompare(b.address) : b.address.localeCompare(a.address);
    return 0;
  });

  if (!clubs.length) return null;

  return (
    <div className="mt-5">
      <h4 className="mb-3 text-center">Lista de Clubes</h4>
      <div className="d-flex justify-content-between mb-2">
        <Button variant="link" onClick={() => handleSort('name')} className="p-0">
          Ordenar por Nombre {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
        <Button variant="link" onClick={() => handleSort('address')} className="p-0">
          Ordenar por Dirección {sortBy === 'address' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
      </div>

      <Row>
        {sortedClubs.map((club) => (
          <Col md={6} lg={4} key={club._id || club.name} className="mb-3">
            <CardClub 
              club={club} 
              onManage={onManageClub}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default ClubList;