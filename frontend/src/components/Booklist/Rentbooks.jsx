import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooksToRent, addBookToRent } from '../../features/book_to_rent/book_to_rentSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Button, Spinner, Form, InputGroup, Offcanvas } from 'react-bootstrap';
import { addWishlistItem, removeWishlistItem } from '../../features/wishlist/wishlistSlice';
import { FaSearch, FaEdit, FaPlus } from 'react-icons/fa';
import { fetchAuthors } from '../../features/authors/authorsSlice';
import { fetchCategories } from '../../features/book_to_sell/book_to_sellSlice';
import { ToastContainer, toast } from 'react-toastify';
import './BookList.css';
import ReserveFastModal from './ReserveFastModal';

const RentBooks = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [selectedBook, setSelectedBook] = useState(null);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author_id: '',
    category_id: '',
    description: '',
    published_year: '',
    rental_price: '',
    rental_period_days: 7,
    late_fee_per_day: 1,
    availability_status: 'available',
    condition: 'good',
    min_rental_period_days: 1,
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
const [selectedBookForReserve, setSelectedBookForReserve] = useState(null);
  const { books = [], loading: booksLoading, error: booksError } = useSelector((state) => state.book_to_rent);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { authors = [], loading: authorsLoading } = useSelector((state) => state.authors);
  const { categories, categoriesLoading } = useSelector((state) => state.book_to_sell);
  const wishlist = useSelector((state) => state.wishlist.items || []);

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchBooksToRent());
    dispatch(fetchAuthors());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const filtered = books.filter((book) =>
      book.title.toLowerCase().includes(localSearchQuery.toLowerCase())
    );
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

  const handleBookClick = (book) => {
    setSelectedBook(prevSelected => 
      prevSelected?.id === book.id ? null : book
    );
    window.scrollTo(0, 0);
    console.log(setSelectedBook);
    
  };

  const handleSearch = () => {
    const filtered = books.filter((book) =>
      book.title.toLowerCase().includes(localSearchQuery.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  const handleEditBook = (book) => {
    navigate(`/edit-book/${book.id}`);
  };

  const handleNewBookChange = (e) => {
    const { name, value } = e.target;
    setNewBook(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBook(prev => ({
        ...prev,
        image: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReserveBook = (book) => {
    setSelectedBookForReserve(book);
    setShowReserveModal(true);
  };

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
      formData.append('rental_price', newBook.rental_price);
      formData.append('rental_period_days', newBook.rental_period_days);
      formData.append('late_fee_per_day', newBook.late_fee_per_day);
      formData.append('availability_status', newBook.availability_status);
      formData.append('condition', newBook.condition);
      formData.append('min_rental_period_days', newBook.min_rental_period_days);
      
      // Append the image file if it exists
      if (newBook.image) {
        formData.append('image', newBook.image.name);
        formData.append('image_file', newBook.image);
      }
  
      await dispatch(addBookToRent(formData)).unwrap();
      toast.success('Book added for rent successfully');
      setShowAddBookForm(false);
      setNewBook({
        title: '',
        author_id: '',
        category_id: '',
        description: '',
        published_year: '',
        rental_price: '',
        rental_period_days: 7,
        late_fee_per_day: 1,
        availability_status: 'available',
        condition: 'good',
        min_rental_period_days: 1,
        image: null
      });
      setPreviewImage(null);
      dispatch(fetchBooksToRent());
    } catch (error) {
      toast.error('Failed to add book for rent');
    }
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
      <Container className="rent-books-container">
        <Row>
          <h2 className="book-list-title">Books to Rent</h2>
          
          <div className="mb-4 text-center">
            <Form.Control
              type="text"
              placeholder="Search books..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
            />
          </div>

          {/* Add Book to Rent button for admin */}
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
                    <span>Rental Price: {selectedBook.rental_price} USD</span>
                  </div>
            
                  <div className="book-detail">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Published: {selectedBook.published_year}</span>
                  </div>
            
                  {/* Add availability status with color coding */}
                  <div className="book-detail">
                    <i className="fas fa-info-circle"></i>
                    <span>Status : 
                      <span className={`status-badge ${selectedBook.availability_status.toLowerCase()}`}>
                        {selectedBook.availability_status}
                      </span>
                    </span>
                  </div>
            
                  {/* Add condition information */}
                  <div className="book-detail">
                    <i className="fas fa-clipboard-check"></i>
                    <span>Condition : 
                      <span className={`condition-badge ${selectedBook.condition.toLowerCase()}`}>
                        {selectedBook.condition}
                      </span>
                    </span>
                  </div>
                </div>
            
                    
                  </div>

                  <div className="book-actions">
                    <i
                      className={`fas fa-heart ${wishlist.some(item => item.id === selectedBook?.id) ? 'red-heart' : ''}`}
                      onClick={() => handleWishlistToggle(selectedBook)}
                      style={{ color: wishlist.some(item => item.id === selectedBook?.id) ? '#af002d' : 'black' }}
                    ></i>
                    {user&& (
                        <button 
                            className="order-icon" 
                            onClick={() => handleReserveBook(selectedBook)} 
                            style={{ cursor: 'pointer', color: 'blue' }}
                        >
                            Reserve Online
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
            )}

            {(localSearchQuery ? filteredBooks : sortedBooks).map((book) => (
              <div key={book.id} className="book-item">
                <img
                  onClick={() => handleBookClick(book)}
                  src={book.image ? `http://127.0.0.1:8000/storage/BookImages/${book.image}` : 'https://via.placeholder.com/150'}
                  alt={book.title}
                  className={`book-image ${selectedBook?.id === book.id ? 'large-image' : ''}`}
                />
              </div>
            ))}
          </div>

            {/* Add Book to Rent Offcanvas */}
            <Offcanvas 
                show={showAddBookForm} 
                onHide={() => setShowAddBookForm(false)}
                placement="bottom"
                style={{ height: '80vh' }}
            >
                <Offcanvas.Header closeButton>
                <Offcanvas.Title>Add Book to Rent</Offcanvas.Title>
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
                    <Form.Label>Rental Price</Form.Label>
                    <Form.Control
                        type="number"
                        step="0.01"
                        name="rental_price"
                        value={newBook.rental_price}
                        onChange={handleNewBookChange}
                        required
                    />
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <Form.Label>Rental Period (days)</Form.Label>
                    <Form.Control
                        type="number"
                        name="rental_period_days"
                        value={newBook.rental_period_days}
                        onChange={handleNewBookChange}
                        required
                    />
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <Form.Label>Late Fee Per Day</Form.Label>
                    <Form.Control
                        type="number"
                        step="0.01"
                        name="late_fee_per_day"
                        value={newBook.late_fee_per_day}
                        onChange={handleNewBookChange}
                        required
                    />
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <Form.Label>Availability Status</Form.Label>
                    <Form.Select
                        name="availability_status"
                        value={newBook.availability_status}
                        onChange={handleNewBookChange}
                        required
                    >
                        <option value="available">Available</option>
                        <option value="rented">Rented</option>
                        <option value="reserved">Reserved</option>
                    </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <Form.Label>Condition</Form.Label>
                    <Form.Select
                        name="condition"
                        value={newBook.condition}
                        onChange={handleNewBookChange}
                        required
                    >
                        <option value="new">New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="damaged">Damaged</option>
                    </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <Form.Label>Minimum Rental Period (days)</Form.Label>
                    <Form.Control
                        type="number"
                        name="min_rental_period_days"
                        value={newBook.min_rental_period_days}
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
                    Add Book to Rent
                    </Button>
                </Form>
                </Offcanvas.Body>
            </Offcanvas>
        </Row>
        {selectedBookForReserve && (
        <ReserveFastModal
          show={showReserveModal}
          handleClose={() => setShowReserveModal(false)}
          book={selectedBookForReserve}
          userId={user?.id}
        />
      )}
      </Container>


    </>
  );
};

export default RentBooks;