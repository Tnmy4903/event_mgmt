import React from 'react';
import '../../styles/EventCard.css'; // Ensure this file exists for styling

const EventCard = ({ event, onApprove, onDelete, onBook, onViewBookings }) => {
  return (
    <div className="event-card">
      <h3 className="event-title">{event.title}</h3> {/* Matches backend "title" */}
      <p className="event-desc"><strong>Description:</strong> {event.description}</p> {/* Matches backend "description" */}
      <p className="event-date"><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p> {/* Matches backend "date" */}
      <p className="event-time"><strong>Time:</strong> {event.time || 'N/A'}</p>
      <p className="event-location"><strong>Location:</strong> {event.location || 'N/A'}</p>
      <p className="event-price"><strong>Price:</strong> ₹{event.price}</p>
      <p className="event-status"><strong>Status:</strong> {event.status}</p>
      <p className="event-organizer"><strong>Organizer:</strong> {event.organizer || 'N/A'}</p>
      <p className="event-capacity"><strong>Capacity:</strong> {event.capacity || 'N/A'}</p>
      <p className="event-booked"><strong>Booked:</strong> {event.booked || 0}</p>

      <div className="event-actions">
        {onApprove && <button onClick={onApprove} className="btn-approve">Approve</button>}
        {onDelete && <button onClick={onDelete} className="btn-delete">Delete</button>}
        {onBook && <button onClick={onBook} className="btn-book">Book Now</button>}
        {onViewBookings && <button onClick={onViewBookings}>See Bookings</button>}
      </div>
    </div>
  );
};

export default EventCard;