import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { createMembership } from '../../features/membership/membershipSlice';
import { fetchUsers } from '../../features/users/userSlice';
import './AddMembershipForm.css';

const AddMembershipForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();
  const users = useSelector((state) => state.users.users);
  const { loading, error } = useSelector((state) => state.membership);
  
  const [formData, setFormData] = useState({
    user_id: userId,
    membership_type: 'yearly',
    payment_method: 'credit card',
    payment_status: 'completed',
    card_holder_name: '',
    card_last_four: '',
    expiration_date: '',
    billing_address: ''
  });

  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const user = users.find(u => u.id === parseInt(userId));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const isCreditCard = formData.payment_method === 'credit card';
    
    if (isCreditCard) {
      if (!formData.billing_address.trim()) {
        newErrors.billing_address = 'Billing address is required';
      }
      
      if (!formData.card_holder_name.trim()) {
        newErrors.card_holder_name = 'Card holder name is required';
      }
      
      if (!/^\d{4}$/.test(formData.card_last_four)) {
        newErrors.card_last_four = 'Please enter last 4 digits';
      }
      
      if (!/(0[1-9]|1[0-2])\/?([0-9]{2})/.test(formData.expiration_date)) {
        newErrors.expiration_date = 'Invalid format (MM/YY)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Only include card info if payment method is credit card
      const submissionData = formData.payment_method === 'credit card' 
        ? formData 
        : {
            ...formData,
            card_holder_name: '',
            card_last_four: '',
            expiration_date: '',
            billing_address: ''
          };
      
      await dispatch(createMembership(submissionData));
      setIsSuccess(true);
      
      setTimeout(() => navigate('/AdminDashboard'), 1500);
    } catch (error) {
      console.error('Error creating membership:', error);
    }
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  const isCreditCard = formData.payment_method === 'credit card';

  return (
    <div className="membership-form-container">
      <h2>Add Membership for {user.name}</h2>
      
      {error && (
        <div className="error-message">
          Error creating membership: {error}
        </div>
      )}
      
      {isSuccess && (
        <div className="success-message">
          Membership created successfully! Redirecting...
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Membership Type</label>
          <select
            name="membership_type"
            value={formData.membership_type}
            onChange={handleChange}
            required
          >
            <option value="monthly">Monthly ($20)</option>
            <option value="yearly">Yearly ($200)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Payment Method</label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            required
          >
            <option value="credit card">Credit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
        </div>


        {isCreditCard && (
          <>
            <div className="form-group">
              <label>Card Holder Name</label>
              <input
                type="text"
                name="card_holder_name"
                value={formData.card_holder_name}
                onChange={handleChange}
                className={errors.card_holder_name ? 'error' : ''}
                required={isCreditCard}
              />
              {errors.card_holder_name && (
                <span className="error-text">{errors.card_holder_name}</span>
              )}
            </div>

            <div className="form-group">
              <label>Last Four Digits</label>
              <input
                type="text"
                name="card_last_four"
                value={formData.card_last_four}
                onChange={handleChange}
                className={errors.card_last_four ? 'error' : ''}
                required={isCreditCard}
                maxLength="4"
                pattern="\d{4}"
              />
              {errors.card_last_four && (
                <span className="error-text">{errors.card_last_four}</span>
              )}
            </div>

            <div className="form-group">
              <label>Expiration Date (MM/YY)</label>
              <input
                type="text"
                name="expiration_date"
                value={formData.expiration_date}
                onChange={handleChange}
                placeholder="MM/YY"
                className={errors.expiration_date ? 'error' : ''}
                required={isCreditCard}
                pattern="(0[1-9]|1[0-2])\/?([0-9]{2})"
              />
              {errors.expiration_date && (
                <span className="error-text">{errors.expiration_date}</span>
              )}
            </div>

            <div className="form-group">
              <label>Billing Address</label>
              <input
                type="text"
                name="billing_address"
                value={formData.billing_address}
                onChange={handleChange}
                className={errors.billing_address ? 'error' : ''}
                required={isCreditCard}
              />
              {errors.billing_address && (
                <span className="error-text">{errors.billing_address}</span>
              )}
            </div>
            
            <div className="form-group">
            <label>Payment Status</label>
            <select
                name="payment_status"
                value={formData.payment_status}
                onChange={handleChange}
                required
            >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
            </select>
            </div>
          </>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/admin/users')}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Create Membership'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMembershipForm;