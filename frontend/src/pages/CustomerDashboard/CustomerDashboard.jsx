import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import './CustomerDashboard.css';
import { FaShoppingCart, FaSignOutAlt, FaHome, FaSearch } from 'react-icons/fa';


const CustomerDashboard = () => {
  const [active, setActive] = useState('profile');
  const cartItems = useSelector(state => state.cart.items);
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // fetchCart will be handled in Cart component
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) {
    return <p>Loading user data...</p>;
  }

  return (
    <>
      <div className="dashboard-container">
        <div className="top-navbar">
          <div className="navbar-search">
            <div className="search-container">
              <input type="text" placeholder="Search books..." />
              <button className="search-button">
                <FaSearch />
              </button>
            </div>
          </div>
          <div className="navbar-actions">
            <button className="navbar-action-button" onClick={() => navigate('/')}>
              <FaHome />
              <span>Home</span>
            </button>
            <button className="navbar-action-button" onClick={() => setActive('cart')}>
              <FaShoppingCart />
              <span>Cart ({cartItems.length})</span>
            </button>
            <button className="navbar-action-button" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className={`dashboard-content-section ${active === 'profile' ? 'active' : ''}`} id="profile">
          <h2>Welcome, {user.name}!</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Member Status:</strong> {user.isamember ? 'Member' : 'Not a Member'}</p>
          <p><strong>Address:</strong> {user.address || 'Not provided'}</p>
          <p><strong>Phone:</strong> {user.tele || 'Not provided'}</p>
        </div>

      </div>
    </>
  );
};

export default CustomerDashboard;
