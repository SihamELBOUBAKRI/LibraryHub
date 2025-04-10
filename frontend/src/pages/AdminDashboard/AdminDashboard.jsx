import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, addUser, updateUser, deleteUser } from "../../features/users/userSlice";
import { fetchMemberships, createMembership, updateMembership, deleteMembership } from "../../features/membership/membershipSlice";
import { logout } from "../../features/auth/authSlice";
import { FaUsers, FaShoppingBag, FaSignOutAlt, FaEdit, FaTrash, FaIdCard } from "react-icons/fa";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import { fetchOrders } from "../../features/orders/orderSlice";
import { FaChartLine, FaBook } from "react-icons/fa";
import { Line, Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const users = useSelector((state) => state.users.users);
    const memberships = useSelector((state) => state.membership.memberships);
    const { orders, loading: ordersLoading } = useSelector((state) => state.orders);
    const [orderData, setOrderData] = useState(null);
    const [mostOrderedBooks, setMostOrderedBooks] = useState([]);
    const [activeSection, setActiveSection] = useState("dashboard");

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchMemberships());
        dispatch(fetchOrders());
    }, [dispatch]);


    useEffect(() => {
        if (orders.length > 0) {
            processOrderData(orders);
            processMostOrderedBooks(orders);
        }
    }, [orders]);

    const processOrderData = (orders) => {
        // Group orders by date and count orders per day
        const ordersByDate = orders.reduce((acc, order) => {
            const date = new Date(order.created_at).toLocaleDateString();
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        const dates = Object.keys(ordersByDate);
        const counts = Object.values(ordersByDate);

        // Determine color based on progress (green if increasing, red if decreasing)
        const color = counts.map((count, index) => {
            if (index === 0) return "rgba(75, 192, 192, 1)"; // Green for first point
            return counts[index] > counts[index - 1] 
                ? "rgba(75, 192, 192, 1)" // Green for progress
                : "rgba(255, 99, 132, 1)"; // Red for reverse
        });

        setOrderData({
            labels: dates,
            datasets: [
                {
                    label: 'Orders Over Time',
                    data: counts,
                    borderColor: color,
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    tension: 0.1,
                    fill: false,
                    borderWidth: 2,
                },
            ],
        });
    };

    const processMostOrderedBooks = (orders) => {
        // Extract all books from all orders
        const allBooks = orders.flatMap(order => 
            order.books ? order.books.map(book => ({
                id: book.id,
                title: book.title || `Book ${book.id}`,
                quantity: book.pivot ? book.pivot.quantity : 1
            })) : []
        );

        // Sum quantities by book id
        const bookQuantities = allBooks.reduce((acc, book) => {
            if (!acc[book.id]) {
                acc[book.id] = { ...book, total: 0 };
            }
            acc[book.id].total += book.quantity;
            return acc;
        }, {});

        // Convert to array and sort by total quantity
        const sortedBooks = Object.values(bookQuantities)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10); // Take top 10

        setMostOrderedBooks(sortedBooks);
    };

    const mostOrderedBooksData = {
        labels: mostOrderedBooks.map(book => book.title),
        datasets: [
            {
                label: 'Number of Orders',
                data: mostOrderedBooks.map(book => book.total),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };
    
    const handleAddUser = () => {
        navigate("/admin/add-user");
    };

    

    

    return (
        <div className="admin-dashboard">
            <nav className="top-navbar">
                <h2>Admin Dashboard</h2>
                <div className="nav-icons">
                    <a onClick={() => setActiveSection("dashboard")}><FaChartLine /> Dashboard</a>
                    <a onClick={() => setActiveSection("users")}><FaUsers /> Users</a>
                    <a onClick={() => setActiveSection("members")}><FaUsers /> Members</a>
                    <a className="navbar-action-button" onClick={handleLogout}><FaSignOutAlt /><span>Logout</span></a>
                </div>
            </nav>

            <div className="dashboard-content">
                {activeSection === "dashboard" && (
                    <>
                        <div className="dashboard-stats">
                            <h1>Welcome, Admin</h1>
                            <div className="stats-cards">
                                <div className="stat-card">
                                    <h3>Total Users</h3>
                                    <p>{users.length}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Total Orders</h3>
                                    <p>{orders.length}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Active Members</h3>
                                    <p>{memberships?.length || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="charts-container">
                            {/* Orders Over Time Chart */}
                            <div className="chart-container">
                                <h3>Orders Over Time</h3>
                                {orderData ? (
                                    <Line 
                                        data={orderData} 
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                                tooltip: {
                                                    mode: 'index',
                                                    intersect: false,
                                                }
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    title: {
                                                        display: true,
                                                        text: 'Number of Orders'
                                                    }
                                                },
                                                x: {
                                                    title: {
                                                        display: true,
                                                        text: 'Date'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <p>{ordersLoading ? 'Loading orders...' : 'No order data available'}</p>
                                )}
                            </div>

                            {/* Most Ordered Books Chart */}
                            <div className="chart-container">
                                <h3>Top 10 Most Ordered Books</h3>
                                {mostOrderedBooks.length > 0 ? (
                                    <Bar
                                    data={mostOrderedBooksData}
                                    options={{
                                        indexAxis: 'y', // This makes the chart horizontal
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                display: false,
                                            },
                                        },
                                        scales: {
                                            x: {
                                                beginAtZero: true,
                                                title: {
                                                    display: true,
                                                    text: 'Number Ordered'
                                                }
                                            },
                                            y: {
                                                title: {
                                                    display: true
                                                },
                                                ticks: {
                                                    autoSkip: false // Ensures all labels are shown
                                                }
                                            }
                                        }
                                    }}
                                />
                                ) : (
                                    <p>{ordersLoading ? 'Loading book data...' : 'No book data available'}</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
                {activeSection === "users" && (
                    <div className="users-section">
                        <div className="section-header">
                            <h3>User List</h3>
                            <button onClick={handleAddUser}>Add User</button>
                        </div>
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Member Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.tele}</td>
                                        <td>{user.role}</td>
                                        <td>{user.isamember ? "Yes" : "No"}</td>
                                        <td className="actions">
                                        <button 
                                            className="action-btn edit"
                                            onClick={() => navigate(`/admin/add-membership/${user.id}`)}                                            title="Add Membership"
                                            >
                                            <FaIdCard />
                                            </button>
                                            <button 
                                                className="action-btn delete"
                                                onClick={() => dispatch(deleteUser(user.id))}
                                                title="Delete User"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeSection === "members" && (
                    <div className="members-section">
                        <h3>Active Memberships</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>User Name</th>
                                    <th>Email</th>
                                    <th>Membership Type</th>
                                    <th>Valid Until</th>
                                    <th>card number</th>
                                    <th>Amount Paid</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {memberships.map((m) => (
                                    <tr key={m.id}>
                                        <td>{m.user?.name}</td>
                                        <td>{m.user?.email}</td>
                                        <td>{m.membership_type}</td>
                                        <td>{m.valid_until}</td>
                                        <td>{m.card_number}</td>
                                        <td>{m.amount_paid} {m.currency}</td>
                                        <td>
                                            <button 
                                                className="action-btn delete"
                                                onClick={() => dispatch(deleteMembership(m.id))}
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>

        
    );
};

export default AdminDashboard;
