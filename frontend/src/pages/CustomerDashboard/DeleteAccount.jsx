import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteAccount } from '../../features/auth/authSlice'; // Import the deleteAccount action
import { ToastContainer, toast } from 'react-toastify';
import axiosInstance from '../../components/config/axiosSetup';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './DeleteAccount.css'

const DeleteAccount = () => {
  const [password, setPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch(); // Use dispatch hook
  const navigate = useNavigate(); // Hook for navigation

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      // Verify the password by calling backend API
      const response = await axiosInstance.post('/verify-password', { password });
      if (response.data.success) {
        setIsPasswordCorrect(true);
      } else {
        setError('Incorrect password');
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      // Dispatch the deleteAccount action from Redux
      await dispatch(deleteAccount({ password }));
      toast.success('Account deleted successfully!'); // Show success toast

      // After deletion, navigate to the login page
      setTimeout(() => {
        navigate('/login'); // Redirect to login page
      }, 2000); // Add a delay so the user can see the success toast

    } catch (err) {
      setError('Error deleting account');
      toast.error('Error deleting account'); // Show error toast
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
    <div className='delete-account-container'>
      {isPasswordCorrect ? (
        <div className="delete-account-box">
          <h2>Are you sure you want to delete your account?</h2>
          <button onClick={handleDeleteAccount} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
          </button>
          <button onClick={() => setIsPasswordCorrect(false)}>Cancel</button>
        </div>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="delete-account-form">
          <h2>Enter your password to confirm account deletion</h2>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter your password"
          />
          <button type="submit">Submit</button>
        </form>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
    </>
    
  );
};

export default DeleteAccount;
