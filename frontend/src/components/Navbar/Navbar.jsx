import React, { useState } from 'react';
import { Link} from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaBook,
  FaUser,
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

      <div className="nav-links">
        <ul className="navbar-links">
          {/* Admin Links */}
          {user?.role === 'admin' && (
            <>
              <li>
                <Link to="/AdminDashboard" className="nav-link">
                  <FaUser /> Profile
                </Link>
              </li>
              <li>
                <Link to="/books" className="nav-link">
                  <FaBook /> Books to Sell
                </Link>
              </li>
              <li>
                <Link to="/Rentbooks" className="nav-link">
                  <FaBook /> Books to Rent
                </Link>
              </li>
              <li>
                <Link to="/authors" className="nav-link">
                  <FaUsers /> Authors
                </Link>
              </li>
              <li>
                <Link to="/purchases" className="nav-link">
                  <FaShoppingBag /> Purchases
                </Link>
              </li>
              <li>
                <Link to="/rentals" className="nav-link">
                  <FaList /> Rentals
                </Link>
              </li>
            </>
          )}

          {/* Customer Links */}
          {user?.role === 'customer' && (
            <>
              <li>
                <Link to="/CustomerDashboard" className="nav-link">
                  <FaUser /> Profile
                </Link>
              </li>
              <li>
                <Link to="/books" className="nav-link">
                  <FaBook /> Books
                </Link>
              </li>
              <li>
                <Link to="/authors" className="nav-link">
                  <FaUsers /> Authors
                </Link>
              </li>
              <li>
                <Link to="/purchase" className="nav-link">
                  <FaShoppingBag /> Purchases
                </Link>
              </li>
              {user.isamember && (
                <li>
                  <Link to="/Rentbooks" className="nav-link">
                    <FaBook /> Books to Rent
                  </Link>
                </li>
              )}
              {user.isamember && (
                <li>
                  <Link to="/rental" className="nav-link">
                    <FaList /> Rentals
                  </Link>
                </li>
              )}
            </>
          )}

          {/* Guest Links */}
          {!user && (
            <>
              <li>
                <Link to="/books" className="nav-link">
                  <FaBook /> Books
                </Link>
              </li>
              <li>
                <Link to="/authors" className="nav-link">
                  <FaUsers /> Authors
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Profile Dropdown for Guests */}
      {!user && (
        <div className="profile-icon-container">
          <button className="profile-icon" onClick={toggleDropdown}>
            <i className="fas fa-user-circle"></i>
          </button>
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
        </div>
      )}
    </nav>
  );
};

export default Navbar;