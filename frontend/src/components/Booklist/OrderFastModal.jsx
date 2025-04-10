import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { createOrder } from '../../features/orders/orderSlice';
import { ToastContainer, toast } from 'react-toastify';
import './OrderFastModal.css'
const OrderFastModal = ({ show, handleClose, book, userId }) => {
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardDetails, setCardDetails] = useState({
    card_holder_name: '',
    card_last_four: '',
    expiration_date: ''
  });
  const [notes, setNotes] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const orderData = {
        book_id: book.id,
        quantity,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        notes,
        ...(paymentMethod === 'Credit Card' ? cardDetails : {})
      };
  
      await dispatch(createOrder(orderData)).unwrap();
      toast.success('Order placed successfully!');
      setTimeout(() => {
        handleClose();
      }, 1000);
      
    } catch (error) {
      toast.error(error.message || 'Failed to place order. Please try again.');
    }
  };

  return (
    <>
    <Modal show={show} onHide={handleClose} className="order-fast-modal">
      <Modal.Header closeButton>
        <Modal.Title>Fast Order: {book.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control 
              type="number" 
              min="1" 
              max={book.stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Shipping Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Payment Method</Form.Label>
            <Form.Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Credit Card">Credit Card</option>
              <option value="PayPal">PayPal</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
            </Form.Select>
          </Form.Group>

          {paymentMethod === 'Credit Card' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Card Holder Name</Form.Label>
                <Form.Control
                  type="text"
                  value={cardDetails.card_holder_name}
                  onChange={(e) => setCardDetails({...cardDetails, card_holder_name: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Last 4 Digits</Form.Label>
                <Form.Control
                  type="text"
                  maxLength="4"
                  value={cardDetails.card_last_four}
                  onChange={(e) => setCardDetails({...cardDetails, card_last_four: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Expiration Date (MM/YYYY)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="MM/YYYY"
                  value={cardDetails.expiration_date}
                  onChange={(e) => setCardDetails({...cardDetails, expiration_date: e.target.value})}
                  required
                />
              </Form.Group>
            </>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Notes (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Place Order
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
    </>
    
  );
};

export default OrderFastModal;