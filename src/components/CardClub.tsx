import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import type { Club } from "../models/Club.ts";
import * as React from "react";

interface ClubProps {
  club: Club;
  onManage?: (clubId: string) => void;
}

function CardClub({ club,  onManage }: ClubProps): ReturnType<React.FC> {
  console.log('Club data:', club);
  console.log('club.fieldId:', club.fieldId);
  const clubFieldCount = club.fieldId?.length || 0;
  console.log('clubFieldCount:', clubFieldCount);
  
  return (
    <Card>
      <Card.Img variant="top" src={club.imageUrl || "holder.js/100px180?text=Image cap"} />
      <Card.Body>
        <Card.Title>{club.name}</Card.Title>
        <Card.Text>
          {club.descripcion}
        </Card.Text>
      </Card.Body>
      <ListGroup className="list-group-flush">
        <ListGroup.Item>Dirección: {club.address}</ListGroup.Item>
        <ListGroup.Item>Teléfono: {club.phone}</ListGroup.Item>
        <ListGroup.Item>
          <strong>Canchas ({clubFieldCount}):</strong>
          {clubFieldCount > 0 ? (
            <span className="text-success"> {clubFieldCount} cancha{clubFieldCount > 1 ? 's' : ''}</span>
          ) : (
            <span className="text-muted"> Sin canchas</span>
          )}
        </ListGroup.Item>
      </ListGroup>
      {onManage && (
        <Card.Body>
          <Button variant="primary" onClick={() => onManage(club.id || club._id || '')}>
            Administrar Club
          </Button>
        </Card.Body>
      )}
    </Card>
  );
}

export default CardClub;