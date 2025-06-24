import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../shared/EventCard';
import '../../styles/UserDashboard.css';
import { getApprovedEvents, getMyBookings } from '../../services/userApi';

const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const data = await getApprovedEvents();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const handleBook = (eventId) => {
    navigate(`/book/${eventId}`);
  };

  const handleDownload = async (ticketId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/api/customer/tickets/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket_${ticketId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Error downloading ticket:", error);
      alert("Failed to download ticket. Please try again.");
    }
  };

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5000/api/customer/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to cancel");
      }

      alert("Booking cancelled successfully");
      fetchBookings(); // Refresh booking list
    } catch (error) {
      console.error("❌ Cancel error:", error);
      alert("Cancellation failed");
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchBookings();
  }, []);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className='user-dashboard'>
      <h2>Available Events</h2>
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        events.map(event => (
          <EventCard
            key={event._id}
            event={event}
            onBook={() => handleBook(event._id)}
          />
        ))
      )}

      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map(booking => (
          <div key={booking._id} className="booking-card">
            <h4>🎟 Ticket ID: {booking.ticket_id}</h4>
            <p><strong>Booking ID:</strong> {booking._id}</p>
            <p><strong>Event ID:</strong> {booking.event_id}</p>
            <p><strong>Booked At:</strong> {formatDate(booking.booked_at)}</p>
            <button className="download-btn" onClick={() => handleDownload(booking.ticket_id)}>
              Download Ticket PDF
            </button>
            <button
              className="cancel-btn"
              onClick={() => handleCancel(booking._id)}
            >
              Cancel Booking
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default UserDashboard;


