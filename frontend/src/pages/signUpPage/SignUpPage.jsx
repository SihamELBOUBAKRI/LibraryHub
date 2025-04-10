import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, resetRegisterStatus } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../components/config/axiosSetup';
import './SignUpForm.css';
import Navbar from '../../components/Navbar/Navbar';

const SignupForm = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [birthdate, setBirthdate] = useState('');
  const maxYear = new Date().getFullYear() - 7;

  const { registerStatus, registerError } = useSelector((state) => state.auth);

  useEffect(() => {
    if (registerStatus === 'succeeded') {
      const timer = setTimeout(() => {
        navigate('/login');
        dispatch(resetRegisterStatus());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [registerStatus, navigate, dispatch]);

  const onSubmit = (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      password_confirmation: data.confirmPassword,
      cin: data.cin,
      address: data.address || null,
      tele: data.tele || null,
      birthdate: birthdate || null // Make sure this matches the backend field name
    };
  
    console.log('Registration payload:', payload); // Debug log
    dispatch(registerUser(payload));
  };

  const password = watch('password');

  return (
    <>
      <Navbar />
      <div className="signup-container">
        {registerStatus === 'succeeded' ? (
          <div className="success-message">Signup successful! Redirecting to login...</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
            <h2>Create Your Account</h2>
            <p className="subtitle">Join us and explore a world of books!</p>

            {registerStatus === 'failed' && (
              <div className="error-message">{registerError}</div>
            )}

            {/* Name & Email */}
            <div className="input-row">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Name"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="error-message">{errors.name.message}</p>}
              </div>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
              </div>
            </div>

            {/* CIN & Birthdate */}
            <div className="input-row">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="CIN"
                  {...register('cin', { required: 'CIN is required' })}
                />
                {errors.cin && <p className="error-message">{errors.cin.message}</p>}
              </div>
              <div className="form-group">
                <input
                  type="date"
                  placeholder="Birthdate"
                  {...register('birthdate', { required: 'Birthdate is required' })}
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  max={`${maxYear}-12-31`}
                />
                {errors.birthdate && <p className="error-message">{errors.birthdate.message}</p>}
              </div>
            </div>

            {/* Phone & Address */}
            <div className="form-group">
              <input
                type="text"
                placeholder="Phone"
                {...register('tele')}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Address"
                {...register('address')}
              />
            </div>

            {/* Password & Confirm Password */}
            <div className="input-row">
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  {...register('password', { 
                    required: 'Password is required', 
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                />
                {errors.password && <p className="error-message">{errors.password.message}</p>}
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  {...register('confirmPassword', { 
                    required: 'Confirm password is required', 
                    validate: value => value === password || 'Passwords do not match'
                  })}
                />
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button 
              type="submit" 
              className="signup-button"
              disabled={registerStatus === 'loading'}
            >
              {registerStatus === 'loading' ? 'Processing...' : 'Sign Up'}
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default SignupForm;