import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { fetchCart, removeFromCart } from '../../features/cart/cartSlice';
import { FaShoppingCart, FaSignOutAlt, FaHome, FaSearch, FaTrash, FaHeart } from 'react-icons/fa';
import { Button, Offcanvas } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CustomerDashboard.css';
import { fetchWishlist, addWishlistItem, removeWishlistItem } from '../../features/wishlist/wishlistSlice';

const CustomerDashboard = () => {
  const [active, setActive] = useState('profile');
  const [showCart, setShowCart] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);
  const [showWishlist, setShowWishlist] = useState(false);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filteredCartItems, setFilteredCartItems] = useState([]);
  const [filteredWishlistItems, setfilteredWishlistItems] = useState([]);

  
  useEffect(() => {
    if (user) {
      dispatch(fetchCart(user.id)).then((res) => {
        setFilteredCartItems(res.payload.items);
      });
      dispatch(fetchWishlist(user.id)).then((res) => {
        setfilteredWishlistItems(res.payload);
      });
    }
  }, [dispatch, user]);
  
  
  const handleRemoveItem = async (bookId) => {
    if (user) {
      setRemovingItem(bookId);
      try {
        await dispatch(removeFromCart({ userId: user.id, bookId })).unwrap();
        // Update filtered cart items
        setFilteredCartItems((prevItems) => prevItems.filter((item) => item.book?.id !== bookId));
        toast.success('Item removed successfully!');
      } catch (error) {
        toast.error('Failed to remove item.');
      } finally {
        setRemovingItem(null);
      }
    }
  };
  const handleRemoveFromWishlist = async (bookId) => {
    if (user) {
      setRemovingItem(bookId); // Set removing item to show a loading state
      try {
        await dispatch(removeWishlistItem({ userId: user.id, bookId })).unwrap();
        setfilteredWishlistItems((prevItems) => prevItems.filter((item) => item.id !== bookId));
        toast.success('Item removed from wishlist!');
      } catch (error) {
        toast.error('Failed to remove item from wishlist.');
      } finally {
        setRemovingItem(null); // Reset removing item state
      }
    } else {
      navigate('/login'); // Redirect to login if not authenticated
    }
  };
  
  

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const calculateTotalAmount = (items) => {
    return items.reduce((acc, item) => {
      const price = parseFloat(item.book?.price) || 0;
      const quantity = item.quantity || 1;
      return acc + price * quantity;
    }, 0).toFixed(2);
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
            <button className="navbar-action-button" onClick={() => setShowCart(true)}>
              <FaShoppingCart />
              <span>Cart ({filteredCartItems.length})</span>
            </button>
            <button className="navbar-action-button" onClick={() => setShowWishlist(true)}>
              <FaHeart />
              <span>Wishlist ({filteredWishlistItems.length})</span>
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

      {/* Offcanvas Cart */}
      <Offcanvas show={showCart} onHide={() => setShowCart(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Your Cart</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {filteredCartItems.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              <ul className="cart-items-list">
                {filteredCartItems.map((item) => (
                  <li key={item.id} className="cart-item">
                    <span>Qty: {item.quantity}</span>
                    <span>{item.book?.title || 'Unknown Title'}</span>
                    <span>${(item.book?.price * item.quantity || 0).toFixed(2)}</span>
                    <FaTrash
                      className="remove-icon"
                      onClick={() => handleRemoveItem(item.book?.id)}
                      disabled={removingItem === item.book?.id}
                    />
                  </li>
                ))}
              </ul>
              <div className="cart-summary">
                <h3>Total: ${calculateTotalAmount(filteredCartItems)}</h3>
              </div>
              <Button variant="primary" className="checkout-button" onClick={() => alert('Proceeding to checkout...')}>
                Proceed to Checkout
              </Button>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Offcanvas Wishlist */}
      <Offcanvas show={showWishlist} onHide={() => setShowWishlist(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Your Wishlist</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {filteredWishlistItems.length === 0 ? (
            <p>Your wishlist is empty</p>
          ) : (
            <ul className="wishlist-items-list">
              {filteredWishlistItems.map((item) => (
                <li key={item.id} className="wishlist-item">
                  <div className="wishlist-item-details">
                    <span className="wishlist-item-title">{item.title}</span>
                    <span className="wishlist-item-author">Author: {item.author?.name}</span>
                    <span className="wishlist-item-price">Price: ${item.price}</span>
                  </div>
                  <i
                    className="fas fa-trash delete-icon"
                    onClick={() => handleRemoveFromWishlist(item.id)} // Call remove function
                    style={{ color: 'red', cursor: 'pointer' }}
                  ></i>
                </li>
              ))}

            </ul>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default CustomerDashboard;
