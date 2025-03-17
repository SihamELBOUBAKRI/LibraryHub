import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooksToSell } from '../../features/book_to_sell/book_to_sellSlice';
import { fetchBooksToRent } from '../../features/book_to_rent/book_to_rentSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Button, Spinner } from 'react-bootstrap';
import { addToCart } from '../../features/cart/cartSlice';
import { addWishlistItem } from '../../features/wishlist/wishlistSlice';
import './BookList.css';
import CategoriesSidebar from '../CategoriesSidebar/CategoriesSidebar';
import { FaCartPlus, FaRegHeart, FaHeart } from 'react-icons/fa';


const BookList = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [selectedBook, setSelectedBook] = useState(null); // Track the selected book
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  
  const { books = [], loading: booksLoading, error: booksError } = useSelector((state) => state.book_to_sell);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate =useNavigate();

  useEffect(() => {
    dispatch(fetchBooksToSell());
    if (isAuthenticated && user?.isMember) {
      dispatch(fetchBooksToRent());
    }
  }, [dispatch, isAuthenticated, user]);

  const handleAddToCart = (book) => {
    if (user) {
      dispatch(addToCart({ userId: user.id, bookId: book.id, quantity: 1 }));
      setAddedToCart(true); // Mark as added to cart
    } else {
      navigate('/login'); // Redirect to login if not authenticated
    }
  };
  
  const handleAddToWishlist = (book) => {
    if (isAuthenticated && user) {
      dispatch(addWishlistItem(book));
      setAddedToWishlist(true); // Mark as added to wishlist
    } else {
      navigate('/login'); // Redirect to login if not authenticated
    }
  };
  

  const handleBookClick = (book) => {
    setSelectedBook(book);
    window.scrollTo(0, 0);  // Scroll to top when a book is clicked
    
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort books to move the clicked book to the top
  const sortedBooks = selectedBook
    ? [selectedBook, ...books.filter((book) => book.id !== selectedBook.id)]
    : books;

  if (booksLoading) {
    return (
      <Container className="my-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (booksError) {
    return (
      <Container className="my-4">
        <div className="alert alert-danger">{booksError}</div>
      </Container>
    );
  }

  return (
    <Container className="book-list-container">
      <CategoriesSidebar />
      <Row>
        
      <h2 className="book-list-title">Books</h2>

        <div className="book-list">

        {selectedBook && (
          <div className="book-info-container">
            <div className="info">
              <h2>{selectedBook.title}</h2>
              <p>{selectedBook.description}</p>

              <div className="book-details">
                <div className="book-detail">
                  <i className="fas fa-user"></i>
                  <span>Author: {selectedBook.author.name}</span> {/* Displaying Author ID */}
                </div>
              
                <div className="book-detail">
                  <i className="fas fa-tags"></i>
                  <span>Category: {selectedBook.category.name}</span> {/* Displaying Category Name */}
                </div>

              <div className="book-detail">
                <i className="fas fa-dollar-sign"></i>
                <span> Price :{selectedBook.price} USD</span>
              </div>

              <div className="book-detail">
                <i className="fas fa-calendar-alt"></i>
                <span>Published: {selectedBook.published_year}</span> {/* Displaying Published Year */}
              </div>

              <div className="book-detail">
                <i className="fas fa-box"></i>
                <span>Stock: {selectedBook.stock}</span> {/* Displaying Stock */}
              </div>
            </div>

            <div className="book-actions">
              <i className="fas fa-cart-plus" onClick={() => handleAddToCart(selectedBook)}></i>
              <i className="fas fa-heart" onClick={() => handleAddToWishlist(selectedBook)}></i>
            </div>
            </div>
          </div>
        )}

        {(searchQuery ? filteredBooks : sortedBooks).map((book) => (
              <img
                key={book.id}
                onClick={() => handleBookClick(book)}
                src={book.image ? `http://127.0.0.1:8000/storage/BookImages/${book.image}` : 'https://via.placeholder.com/150'}
                alt={book.title}
                className={`book-image ${selectedBook?.id === book.id ? 'large-image' : ''}`}
              />
          ))}
        </div>
      </Row>
    </Container>
  );
};

export default BookList;
