import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooksToRent, addBookToRent, deleteBookToRent, updateBookToRent } from '../../features/book_to_rent/book_to_rentSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Button, Spinner, Form, InputGroup, Offcanvas, Table } from 'react-bootstrap';
import { addWishlistItem, removeWishlistItem, fetchWishlist } from '../../features/wishlist/wishlistSlice';
import { FaSearch, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBookForEdit, setSelectedBookForEdit] = useState(null);
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
  const [imageChanged, setImageChanged] = useState(false);

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
    if (isAuthenticated && user) {
      dispatch(fetchWishlist(user.id));
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    const filtered = books.filter((book) => {
      if (!book || !book.title) return false;
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

  const handleBookClick = (book) => {
    setSelectedBook(prevSelected => 
      prevSelected?.id === book.id ? null : book
    );
    window.scrollTo(0, 0);
  };

  const handleSearch = () => {
    const filtered = books.filter((book) =>
      book.title.toLowerCase().includes(localSearchQuery.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  const handleEditBook = (book) => {
    setNewBook({
      title: book.title,
      author_id: book.author_id,
      category_id: book.category_id,
      description: book.description,
      published_year: book.published_year,
      rental_price: book.rental_price,
      rental_period_days: book.rental_period_days,
      late_fee_per_day: book.late_fee_per_day,
      availability_status: book.availability_status,
      condition: book.condition,
      min_rental_period_days: book.min_rental_period_days,
      image: book.image
    });
    setPreviewImage(book.image ? `http://127.0.0.1:8000/storage/BookImages/${book.image}` : null);
    setSelectedBookForEdit(book);
    setIsEditMode(true);
    setImageChanged(false);
    setShowAddBookForm(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this rental book?')) {
      try {
        await dispatch(deleteBookToRent(bookId)).unwrap();
        toast.success('Rental book deleted successfully');
        dispatch(fetchBooksToRent());
      } catch (error) {
        toast.error('Failed to delete the rental book.');
      }
    }
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
      setImageChanged(true);
      
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

  const resetForm = () => {
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
    setIsEditMode(false);
    setSelectedBookForEdit(null);
    setImageChanged(false);
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
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
      
      if (newBook.image) {
        formData.append('image', newBook.image.name);
        formData.append('image_file', newBook.image);
      }

      await dispatch(addBookToRent(formData)).unwrap();
      toast.success('Book added for rent successfully');
      
      setShowAddBookForm(false);
      resetForm();
      dispatch(fetchBooksToRent());
    } catch (error) {
      console.error('Add book error:', error);
      toast.error('Failed to add book for rent');
    }
  };

  const handleEditBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookData = {
        title: newBook.title,
        author_id: newBook.author_id,
        category_id: newBook.category_id,
        description: newBook.description,
        published_year: newBook.published_year,
        rental_price: newBook.rental_price,
        rental_period_days: newBook.rental_period_days,
        late_fee_per_day: newBook.late_fee_per_day,
        availability_status: newBook.availability_status,
        condition: newBook.condition,
        min_rental_period_days: newBook.min_rental_period_days,
      };

      if (imageChanged && newBook.image) {
        bookData.image = newBook.image.name;
      } else if (!imageChanged) {
        bookData.image = selectedBookForEdit.image;
      }

      await dispatch(updateBookToRent({ 
        id: selectedBookForEdit.id, 
        bookData 
      })).unwrap();
      toast.success('Book updated successfully');
      
      setShowAddBookForm(false);
      resetForm();
      dispatch(fetchBooksToRent());
    } catch (error) {
      console.error('Update book error:', error);
      toast.error('Failed to update book');
    }
  };

  const handleAddBookSubmit = (e) => {
    if (isEditMode) {
      handleEditBookSubmit(e);
    } else {
      handleAddBook(e);
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

  // Admin View - Table Layout
  if (user?.role === 'admin') {
    return (
      <Container className="book-list-container">
        <h2 className="book-list-title">Rental Books Management</h2>
        
        <div className="mb-4">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search rental books..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={handleSearch}>
              <FaSearch />
            </Button>
          </InputGroup>
        </div>

        <Button 
          variant="primary" 
          onClick={() => {
            resetForm();
            setShowAddBookForm(true);
          }}
          className="mb-3"
        >
          <FaPlus /> Add New Rental Book
        </Button>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Cover</th>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Rental Price</th>
              <th>Status</th>
              <th>Condition</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(localSearchQuery ? filteredBooks : books).map((book) => (
              <tr key={`book-row-${book.id}`}>
                <td>
                  <img
                    src={book?.image ? `http://127.0.0.1:8000/storage/BookImages/${book.image}` : 'https://via.placeholder.com/50'}
                    alt={book?.title || 'Book cover'}
                    style={{ width: '50px', height: 'auto' }}
                  />
                </td>
                <td>{book.title}</td>
                <td>{book.author?.name || 'N/A'}</td>
                <td>{book.category?.name || 'N/A'}</td>
                <td>${book.rental_price}</td>
                <td>
                  <span className={`status-badge ${book.availability_status.toLowerCase()}`}>
                    {book.availability_status}
                  </span>
                </td>
                <td>
                  <span className={`condition-badge ${book.condition.toLowerCase()}`}>
                    {book.condition}
                  </span>
                </td>
                <td>
                  <Button 
                    variant="info" 
                    size="sm" 
                    onClick={() => handleEditBook(book)}
                    className="me-2"
                  >
                    <FaEdit />
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleDeleteBook(book.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Offcanvas 
          show={showAddBookForm} 
          onHide={() => {
            setShowAddBookForm(false);
            resetForm();
          }}
          placement="bottom"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              {isEditMode ? 'Edit Rental Book' : 'Add New Rental Book'}
            </Offcanvas.Title>
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
                    <option key={`author-${author.id}`} value={author.id}>
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
                    <option key={`category-${category.id}`} value={category.id}>
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
                    {isEditMode && !imageChanged && (
                      <div className="form-text">Leave empty to keep current image</div>
                    )}
                  </div>
                )}
                {isEditMode && !imageChanged && selectedBookForEdit?.image && (
                  <div className="mt-2">
                    <p>Current Image:</p>
                    <img 
                      src={`http://127.0.0.1:8000/storage/BookImages/${selectedBookForEdit.image}`} 
                      alt="Current" 
                      style={{ maxWidth: '100px', maxHeight: '100px' }} 
                    />
                  </div>
                )}
              </Form.Group>

              <Button variant="primary" type="submit">
                {isEditMode ? 'Update Book' : 'Add Book to Rent'}
              </Button>
            </Form>
          </Offcanvas.Body>
        </Offcanvas>

        <ToastContainer />
      </Container>
    );
  }

  // Customer View - Original Layout
  return (
    <>
      <Container className="book-list-container">
        <Row>
          <h2 className="book-list-title">Books to Rent</h2>

          <div className="mb-4 text-center">
           <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search rental books..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
              <Button variant="outline-secondary" onClick={handleSearch}>
                <FaSearch />
              </Button>
            </InputGroup>
          </div>

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

                    <div className="book-detail">
                      <i className="fas fa-info-circle"></i>
                      <span>Status: 
                        <span className={`status-badge ${selectedBook.availability_status.toLowerCase()}`}>
                          {selectedBook.availability_status}
                        </span>
                      </span>
                    </div>

                    <div className="book-detail">
                      <i className="fas fa-clipboard-check"></i>
                      <span>Condition: 
                        <span className={`condition-badge ${selectedBook.condition.toLowerCase()}`}>
                          {selectedBook.condition}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="book-actions">
                    <i
                      className={`fas fa-heart ${wishlist.some(item => item.id === selectedBook?.id) ? 'red-heart' : ''}`}
                      onClick={() => handleWishlistToggle(selectedBook)}
                      style={{ color: wishlist.some(item => item.id === selectedBook?.id) ? '#af002d' : 'black' }}
                    ></i>

                    {user && (
                      <button 
                        className="order-icon" 
                        onClick={() => handleReserveBook(selectedBook)} 
                        style={{ cursor: 'pointer', color: 'blue' }}
                      >
                        Reserve Online
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            {(localSearchQuery ? filteredBooks : sortedBooks).map((book, index) => (
              book && (
                <div key={`book-item-${book.id}-${index}`} className="book-item">
                  <img
                    onClick={() => handleBookClick(book)}
                    src={book?.image ? `http://127.0.0.1:8000/storage/BookImages/${book.image}` : 'https://via.placeholder.com/150'}
                    alt={book?.title || 'Book cover'}
                    className={`book-image ${selectedBook?.id === book?.id ? 'large-image' : ''}`}
                  />
                </div>
              )
            ))}
          </div>
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
      <ToastContainer />
    </>
  );
};

export default RentBooks;