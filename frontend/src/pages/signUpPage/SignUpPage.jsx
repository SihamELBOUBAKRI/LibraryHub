import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';
import axiosInstance from '../../components/config/axiosSetup';
import './SignUpForm.css';
import Navbar from '../../components/Navbar/Navbar';

const SignupForm = () => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
  const dispatch = useDispatch();
  const [birthdate, setBirthdate] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const maxYear = new Date().getFullYear() - 7;

  const onSubmit = useCallback(async (data) => {
    if (birthdate) {
      data.birthdate = birthdate;
    } else {
      data.birthdate = null;
    }

    try {
      const response = await axiosInstance.post('/users', data);
      dispatch(setCredentials(response.data));
      setSuccessMessage('Signup successful! Redirecting to login...');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (error) {
      console.log(error.response?.data);
      alert(error.response?.data?.error || 'Signup failed');
    }
  }, [birthdate, dispatch]);

  const password = watch('password');

  return (
    <>
      <Navbar />
      <div className="signup-container">
        {successMessage ? (
          <div className="success-message">{successMessage}</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
            <h2>Create Your Account</h2>
            <p className="subtitle">Join us and explore a world of books!</p>

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

            <button type="submit" className="signup-button">Sign Up</button>
          </form>
        )}
      </div>
    </>
  );
};

export default SignupForm;