import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import SignUpPage from './pages/signUpPage/SignUpPage';
import AuthorsList from './components/AuthorsList/AuthorsList';
import BookList from './components/Booklist/BookList';
import LoginPage from './pages/Login/LoginPage';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard/CustomerDashboard';
import AuthorDetails from './components/AuthorsList/AuthorDetails';
import Navbar from './components/Navbar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Purchases from './pages/AdminDashboard/Purchases';
import Rentals from './pages/AdminDashboard/Rentals';
import Rental from './pages/CustomerDashboard/Rental';
import Purchase from './pages/CustomerDashboard/Purchase';
import RentBooks from './components/Booklist/Rentbooks';
import ChangePassword from './pages/CustomerDashboard/ChangePassword';
import DeleteAccount from './pages/CustomerDashboard/DeleteAccount';
import AddUserForm from './pages/AdminDashboard/AddUserForm';
import AddMembershipForm from './pages/AdminDashboard/AddMembershipForm';
import AddAuthor from './components/AuthorsList/AddAuthor';
import EditAuthor from './components/AuthorsList/EditAuthor';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <>
      
      <Navbar />
      <Routes>
      <Route path="/change-password" element={<ChangePassword/>} />
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/CustomerDashboard" element={<CustomerDashboard />} /> {/* Fixed typo here */}
        <Route path="/books" element={<BookList />} />
        <Route path="/RentBooks" element={<RentBooks />} />
        <Route path="/authors" element={<AuthorsList />} />
        <Route path="/authors/:authorId" element={<AuthorDetails />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/rental" element={<Rental />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="/admin/add-user" element={<AddUserForm />} />
        <Route path="/admin/add-membership/:userId" element={<AddMembershipForm />} />
        <Route path="/add-author" element={<AddAuthor />} />  
        <Route path="/edit-author/:authorId" element={<EditAuthor />} />
      </Routes>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;