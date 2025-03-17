import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, removeFromCart } from '../../features/cart/cartSlice';
import './Cart.css'; // Ensure you have this file for styling

const Cart = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items = [], status } = useSelector(state => state.cart);

  const [updatedItems, setUpdatedItems] = useState(items); // Local state for updated items
  const [totalAmount, setTotalAmount] = useState(0); // Local state for totalAmount

  useEffect(() => {
    if (user) {
      dispatch(fetchCart(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    setUpdatedItems(items); // Sync local state with updated cart data
    calculateTotalAmount(items); // Recalculate total when items change
  }, [items]);

  // Calculate the total amount for the cart
  const calculateTotalAmount = (items) => {
    const total = items.reduce((acc, item) => {
      const price = parseFloat(item.book.price) || 0; // Ensure price is a number
      const quantity = item.book.quantity || 1; // Default to 1 if quantity is missing or 0
  
  
      if (!isNaN(price) && !isNaN(quantity)) {
        return acc + price * quantity; // Add price * quantity to total
      } else {
        return acc; // If price or quantity is invalid, skip this item
      }
    }, 0);
  
    // Round the total to two decimal places
    const roundedTotal = total.toFixed(2);
    setTotalAmount(roundedTotal); // Update the totalAmount state
  };
  const handleRemoveItem = (bookId) => {
    if (user) {
      dispatch(removeFromCart({ userId: user.id, bookId }));
    }
  };

  if (status === 'loading') {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {updatedItems.length === 0 ? (
        <div className="empty-cart-message">
          <p>Your cart is empty. Add books to your cart.</p>
        </div>
      ) : (
        <div className="cart-table-container">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Book Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {updatedItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.book.title}</td>
                  <td>{item.book.price}</td>
                  <td>{item.quantity}</td>
                  <td>{(item.book.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button onClick={() => handleRemoveItem(item.book_id)} className="remove-button">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cart-summary">
            <h3>Total: {totalAmount}</h3> {/* Display calculated totalAmount */}
          </div>
          <div className="checkout-button-container">
            <button className="checkout-button">Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
