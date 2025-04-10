import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBookToSell, fetchBooksToSell, fetchCategories } from '../../features/book_to_sell/book_to_sellSlice';
import { fetchBooksToRent } from '../../features/book_to_rent/book_to_rentSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Button, Spinner, Form, InputGroup, Offcanvas } from 'react-bootstrap';
import { addToCart } from '../../features/cart/cartSlice';
import { addWishlistItem, fetchWishlist, removeWishlistItem } from '../../features/wishlist/wishlistSlice';
import { FaSearch, FaEdit, FaPlus } from 'react-icons/fa';  // Import the Edit icon
import './BookList.css';
import OrderFastModal from './OrderFastModal';
import { fetchAuthors } from '../../features/authors/authorsSlice';
import { ToastContainer, toast } from 'react-toastify';




const BookList = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [selectedBook, setSelectedBook] = useState(null); // Track the selected book
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist, fetchWishlist] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery); // Local search query state
  const [filteredBooks, setFilteredBooks] = useState([]); // Filtered books based on search query
  const [cartItems, setCartItems] = useState({});

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const wishlist = useSelector((state) => state.wishlist.items || []);
  const navigate = useNavigate();

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedBookForOrder, setSelectedBookForOrder] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const { books = [], loading: booksLoading, error: booksError } = useSelector((state) => state.book_to_sell);
  const { authors = [], loading: authorsLoading } = useSelector((state) => state.authors);
  const { categories, categoriesLoading } = useSelector((state) => state.book_to_sell);
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author_id: '',
    category_id: '',
    description: '',
    published_year: '',
    price: '',
    stock: '',
    image: ''
  });

  const handleAddBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Append all fields
      formData.append('title', newBook.title);
      formData.append('author_id', newBook.author_id);
      formData.append('category_id', newBook.category_id);
      formData.append('description', newBook.description);
      formData.append('published_year', newBook.published_year);
      formData.append('price', newBook.price);
      formData.append('stock', newBook.stock);
      
      // Append the image file if it exists
      if (newBook.image instanceof File) {
        formData.append('image_file', newBook.image);  // Send the actual file with a different key
        formData.append('image', newBook.image.name);  // Send just the filename as string
      }
  
      await dispatch(addBookToSell(formData)).unwrap();
      toast.success('Book added succesfully');
      setShowAddBookForm(false);
      setNewBook({
        title: '',
        author_id: '',
        category_id: '',
        description: '',
        published_year: '',
        price: '',
        stock: '',
        image: null
      });
      setPreviewImage(null);
      dispatch(fetchBooksToSell());
    } catch (error) {
      toast.error('Failed to Add the book.');
    }
  };

  const handleNewBookChange = (e) => {
    const { name, value } = e.target;
    setNewBook(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleBookClick = (book) => {
    // Toggle the selected book - if same book is clicked, deselect it
    setSelectedBook(prevSelected => 
      prevSelected?.id === book.id ? null : book
    );
    window.scrollTo(0, 0);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBook(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };



  useEffect(() => {
    dispatch(fetchBooksToSell());
    dispatch(fetchAuthors());
    dispatch(fetchCategories());
    if (isAuthenticated && user?.isMember) {
      dispatch(fetchBooksToRent());
    }
  }, [dispatch, isAuthenticated, user]);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchWishlist(user.id)); // Fetch wishlist when user is authenticated
    }
  }, [dispatch, isAuthenticated, user]);
  

  useEffect(() => {
    // Filter books based on the search query
    const filtered = books.filter((book) => {
      // Check if book and book.title exist
      if (!book || !book.title) return false;
      
      // Ensure both strings are available for comparison
      const bookTitle = book.title.toLowerCase();
      const searchTerm = localSearchQuery.toLowerCase();
      
      return bookTitle.includes(searchTerm);
    });
    
    setFilteredBooks(filtered);
  }, [localSearchQuery, books]);

  const handleWishlistToggle = (book) => {
    if (user) {
      const bookInWishlist = wishlist.find((item) => item.id === book.id);
      if (bookInWishlist) {
        dispatch(removeWishlistItem({ userId: user.id, bookId: book.id }));
      } else {
        dispatch(addWishlistItem({ userId: user.id, bookId: book.id }));
      }
    } else {
      navigate('/login');
    }
  };

  const handleAddToCart = (book) => {
    if (user) {
      dispatch(addToCart({ userId: user.id, bookId: book.id, quantity: 1 }));
      setAddedToCart(true);

      setCartItems((prev) => ({
        ...prev,
        [book.id]: true,
      }));

      setTimeout(() => {
        setCartItems((prev) => ({
          ...prev,
          [book.id]: false,
        }));
      }, 3 * 60 * 1000);
    } else {
      navigate('/login');
    }
  };

  const handleOrderBook = (book) => {
    setSelectedBookForOrder(book);
    setShowOrderModal(true);
  };


  const handleSearch = () => {
    const filtered = books.filter((book) =>
      book.title.toLowerCase().includes(localSearchQuery.toLowerCase())
    );
    setFilteredBooks(filtered);
  };


  const handleEditBook = (book) => {
    navigate(`/edit-book/${book.id}`); // Navigate to the Edit Book page
  };

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
    <>
      <Container className="book-list-container">
      <Row>
        <h2 className="book-list-title">Books</h2>

         <div className="mb-4 text-center">
              <Form.Control
                type="text"
                placeholder="Search books..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
          </div>

        
        {/* Only show the "Add Book" button if the user is an admin */}
       {user?.role === 'admin' && (
          <Button  
            onClick={() => setShowAddBookForm(true)}
            className="round"
          >
            <FaPlus />
          </Button>
        )}

        <div className="book-list">
          {selectedBook && (
            <div className="book-info-container">
              <div className="info">
                <h2>{selectedBook.title}</h2>
                <p>{selectedBook.description}</p>

                <div className="book-details">
                  <div className="book-detail">
                    <i className="fas fa-user"></i>
                    <span>Author: {selectedBook.author.name}</span>
                  </div>

                  <div className="book-detail">
                    <i className="fas fa-tags"></i>
                    <span>Category: {selectedBook.category.name}</span>
                  </div>

                  <div className="book-detail">
                    <i className="fas fa-dollar-sign"></i>
                    <span>Price: {selectedBook.price} USD</span>
                  </div>

                  <div className="book-detail">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Published: {selectedBook.published_year}</span>
                  </div>

                  <div className="book-detail">
                    <i className="fas fa-box"></i>
                    <span>Stock: {selectedBook.stock}</span>
                  </div>
                </div>

                <div className="book-actions">
                  <i
                    className="fas fa-cart-plus"
                    onClick={() => handleAddToCart(selectedBook)}
                    style={{ color: cartItems[selectedBook?.id] ? '#af002d' : 'black' }}
                  ></i>

                  <i
                    className={`fas fa-heart ${wishlist.some(item => item.id === selectedBook?.id) ? 'red-heart' : ''}`}
                    onClick={() => handleWishlistToggle(selectedBook)}
                    style={{ color: wishlist.some(item => item.id === selectedBook?.id) ? '#af002d' : 'black' }}
                  ></i>

                  {user?.role === 'customer' && (
                    <button 
                      className="order-icon" 
                      onClick={() => handleOrderBook(selectedBook)} 
                      style={{ cursor: 'pointer', color: 'blue' }}
                    >
                      Order Fast
                    </button>
                  )}

                  
                  {/* Show Edit icon if the user is admin */}
                  {user?.role === 'admin' && (
                    <FaEdit
                      className="edit-icon"
                      onClick={() => handleEditBook(selectedBook)}
                      style={{ cursor: 'pointer'}}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          {(localSearchQuery ? filteredBooks : sortedBooks).map((book) => (
            book && (
              <div key={book.id} className="book-item">  {/* Make sure key is unique */}
                <img
                  onClick={() => handleBookClick(book)}
                  src={book?.image ? `http://127.0.0.1:8000/storage/BookImages/${book.image}` : 'https://via.placeholder.jpeg'}
                  alt={book?.title || 'Book cover'}
                  className={`book-image ${selectedBook?.id === book?.id ? 'large-image' : ''}`}
                />
              </div>
            )
          ))}
        </div>
        <Offcanvas 
        show={showAddBookForm} 
        onHide={() => setShowAddBookForm(false)}
        placement="bottom"
        style={{ height: '80vh' }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Add New Book</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleAddBookSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newBook.title}
                onChange={handleNewBookChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Author</Form.Label>
              <Form.Select
                name="author_id"
                value={newBook.author_id}
                onChange={handleNewBookChange}
                required
                disabled={authorsLoading}
              >
                <option value="">Select Author</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category_id"
                value={newBook.category_id}
                onChange={handleNewBookChange}
                required
                disabled={categoriesLoading}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={newBook.description}
                onChange={handleNewBookChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Published Year</Form.Label>
              <Form.Control
                type="number"
                name="published_year"
                value={newBook.published_year}
                onChange={handleNewBookChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="price"
                value={newBook.price}
                onChange={handleNewBookChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={newBook.stock}
                onChange={handleNewBookChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Book Cover</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {previewImage && (
                <div className="mt-2">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    style={{ maxWidth: '100px', maxHeight: '100px' }} 
                  />
                </div>
              )}
            </Form.Group>

            <Button variant="primary" type="submit">
              Add Book
            </Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      </Row>
      {selectedBookForOrder && (
        <OrderFastModal
          show={showOrderModal}
          handleClose={() => setShowOrderModal(false)}
          book={selectedBookForOrder}
          userId={user?.id}
        />
      )}
    </Container>
    </>
  );
};

export default BookList;
