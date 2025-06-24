import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../shared/EventCard';
import '../../styles/VendorDashboard.css';
import { getMyEvents, deleteEvent, createEvent } from '../../services/vendorApi';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newEvent, setNewEvent] = useState({
    event_name: '',
    event_date: '',
    event_description: '',
    price: 0,
    capacity: 0,
    location: '',
    time: '',
    organizer: '',
  });

  const handleViewBookings = (eventId) => {
    navigate(`/vendor/bookings/${eventId}`);
  };

  const fetchMyEvents = async () => {
    try {
      const data = await getMyEvents();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching vendor events:', err);
      setError('Failed to fetch events.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await deleteEvent(eventId);
      fetchMyEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await createEvent(newEvent);
      setNewEvent({
        event_name: '',
        event_date: '',
        event_description: '',
        price: 0,
        capacity: 0,
        location: '',
        time: '',
        organizer: '',
      });
      fetchMyEvents();
    } catch (err) {
      console.error('Error creating event:', err);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className='vendor-dashboard'>
      <h2>My Events</h2>

      <button
        onClick={() => navigate('/vendor/validate/scanner')}
        className="validate-ticket-btn"
      >
        📷 Scan Ticket QR
      </button>


      <form onSubmit={handleCreateEvent}>
        <input type="text" placeholder="Event Name" value={newEvent.event_name} onChange={(e) => setNewEvent({ ...newEvent, event_name: e.target.value })} required />
        <input type="date" value={newEvent.event_date} onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })} required />
        <textarea placeholder="Event Description" value={newEvent.event_description} onChange={(e) => setNewEvent({ ...newEvent, event_description: e.target.value })} required />
        <input type="time" placeholder="Time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} required />
        <input type="number" placeholder="Price" value={newEvent.price} onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })} required />
        <input type="number" placeholder="Capacity" value={newEvent.capacity} onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })} required />
        <input type="text" placeholder="Location" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} required />
        <input type="text" placeholder="Organizer" value={newEvent.organizer} onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })} required />
        <button type="submit">Create Event</button>
      </form>

      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            onDelete={() => handleDelete(event._id)}
            onViewBookings={() => handleViewBookings(event._id)}
          />
        ))
      )}
    </div>
  );
};

export default VendorDashboard;


