import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile, updatePassword } from '../../services/commonApi';
import '../../styles/ProfilePage.css';


const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    profile_picture: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    getProfile().then((user) => {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        role: user.role || '',
        profile_picture: user.profile?.profile_picture || '',
      });
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile_picture' && files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_picture: reader.result });
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleProfileUpdate = async () => {
    await updateProfile(formData);
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert("New password and confirmation do not match.");
      return;
    }

    try {
      await updatePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      alert("Password updated successfully!");
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      alert(err?.response?.data?.error || "Error updating password.");
    }
  };

  return (
    <div className="profile-form">
      <h2>Manage Your Profile</h2>

      <label>Name: <input name="name" value={formData.name} onChange={handleChange} /></label>
      <label>Email: <input name="email" value={formData.email} onChange={handleChange} /></label>
      <label>Phone: <input name="phone" value={formData.phone} onChange={handleChange} /></label>
      <label>Address: <textarea name="address" value={formData.address} onChange={handleChange} /></label>

      <label>Upload Profile Picture:
        <input name="profile_picture" type="file" accept="image/*" onChange={handleChange} />
      </label>

      {formData.profile_picture && (
        <img src={formData.profile_picture} alt="Preview" height="100" />
      )}

      <button onClick={handleProfileUpdate}>Update Profile</button>

      <hr />

      <h3>Change Password</h3>
      <label>Current Password:
        <input
          type="password"
          name="current_password"
          value={passwordData.current_password}
          onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
        />
      </label>

      <label>New Password:
        <input
          type="password"
          name="new_password"
          value={passwordData.new_password}
          onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })}
        />
      </label>

      <label>Confirm New Password:
        <input
          type="password"
          name="confirm_password"
          value={passwordData.confirm_password}
          onChange={e => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
        />
      </label>

      <button onClick={handlePasswordChange}>Change Password</button>
    </div>
  );
};

export default ProfilePage;
