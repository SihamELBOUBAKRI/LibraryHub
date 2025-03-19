import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooksToSell } from '../../features/book_to_sell/book_to_sellSlice';
import { fetchBooksToRent } from '../../features/book_to_rent/book_to_rentSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Button, Spinner, Form, InputGroup } from 'react-bootstrap';
import { addToCart } from '../../features/cart/cartSlice';
import { addWishlistItem, removeWishlistItem } from '../../features/wishlist/wishlistSlice';
import './BookList.css';
import { FaSearch } from 'react-icons/fa';

const BookList = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [selectedBook, setSelectedBook] = useState(null); // Track the selected book
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery); // Local search query state
  const [filteredBooks, setFilteredBooks] = useState([]); // Filtered books based on search query
  const [cartItems, setCartItems] = useState({});
  const { books = [], loading: booksLoading, error: booksError } = useSelector((state) => state.book_to_sell);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const wishlist = useSelector((state) => state.wishlist.items);

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchBooksToSell());
    if (isAuthenticated && user?.isMember) {
      dispatch(fetchBooksToRent());
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    // Filter books based on the search query
    const filtered = books.filter((book) =>
      book.title.toLowerCase().includes(localSearchQuery.toLowerCase())
    );
    setFilteredBooks(filtered);
  }, [localSearchQuery, books]);

  const handleWishlistToggle = (book) => {
    if (user) {
      // Using find() to check for the book in the wishlist
      const bookInWishlist = wishlist.find((item) => item.id === book.id);
  console.log(bookInWishlist);
  
      if (bookInWishlist) {
        // If book is found, remove from wishlist
        dispatch(removeWishlistItem({ userId: user.id, bookId: book.id }));
      } else {
        // If book is not found, add to wishlist
        dispatch(addWishlistItem({ userId: user.id, bookId: book.id }));
      }
    } else {
      navigate('/login'); // Redirect to login if not authenticated
    }
  };
  
  
  

  const handleAddToCart = (book) => {
    if (user) {
      dispatch(addToCart({ userId: user.id, bookId: book.id, quantity: 1 }));
      setAddedToCart(true); // Your existing logic
  
      // Change cart icon color
      setCartItems((prev) => ({
        ...prev,
        [book.id]: true, // Mark book as added
      }));
  
      // Revert color after 3 minutes
      setTimeout(() => {
        setCartItems((prev) => ({
          ...prev,
          [book.id]: false, // Reset color
        }));
      }, 3 * 60 * 1000); // 3 minutes in milliseconds
    } else {
      navigate('/login'); // Redirect to login if not authenticated
    }
  };
  

  const handleBookClick = (book) => {
    setSelectedBook(book);
    window.scrollTo(0, 0); // Scroll to top when a book is clicked
  };

  const handleSearch = () => {
    // Update the filtered books based on the local search query
    const filtered = books.filter((book) =>
      book.title.toLowerCase().includes(localSearchQuery.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

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
      <Row>
        {/* Search Bar */}
        <div className="search-bar-container">
          <InputGroup className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search books..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={handleSearch}>
              <FaSearch />
            </Button>
          </InputGroup>
        </div>

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
                <i
                  className="fas fa-cart-plus"
                  onClick={() => handleAddToCart(selectedBook)}
                  style={{ color: cartItems[selectedBook?.id] ? '#af002d' : 'black' }} // Color logic for cart
                ></i>

                <i
                  className={`fas fa-heart ${wishlist.some(item => item.id === selectedBook?.id) ? 'red-heart' : ''}`}
                  onClick={() => handleWishlistToggle(selectedBook)}
                  style={{ color: wishlist.some(item => item.id === selectedBook?.id) ? '#af002d' : 'black' }} // Color logic for wishlist
                ></i>

                </div>
              </div>
            </div>
          )}

          {(localSearchQuery ? filteredBooks : sortedBooks).map((book) => (
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