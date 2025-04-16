import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { clearCart, fetchCart, removeFromCart } from '../../features/cart/cartSlice';
import { FaShoppingCart, FaSignOutAlt, FaHome, FaSearch, FaTrash, FaHeart } from 'react-icons/fa';
import { FaEdit, FaCog, FaKey, FaUserPlus, FaBook } from "react-icons/fa";
import { Button, Offcanvas } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { editProfile,fetchUserProfile } from '../../features/users/userSlice';
import 'react-toastify/dist/ReactToastify.css';
import './CustomerDashboard.css';
import Modal from 'react-bootstrap/Modal';
import { Form } from 'react-bootstrap';
import { fetchWishlist, removeWishlistItem } from '../../features/wishlist/wishlistSlice';
import { createMembership, fetchUserMembership } from '../../features/membership/membershipSlice';
import { createOrder } from '../../features/orders/orderSlice';

const CustomerDashboard = () => {
  const [showCart, setShowCart] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);
  const [showWishlist, setShowWishlist] = useState(false);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filteredCartItems, setFilteredCartItems] = useState([]);
  const [filteredWishlistItems, setFilteredWishlistItems] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [membershipData, setMembershipData] = useState({
    user_id: user?.id || '', 
    membership_type: 'monthly', 
    payment_method: 'credit card',
    payment_status: 'completed',
    card_holder_name: '',
    card_last_four: '',
    expiration_date: '',
    billing_address: '',
  });
  const { userMembership, status: membershipStatus } = useSelector((state) => state.membership);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    address: '',
    tele: '',
    cin: '',
    birthyear: '',
  });
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderData, setOrderData] = useState({
    shipping_address: user?.address || '',
    payment_method: 'Credit Card',
    card_holder_name: '',
    card_last_four: '',
    expiration_date: '',
    notes: '',
  });

  const getCartId = () => filteredCartItems.length > 0 ? filteredCartItems[0].cart_id : null;
  const handleOpenJoinModal = () => setShowJoinModal(true);
  const handleCloseJoinModal = () => setShowJoinModal(false);

  const handleChange = (e) => {
    setMembershipData({ ...membershipData, [e.target.name]: e.target.value });
  };
  
  const handleJoinMembership = async () => {
    try {
      await dispatch(createMembership(membershipData)).unwrap();
      // Add these lines to refresh both membership and user data
      await dispatch(fetchUserMembership(user.id));
      await dispatch(fetchUserProfile(user.id));
      toast.success('Membership request submitted!');
      handleCloseJoinModal();
    } catch (error) {
      toast.error('Failed to join membership.');
    }
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        tele: user.tele || '',
        cin: user.cin || '',
        birthyear: user.birthyear || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(editProfile(profileData)).unwrap();
      // Add this line to refresh user data
      await dispatch(fetchUserProfile(user.id)).unwrap();
      toast.success('Profile updated successfully!');
      setShowEditProfile(false);
    } catch (error) {
      toast.error('Failed to update profile.');
    }
  };

  const handleDeleteAccount = () => navigate('/delete-account');
  const handleReadingHistory = () => navigate('/purchase');

  useEffect(() => {
    if (user) {
      dispatch(fetchCart(user.id)).then((res) => {
        setFilteredCartItems(res.payload.items);
        if (res.payload.items?.length > 0) {
          setOrderData(prev => ({
            ...prev,
            cart_id: res.payload.items[0].cart_id
          }));
        }
      });
      dispatch(fetchWishlist(user.id)).then((res) => {
        setFilteredWishlistItems(res.payload);
      });
      dispatch(fetchUserMembership(user.id));
    }
  }, [dispatch, user]);

  const handleRemoveItem = async (bookId) => {
    if (user) {
      setRemovingItem(bookId);
      try {
        await dispatch(removeFromCart({ userId: user.id, bookId })).unwrap();
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
      setRemovingItem(bookId);
      try {
        await dispatch(removeWishlistItem({ userId: user.id, bookId })).unwrap();
        setFilteredWishlistItems((prevItems) => prevItems.filter((item) => item.id !== bookId));
        toast.success('Item removed from wishlist!');
      } catch (error) {
        toast.error('Failed to remove item from wishlist.');
      } finally {
        setRemovingItem(null);
      }
    } else {
      navigate('/login');
    }
  };

  const calculateProfileCompletion = (user) => {
    const userFields = ['name', 'email', 'role', 'address', 'tele', 'favoriteGenre'];
    const filledFields = userFields.filter(field => user[field]).length;
    return Math.round((filledFields / userFields.length) * 100);
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

  const handlePlaceOrder = async () => {
    try {
      const currentCartId = getCartId();
      if (!currentCartId) {
        toast.error('No cart found to checkout');
        return;
      }

      const orderPayload = {
        cart_id: currentCartId,
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method,
        notes: orderData.notes || undefined
      };

      if (orderData.payment_method === 'Credit Card') {
        orderPayload.card_holder_name = orderData.card_holder_name;
        orderPayload.card_last_four = orderData.card_last_four;
        orderPayload.expiration_date = orderData.expiration_date;
      }

      await dispatch(createOrder(orderPayload)).unwrap();
      toast.success('Order placed successfully!');
      setShowCheckoutModal(false);
      setShowCart(false);
      dispatch(clearCart());
    } catch (error) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  if (!user) return <p>Loading user data...</p>;

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
              <span>Cart</span>
            </button>
            <button className="navbar-action-button" onClick={() => setShowWishlist(true)}>
              <FaHeart />
              <span>Wishlist</span>
            </button>
            <button className="navbar-action-button" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="profile-container">
          <div className="user-info">
            <div className="profile-header">
              <h2>Welcome, {user.name}!</h2>
              <FaEdit className="edit-icon" title="Edit Profile" onClick={() => setShowEditProfile(true)} />
            </div>
            
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Address:</strong> {user.address || 'Not provided'}</p>
            <p><strong>Phone:</strong> {user.tele || 'Not provided'}</p>
            <p><strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            <p><strong>Membership:</strong> {user.isMember ? 'Library Member' : 'Regular Customer'}</p>
            <p><strong>Profile Completion:</strong> {calculateProfileCompletion(user)}% complete</p>

            <div className="settings-section">
              <h3>Settings <FaCog className="settings-icon" /></h3>
              <ul>
                <li><Link className='link' to="/change-password"><FaKey /> Change Password</Link></li>
                <li onClick={handleDeleteAccount}><FaTrash /> Delete Account</li>
                <li onClick={handleOpenJoinModal}><FaUserPlus /> Join Membership</li>
                <li onClick={handleReadingHistory}><FaBook /> View Reading History</li>
              </ul>
            </div>
          </div>

          <div className="member-info">
  {user.isamember ? (
    membershipStatus === 'loading' ? (
      <p>Loading membership info...</p>
    ) : userMembership ? (
      <div className="membership-card-info">
        {userMembership.payment_status === 'pending' && (
          <div className="membership-ribbon">Pending</div>
        )}
        <h3>Your Membership Card</h3>
        <div className="membership-details">
          <p><strong>Card Number:</strong> {userMembership.card_number}</p>
          <p><strong>Type:</strong> {userMembership.membership_type === 'yearly' ? 'Yearly' : 'Monthly'}</p>
          <p><strong>Issued On:</strong> {new Date(userMembership.issued_on).toLocaleDateString()}</p>
          <p><strong>Valid Until:</strong> {new Date(userMembership.valid_until).toLocaleDateString()}</p>
          <p><strong>Status:</strong> 
            <span className={`status-badge ${userMembership.payment_status}`}>
              {userMembership.payment_status}
            </span>
          </p>
          <p><strong>Payment Method:</strong> {userMembership.payment_method}</p>
          {userMembership.payment_status === 'pending' && (
            <div className="expiration-notice">
              Your membership is pending approval
            </div>
          )}
        </div>
      </div>
    ) : (
      <div className="join-members">
        <h3>No Membership Found</h3>
        <p>It seems you don't have an active membership card.</p>
        <button className="join-button" onClick={handleOpenJoinModal}>
          Join Membership Now
        </button>
      </div>
    )
  ) : (
    <div className="join-members">
      <h3>Become a Member!</h3>
      <p>Enjoy book rentals and exclusive benefits by joining our membership.</p>
      <button className="join-button" onClick={handleOpenJoinModal}>
        Join Now
      </button>
    </div>
  )}
</div>
        </div>

        <Offcanvas show={showJoinModal} onHide={handleCloseJoinModal} placement="bottom">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Join Membership</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Membership Type</Form.Label>
                <Form.Select name="membership_type" value={membershipData.membership_type} onChange={handleChange}>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select name="payment_method" value={membershipData.payment_method} onChange={handleChange}>
                  <option value="credit card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank transfer">Bank Transfer</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Card Holder Name</Form.Label>
                <Form.Control type="text" name="card_holder_name" value={membershipData.card_holder_name} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Card Last Four Digits</Form.Label>
                <Form.Control type="text" name="card_last_four" maxLength="4" value={membershipData.card_last_four} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Expiration Date</Form.Label>
                <Form.Control type="text" name="expiration_date" placeholder="MM/YYYY" value={membershipData.expiration_date} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Billing Address</Form.Label>
                <Form.Control type="text" name="billing_address" value={membershipData.billing_address} onChange={handleChange} />
              </Form.Group>
              <Button className='join' onClick={handleJoinMembership}>Join Now</Button>
            </Form>
          </Offcanvas.Body>
        </Offcanvas>

        <Offcanvas show={showCart} onHide={() => setShowCart(false)} placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Your Cart</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {/* Add null check before accessing length */}
            {!filteredCartItems || filteredCartItems.length === 0 ? (
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
                <Button 
                  variant="primary" 
                  className="checkout-button" 
                  onClick={() => {
                    setOrderData(prev => ({
                      ...prev,
                      shipping_address: user?.address || ''
                    }));
                    setShowCheckoutModal(true);
                  }}
                >
                  Proceed to Checkout
                </Button>
              </>
            )}
          </Offcanvas.Body>
        </Offcanvas>

        <Offcanvas show={showWishlist} onHide={() => setShowWishlist(false)} placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Your Wishlist</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {!filteredCartItems || filteredWishlistItems.length === 0 ? (
              <p>Your wishlist is empty</p>
            ) : (
              <ul className="wishlist-items-list">
                {filteredWishlistItems.map((item) => (
                  <li key={item.id} className="wishlist-item">
                    <span className="wishlist-item-title">{item.title}</span>
                    <span className="wishlist-item-price">Price: ${item.price}</span>
                    <i
                      className="fas fa-trash delete-icon"
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      style={{ color: 'red', cursor: 'pointer' }}
                    ></i>
                  </li>
                ))}
              </ul>
            )}
          </Offcanvas.Body>
        </Offcanvas>

        <Modal show={showEditProfile} onHide={() => setShowEditProfile(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleProfileUpdate}>
              <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formAddress">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formTele">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="tele"
                  value={profileData.tele}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formCin">
                <Form.Label>CIN</Form.Label>
                <Form.Control
                  type="text"
                  name="cin"
                  value={profileData.cin}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formBirthyear">
                <Form.Label>Birthyear</Form.Label>
                <Form.Control
                  type="text"
                  name="birthyear"
                  value={profileData.birthyear}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal show={showCheckoutModal} onHide={() => setShowCheckoutModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Complete Your Order</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Shipping Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="shipping_address"
                  value={orderData.shipping_address}
                  onChange={(e) => setOrderData({...orderData, shipping_address: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  name="payment_method"
                  value={orderData.payment_method}
                  onChange={(e) => {
                    setOrderData({
                      ...orderData,
                      payment_method: e.target.value,
                      ...(e.target.value !== 'Credit Card' && {
                        card_holder_name: '',
                        card_last_four: '',
                        expiration_date: ''
                      })
                    });
                  }}
                  required
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </Form.Select>
              </Form.Group>

              {orderData.payment_method === 'Credit Card' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Card Holder Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="card_holder_name"
                      value={orderData.card_holder_name}
                      onChange={(e) => setOrderData({...orderData, card_holder_name: e.target.value})}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Card Number (Last 4 Digits)</Form.Label>
                    <Form.Control
                      type="text"
                      name="card_last_four"
                      maxLength="4"
                      value={orderData.card_last_four}
                      onChange={(e) => setOrderData({...orderData, card_last_four: e.target.value})}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Expiration Date (MM/YYYY)</Form.Label>
                    <Form.Control
                      type="text"
                      name="expiration_date"
                      placeholder="MM/YYYY"
                      value={orderData.expiration_date}
                      onChange={(e) => setOrderData({...orderData, expiration_date: e.target.value})}
                      required
                    />
                  </Form.Group>
                </>
              )}

              {orderData.payment_method === 'PayPal' && (
                <div className="alert alert-info mt-3">
                  <i className="fab fa-paypal me-2"></i>
                  You will be redirected to PayPal to complete your payment
                </div>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Additional Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="notes"
                  value={orderData.notes}
                  onChange={(e) => setOrderData({...orderData, notes: e.target.value})}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCheckoutModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </Modal.Footer>
        </Modal>

      </div>
    </>
  );
};

export default CustomerDashboard;