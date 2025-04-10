import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { changePassword, logout } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { ToastContainer,toast } from 'react-toastify';
import '../Login/LoginPage.css';

const ChangePassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check if the new password and confirmation password match
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('New password and confirmation do not match');
      setLoading(false);
      return;
    }

    try {
      // Dispatch the changePassword action
      await dispatch(changePassword(passwordData)).unwrap();
      // On success, show toast, logout user, and redirect to login page
      dispatch(logout());  // logout user
      setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' }); // Clear fields
      navigate('/login');
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="change-password-container">
      <div className="change-password-box">
        <h2>Change Password</h2>
        <form className="change-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              name="current_password"
              value={passwordData.current_password}
              onChange={handleChange}
              required
              placeholder="Enter your current password"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handleChange}
              required
              placeholder="Enter a new password"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="new_password_confirmation"
              value={passwordData.new_password_confirmation}
              onChange={handleChange}
              required
              placeholder="Confirm new password"
            />
          </div>

          <button className="change-password-button" type="submit" disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>

    </>
  );
};

export default ChangePassword;
