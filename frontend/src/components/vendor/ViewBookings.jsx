import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVendorEventBookings } from '../../services/vendorApi';
import '../../styles/ViewBookings.css';

const ViewBookings = () => {
  const { eventId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getVendorEventBookings(eventId);
        console.log('📦 Bookings response:', data); // 👈 View this in browser console

        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          setError('Unexpected response format');
        }
      } catch (err) {
        console.error('❌ Error fetching bookings:', err);
        setError('Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [eventId]);

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Bookings for Event ID: {eventId}</h2>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map((booking, idx) => {
          const key = booking._id 
            ? booking._id 
            : `${booking.user_id}-${booking.booking_date}-${idx}`;

          return (
            <div key={key} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
              <p><strong>User ID:</strong> {booking.user_id}</p>
              <p><strong>Name:</strong> {booking.user_name}</p>
              <p><strong>Email:</strong> {booking.user_email}</p>
              <p><strong>Ticket ID:</strong> {booking.ticket_id}</p>
              <p>
                <strong>Booked At:</strong>{' '}
                {booking.booking_date
                  ? new Date(booking.booking_date).toLocaleString()
                  : '—'}
              </p>
              <p><strong>Tickets:</strong> {booking.tickets}</p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ViewBookings;

