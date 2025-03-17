import React, { useState } from 'react';
import { Link} from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaBook,
  FaUser,
  FaShoppingCart,
  FaHeart,
  FaUsers,
  FaList,
  FaMoneyBill,
  FaClock,
  FaClipboardList,
  FaShoppingBag,
} from 'react-icons/fa';
import './Navbar.css'; // Import the CSS file

const Navbar = () => {
  const user = useSelector((state) => state.auth.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown visibility
  };


  return (
    <nav className="navbar">
      <Link to="/" className="nav-title">
          LibraryHub
        </Link>
      <div className="nav-brand">
        
      <div className="nav-links">
        <ul className="navbar-links">
          
          <li>
              <Link to="/books" className="nav-link">
                <FaBook /> Books
              </Link>
          </li>
          <li>
              <Link to="/authors" className="nav-link">
                <FaUsers /> authors
              </Link>
          </li>

          {/* Show for admin */}
          {user && user.role === 'admin' && (
            <>
              <li>
                <Link to="/users" className="nav-link">
                  <FaUsers /> Users
                </Link>
              </li>
              <li>
                <Link to="/members" className="nav-link">
                  <FaUsers /> Members
                </Link>
              </li>
              <li>
                <Link to="/transactions" className="nav-link">
                  <FaMoneyBill /> Transactions
                </Link>
              </li>
              <li>
                <Link to="/active-rentals" className="nav-link">
                  <FaClock /> ActiveRentals
                </Link>
              </li>
              <li>
                <Link to="/rentals" className="nav-link">
                  <FaClipboardList /> Rentals
                </Link>
              </li>
              <li>
                <Link to="/overdues" className="nav-link">
                  <FaClock /> Overdues
                </Link>
              </li>
              <li>
                <Link to="/orders" className="nav-link">
                  <FaShoppingBag /> Orders
                </Link>
              </li>
              <li>
                <Link to="/purchases" className="nav-link">
                  <FaShoppingBag /> Purchases
                </Link>
              </li>
            </>
          )}

          {/* Show for customer */}
          {user && user.role === 'customer' && (
            <>
              <li>
                <Link to="/CustomerDashboard" className="nav-link">
                  <FaUser /> profile
                </Link>
              </li>
              <li>
                <Link to="/books" className="nav-link">
                  <FaBook /> Books
                </Link>
              </li>
              <li>
                <Link to="/CustomerDashboard/cart" className="nav-link">
                  <FaShoppingCart /> Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="nav-link">
                  <FaHeart /> Wishlist
                </Link>
              </li>
              {/* Show rentals if user is a member */}
              {user.isamember && (
                <li>
                  <Link to="/rentals" className="nav-link">
                    <FaList /> Rentals
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>
      </div>

      {/* Profile Icon with Dropdown */}
      <div className="profile-icon-container">
        {!user &&(
          <>
            <a className="profile-icon" onClick={toggleDropdown}>
              <i className="fas fa-user-circle"></i>
            </a>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/login" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                  Signup
                </Link>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </nav>
  );
};

export default Navbar;