import React, { useEffect, useState } from 'react';
import EventCard from '../shared/EventCard';
import CreateCoupon from '../admin/CreateCoupon';
import '../../styles/AdminDashboard.css';
import { approveEvent, deleteEvent, getPendingEvents, fetchAllUsers } from '../../services/adminApi';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingEvents = async () => {
    try {
      const data = await getPendingEvents();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      await approveEvent(eventId);
      fetchPendingEvents();
    } catch (err) {
      console.error('Approve failed:', err);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await deleteEvent(eventId);
      fetchPendingEvents();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
    fetchUsers();
  }, []);

  if (loading) return <p>Loading events...</p>;

  return (
    <div className="admin-dashboard">
      <h2>Pending Events</h2>
      {events.length === 0 ? (
        <p>No pending events found.</p>
      ) : (
        events.map(event => (
          <EventCard
            key={event._id}
            event={event}
            onApprove={() => handleApprove(event._id)}
            onDelete={() => handleDelete(event._id)}
          />
        ))
      )}

      <h2>All Users</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        users.map(user => (
          <div key={user._id}>
            <p>User ID: {user._id}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
          </div>
        ))
      )}

      <h2>Create Coupons</h2>
      <CreateCoupon />
    </div>
  );
};

export default AdminDashboard;
