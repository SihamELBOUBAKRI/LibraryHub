// src/components/UserList.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../axios'; // Import the Axios instance

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch users from the Laravel API
        const response = await axiosInstance.get('/users'); // Use the Axios instance
        setUsers(response.data); // Set the fetched data to the state
        setLoading(false);
      } catch (err) {
        // Handle errors
        setError(err.message || 'An error occurred while fetching users.'); // Set error message
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Show loading or error message
  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;

  // Display the list of users
  return (
    <div>
      <h3>User List</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong> - {user.email} - {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;