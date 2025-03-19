import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import SignUpPage from './pages/signUpPage/SignUpPage';
import AuthorsList from './components/AuthorsList/AuthorsList';
import BookList from './components/Booklist/BookList';
import LoginPage from './pages/Login/LoginPage';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import EditBook from "./pages/AdminDashboard/EditBook";
import CustomerDashboard from './pages/CustomerDashboard/CustomerDashboard';
import AuthorDetails from './components/AuthorsList/AuthorDetails';
import Navbar from './components/Navbar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <>
      
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/dashboard/edit-book/:id" element={<EditBook />} />;
        <Route path="/CustomerDashboard" element={<CustomerDashboard />} /> {/* Fixed typo here */}
        <Route path="/books" element={<BookList />} />
        <Route path="/authors" element={<AuthorsList />} />
        <Route path="/authors/:authorId" element={<AuthorDetails />} />
      </Routes>
    </>
  );
}

export default App;