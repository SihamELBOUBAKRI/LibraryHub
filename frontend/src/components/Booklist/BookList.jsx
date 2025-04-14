import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBookToSell, fetchBooksToSell, fetchCategories, deleteBookToSell, updateBookToSell } from '../../features/book_to_sell/book_to_sellSlice';
import { fetchBooksToRent } from '../../features/book_to_rent/book_to_rentSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Button, Spinner, Form, InputGroup, Offcanvas, Table } from 'react-bootstrap';
import { addToCart } from '../../features/cart/cartSlice';
import { addWishlistItem, fetchWishlist, removeWishlistItem } from '../../features/wishlist/wishlistSlice';
import { FaSearch, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import './BookList.css';
import OrderFastModal from './OrderFastModal';
import { fetchAuthors } from '../../features/authors/authorsSlice';
import { ToastContainer, toast } from 'react-toastify';

const BookList = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [selectedBook, setSelectedBook] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [filteredBooks, setFilteredBooks] = useState([]);
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
  const [showBookForm, setShowBookForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);

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

  // Separate handler for adding a new book
  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      formData.append('title', newBook.title);
      formData.append('author_id', newBook.author_id);
      formData.append('category_id', newBook.category_id);
      formData.append('description', newBook.description);
      formData.append('published_year', newBook.published_year);
      formData.append('price', newBook.price);
      formData.append('stock', newBook.stock);
      
      if (newBook.image instanceof File) {
        formData.append('image', newBook.image.name);
        formData.append('image_file', newBook.image);
      }

      await dispatch(addBookToSell(formData)).unwrap();
      toast.success('Book added successfully');
      
      setShowBookForm(false);
      resetForm();
      dispatch(fetchBooksToSell());
    } catch (error) {
      toast.error('Failed to add the book.');
    }
  };

  // Separate handler for editing a book
  const handleEditBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookData = {
        title: newBook.title,
        author_id: newBook.author_id,
        category_id: newBook.category_id,
        description: newBook.description,
        published_year: newBook.published_year,
        price: newBook.price,
        stock: newBook.stock,
      };

      // Only include image if it was changed
      if (imageChanged && newBook.image instanceof File) {
        bookData.image = newBook.image.name;
      } else if (!imageChanged) {
        // Keep the existing image if not changed
        bookData.image = newBook.image;
      }

      await dispatch(updateBookToSell({ 
        id: currentBookId, 
        bookData 
      })).unwrap();
      toast.success('Book updated successfully');
      
      setShowBookForm(false);
      resetForm();
      dispatch(fetchBooksToSell());
    } catch (error) {
      toast.error('Failed to update the book.');
    }
  };

  // Unified form submission handler
  const handleBookFormSubmit = (e) => {
    if (isEditing) {
      handleEditBookSubmit(e);
    } else {
      handleAddBook(e);
    }
  };

  const resetForm = () => {
    setNewBook({
      title: '',
      author_id: '',
      category_id: '',
      description: '',
      published_year: '',
      price: '',
      stock: '',
      image: ''
    });
    setPreviewImage(null);
    setIsEditing(false);
    setCurrentBookId(null);
    setImageChanged(false);
  };

  const handleNewBookChange = (e) => {
    const { name, value } = e.target;
    setNewBook(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookClick = (book) => {
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
      setImageChanged(true);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
    setNewBook({
      title: book.title,
      author_id: book.author?.id || '',
      category_id: book.category?.id || '',
      description: book.description,
      published_year: book.published_year,
      price: book.price,
      stock: book.stock,
      image: book.image
    });
    setCurrentBookId(book.id);
    setIsEditing(true);
    setImageChanged(false);
    setShowBookForm(true);
    if (book.image) {
      setPreviewImage(`http://127.0.0.1:8000/storage/BookImages/${book.image}`);
    } else {
      setPreviewImage(null);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await dispatch(deleteBookToSell(bookId)).unwrap();
        toast.success('Book deleted successfully');
        dispatch(fetchBooksToSell());
      } catch (error) {
        toast.error('Failed to delete the book.');
      }
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
        <h2 className="book-list-title">Books Management</h2>
        
        <div className="mb-4">
          <InputGroup>
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

        <Button 
          variant="primary" 
          onClick={() => {
            resetForm();
            setShowBookForm(true);
          }}
          className="mb-3"
        >
          <FaPlus /> Add New Book
        </Button>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Cover</th>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {(localSearchQuery ? filteredBooks : books).map((book) => (
               <tr key={book.id}>
                <td>
                  <img
                    src={book?.image && `http://127.0.0.1:8000/storage/BookImages/${book.image}`}
                    alt={book?.title || 'Book cover'}
                    style={{ width: '50px', height: 'auto' }}
                  />
                </td>
                <td>{book.title}</td>
                <td>{book.author?.name || 'N/A'}</td>
                <td>{book.category?.name || 'N/A'}</td>
                <td>${book.price}</td>
                <td>{book.stock}</td>
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
          show={showBookForm} 
          onHide={() => {
            setShowBookForm(false);
            resetForm();
          }}
          placement="bottom"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>{isEditing ? 'Edit Book' : 'Add New Book'}</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Form onSubmit={handleBookFormSubmit}>
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
                    {isEditing && !imageChanged && (
                      <div className="form-text">Leave empty to keep current image</div>
                    )}
                  </div>
                )}
              </Form.Group>

              <Button variant="primary" type="submit">
                {isEditing ? 'Update Book' : 'Add Book'}
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
          <h2 className="book-list-title">Books</h2>

          <div className="mb-4 text-center">
           <InputGroup>
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
                  </div>
                </div>
              </div>
            )}
            {(localSearchQuery ? filteredBooks : sortedBooks).map((book) => (
              book && (
                <div key={book.id} className="book-item">
                  <img
                    onClick={() => handleBookClick(book)}
                    src={book?.image && `http://127.0.0.1:8000/storage/BookImages/${book.image}`}
                    alt={book?.title || 'Book cover'}
                    className={`book-image ${selectedBook?.id === book?.id ? 'large-image' : ''}`}
                  />
                </div>
              )
            ))}
          </div>
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
      <ToastContainer />
    </>
  );
};

export default BookList;