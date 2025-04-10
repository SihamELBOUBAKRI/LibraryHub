import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAuthorDetails } from "../../features/authors/authorsSlice";
import { fetchBooksToSell } from "../../features/book_to_sell/book_to_sellSlice";
import { addToCart } from "../../features/cart/cartSlice"; // Import addToCart action
import { FaShoppingCart, FaHeart,FaEdit } from 'react-icons/fa'; // Import icons
import './AuthorDetails.css'; // Import the CSS for styling

const AuthorDetails = () => {
  const dispatch = useDispatch();
  const { authorId } = useParams(); // Get the author ID from the URL
  const { author, loading: authorLoading, error: authorError } = useSelector((state) => state.authors);
  const { books = [], loading: booksLoading, error: booksError } = useSelector((state) => state.book_to_sell);
  const { userId } = useSelector((state) => state.auth);
  const [addedToCart, setAddedToCart] = useState(false);
  const navigate=useNavigate();
   const { user } = useSelector((state) => state.auth);
   

  // Fetch author details and books when the component mounts
  useEffect(() => {
    dispatch(fetchAuthorDetails(authorId));
    dispatch(fetchBooksToSell());
  }, [dispatch, authorId]);
  

  // Filter books by author ID
  const filteredBooks = books.filter((book) => book.author_id === parseInt(authorId));

  // Handle loading state
  if (authorLoading || booksLoading) {
    return <div>Loading...</div>;
  }

  // Handle error state
  if (authorError) {
    return <div>Error: {authorError}</div>;
  }

  if (booksError) {
    return <div>Error: {booksError}</div>;
  }

  // Handle case where author is null or undefined
  if (!author) {
    return <div>Author not found.</div>;
  }

  const handleAddToCart = (book) => {
      if (user) {
        dispatch(addToCart({ userId: user.id, bookId: book.id, quantity: 1 }));
        setAddedToCart(true); // Mark as added to cart
      } else {
        navigate('/login'); // Redirect to login if not authenticated
      }
    };

  // Handle Add to Wishlist (You can create a similar action for this)
  const handleAddToWishlist = (bookId) => {
    console.log(`Added to wishlist: ${bookId}`);
    // You can implement the logic for adding to wishlist here
  };


   // Handle edit author action
   const handleEditAuthor = () => {
    navigate(`/edit-author/${authorId}`); // Navigate to the Edit Author page
  };

  return (
    <div className="author-details">
      <div className="author-info">
        <img
          src={`http://127.0.0.1:8000/storage/AuthorImages/${author.image}`} // Adjust path accordingly
          alt={author.name}
          className="author-img"
        />
        <div>
          <h2>{author.name}</h2>
          <p>{author.bio}</p>
        </div>


        {/* Show edit icon only if the user is an admin */}
        {user?.role === 'admin' && (
          <FaEdit className="edit-icon" onClick={handleEditAuthor} />
        )}
      </div>

      <div className="books-list">
        <h3>Books by {author.name}</h3>
        {filteredBooks.length > 0 ? (
          <ul>
            {filteredBooks.map((book) => (
              <li key={book.id} className="book-item">
                <div className="book-image">
                  <img
                    src={`http://127.0.0.1:8000/storage/BookImages/${book.image}`} // Adjust path accordingly
                    alt={book.title}
                    className="book-img"
                  />
                </div>
                <div className="book-info">
                  <strong>{book.title}</strong> - ${book.price}
                </div>
                <div className="book-actions">
                  <FaShoppingCart
                    className="cart-icon"
                    onClick={() => handleAddToCart(book)}
                  />
                  <FaHeart
                    className="wishlist-icon"
                    onClick={() => handleAddToWishlist(book)}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No books found for this author.</p>
        )}
      </div>
    </div>
  );
};

export default AuthorDetails;
