import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import type { Field } from "../models/Field.ts";
import * as React from "react";

interface FieldProps {
  field: Field
}

function CardField({ field }: FieldProps): ReturnType<React.FC> {
  return (
    <Card>
      <Card.Img variant="top" src={field.imageUrl || "holder.js/100px180?text=Image cap"} />
      <Card.Body>
        <Card.Title>{field.name}</Card.Title>
        <Card.Text>
          {field.description}
        </Card.Text>
      </Card.Body>
      <ListGroup className="list-group-flush">
        <ListGroup.Item>Deporte: {field.sportType}</ListGroup.Item>
        <ListGroup.Item>Estado: {field.isAvailable ? 'Disponible' : 'No disponible'}</ListGroup.Item>
      </ListGroup>
    </Card>
  );
}

export default CardField;