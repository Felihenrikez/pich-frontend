import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import type { Schedule } from "../models/Schedule.tsx";
import * as React from "react";

interface ScheduleProps {
  schedule: Schedule;
}

function CardSchedule({ schedule }: ScheduleProps): ReturnType<React.FC> {
  const cardStyle = {
    backgroundColor: schedule.isAvailable ? '#d4edda' : '#f8d7da',
    borderColor: schedule.isAvailable ? '#c3e6cb' : '#f5c6cb'
  };

  return (
    <Card style={cardStyle}>
      <Card.Body>
        <Card.Title>{schedule.fieldName}</Card.Title>
        <Card.Text>
          <strong>{schedule.clubName}</strong>
        </Card.Text>
      </Card.Body>
      <ListGroup className="list-group-flush">
        <ListGroup.Item style={{ backgroundColor: 'transparent' }}>
          <strong>Fecha:</strong> {schedule.date}
        </ListGroup.Item>
        <ListGroup.Item style={{ backgroundColor: 'transparent' }}>
          <strong>Hora:</strong> {schedule.startHour}
        </ListGroup.Item>
        <ListGroup.Item style={{ backgroundColor: 'transparent' }}>
          <strong>Precio:</strong> ${schedule.price.toLocaleString()}
        </ListGroup.Item>
        <ListGroup.Item style={{ backgroundColor: 'transparent' }}>
          <strong>Estado:</strong> 
          <span className={`badge ms-2 ${schedule.isAvailable ? 'bg-success' : 'bg-danger'}`}>
            {schedule.isAvailable ? 'Disponible' : 'No disponible'}
          </span>
        </ListGroup.Item>
      </ListGroup>
    </Card>
  );
}

export default CardSchedule;