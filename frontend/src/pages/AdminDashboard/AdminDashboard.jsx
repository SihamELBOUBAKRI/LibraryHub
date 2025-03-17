import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchOverdues } from "../../features/overdues/overduesSlice";
import { fetchOrders } from "../../features/orders/orderSlice";
import { fetchMemberships } from "../../features/membership/membershipSlice";
import { fetchRentals } from "../../features/rentals/rentalsSlice";
import { fetchTransactions } from "../../features/transactions/transactionsSlice";
import { fetchPurchases } from "../../features/purchases/purchasesSlice";
import { fetchCart } from "../../features/cart/cartSlice";
import { fetchWishlist } from "../../features/wishlist/wishlistSlice";
import { fetchActiveRentals } from "../../features/active_rentals/active_rentalsSlice";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { logout } from "../../features/auth/authSlice";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const overdues = useSelector((state) => state.overdues?.count || 0);
    const orders = useSelector((state) => state.orders?.count || 0);
    const memberships = useSelector((state) => state.memberships?.count || 0);

    useEffect(() => {
        dispatch(fetchOverdues());
        dispatch(fetchOrders());
        dispatch(fetchMemberships());
        dispatch(fetchRentals());
        dispatch(fetchTransactions());
        dispatch(fetchPurchases());
        dispatch(fetchCart());
        dispatch(fetchWishlist());
        dispatch(fetchActiveRentals());
    }, [dispatch]);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login"); // Redirect to login page after logout
    };

    return (
        <div className="admin-dashboard">
            <nav className="top-navbar">
                <h2>Hello, {user?.name}</h2>
                <div className="nav-icons">
                    <FaBell className="icon" />
                    <link to="/AdminDashboard"  ><FaUserCircle className="icon" /></link>
                    <link onClick={handleLogout}>Logout</link>
                </div>
            </nav>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Overdues</h3>
                    <p>{overdues}</p>
                </div>
                <div className="stat-card">
                    <h3>Orders</h3>
                    <p>{orders}</p>
                </div>
                <div className="stat-card">
                    <h3>Members</h3>
                    <p>{memberships}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
