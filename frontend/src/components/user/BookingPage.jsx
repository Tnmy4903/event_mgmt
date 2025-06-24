import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getApprovedEvents, bookEventWithDetails } from '../../services/userApi';
import '../../styles/BookingPage.css';

const BookingPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [coupon, setCoupon] = useState('');
  const [userDetails, setUserDetails] = useState({ name: '', email: '' });

  useEffect(() => {
    const fetchEvent = async () => {
      const allEvents = await getApprovedEvents();
      const selected = allEvents.find(e => e._id === eventId);
      setEvent(selected);
    };
    fetchEvent();
  }, [eventId]);

  const handleBooking = async () => {
    try {
      const payload = {
        eventId,
        quantity,
        coupon,
        userDetails,
      };
      const res = await bookEventWithDetails(payload);
      alert(res.message || "Booking success");
    } catch (e) {
      alert(e?.response?.data?.message || "Booking failed");
    }
  };

  if (!event) return <p>Loading event...</p>;

  return (
    <div className="booking-container">
      <h2 className="booking-heading">Book Tickets for {event.title}</h2>
  
      <div className="booking-form">
        <label>
          Quantity:
          <input type="number" min={1} max={event.capacity - event.booked} value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} />
        </label>
  
        <label>
          Name:
          <input type="text" value={userDetails.name} onChange={e => setUserDetails({ ...userDetails, name: e.target.value })} />
        </label>
  
        <label>
          Email:
          <input type="email" value={userDetails.email} onChange={e => setUserDetails({ ...userDetails, email: e.target.value })} />
        </label>
  
        <label>
          Coupon Code:
          <input type="text" value={coupon} onChange={e => setCoupon(e.target.value)} />
        </label>
  
        <button className="book-button" onClick={handleBooking}>Proceed to Pay</button>
      </div>
    </div>
  );
};

export default BookingPage;
