import React, { useState } from 'react';
import '../../styles/CreateCoupon.css'

const CreateCoupon = () => {
  const [form, setForm] = useState({
    code: '',
    discount_percent: '',
    expires_at: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setMessage(data.message);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="create-coupon-container">
      <h2>Create New Coupon</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="code"
          placeholder="Coupon Code"
          value={form.code}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="discount_percent"
          placeholder="Discount %"
          value={form.discount_percent}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="expires_at"
          placeholder="Expiry Date"
          value={form.expires_at}
          onChange={handleChange}
          required
        />
        <button type="submit">Create Coupon</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateCoupon;
