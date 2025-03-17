import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { fetchCart, removeFromCart } from '../../features/cart/cartSlice';
import { FaShoppingCart, FaSignOutAlt, FaHome, FaSearch, FaTrash, FaUser } from 'react-icons/fa';
import { Button, Offcanvas, Form } from 'react-bootstrap'; // Bootstrap for offcanvas
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CustomerDashboard.css';
import BookList from '../../components/Booklist/BookList';

const CustomerDashboard = () => {
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    address: '',
    password: ''
  });
  const cartItems = useSelector((state) => state.cart.items);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      dispatch(fetchCart(user.id));
      setProfileData({
        name: user.name,
        email: user.email,
        address: user.address || '',
        password: ''
      });
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
    setEditingProfile(false);
  };

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
            <button className="navbar-action-button" onClick={() => navigate('/')}> <FaHome /> <span>Home</span> </button>
            <button className="navbar-action-button" onClick={() => setShowCart(true)}> <FaShoppingCart /> <span>Cart ({cartItems.length})</span> </button>
            <button className="navbar-action-button" onClick={() => setShowProfile(true)}> <FaUser /> <span>Profile</span> </button>
          </div>
        </div>
      </div>
      {/* Profile Offcanvas */}
      <Offcanvas show={showProfile} onHide={() => setShowProfile(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Your Profile</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" value={profileData.name} disabled={!editingProfile} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
            </Form.Group>

            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={profileData.email} disabled={!editingProfile} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} />
            </Form.Group>

            <Form.Group controlId="formAddress">
              <Form.Label>Address</Form.Label>
              <Form.Control type="text" value={profileData.address} disabled={!editingProfile} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} />
            </Form.Group>

            {editingProfile && (
              <Button variant="primary" className="mt-3" onClick={handleSaveProfile}>Save Profile</Button>
            )}
          </Form>

          {!editingProfile && (
            <Button variant="warning" className="mt-3" onClick={() => setEditingProfile(true)}>Edit Profile</Button>
          )}

          <Button variant="danger" className="mt-3" onClick={handleLogout}>Logout</Button>
        </Offcanvas.Body>
      </Offcanvas>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default CustomerDashboard;
