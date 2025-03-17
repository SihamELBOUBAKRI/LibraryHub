import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';
import './LoginPage.css';
import axiosInstance from '../../components/config/axiosSetup';
import Navbar from '../../components/Navbar/Navbar';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axiosInstance.post('/login', { email, password });

      // Store user and token in Redux
      dispatch(setCredentials(response.data));

      // Redirect based on role
      if (response.data.user.role === 'admin') {
        navigate('/AdminDashboard');
      } else {
        navigate('/CustomerDashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login-box">
          <h2>Welcome Back!</h2>
          <p className="subtitle">Login to continue to your account</p>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">Login</button>
          </form>
          <div className="additional-links">
            <p>Don't have an account? <a href="/signup">Sign Up</a></p>
            <p><a href="/forgot-password">Forgot Password?</a></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;