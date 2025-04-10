import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { createReservation } from '../../features/reservations/bookReservationSlice';
import { ToastContainer, toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReserveFastModal = ({ show, handleClose, book, userId }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardDetails, setCardDetails] = useState({
    card_holder_name: '',
    card_last_four: '',
    card_expiration: ''
  });
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationData, setReservationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const pdfRef = useRef();

  const validateForm = () => {
    if (!cardNumber.trim()) {
      toast.error('Membership card number is required');
      return false;
    }

    if (paymentMethod === 'credit_card') {
      if (!cardDetails.card_holder_name.trim()) {
        toast.error('Card holder name is required');
        return false;
      }
      if (!/^\d{4}$/.test(cardDetails.card_last_four)) {
        toast.error('Please enter valid last 4 digits');
        return false;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.card_expiration)) {
        toast.error('Please enter valid expiration date (MM/YY)');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      // Format expiration date to match backend expectations
      const formattedExpiration = paymentMethod === 'credit_card' 
        ? cardDetails.card_expiration.replace('/', '') 
        : null;

      const reservationPayload = {
        book_id: book.id,
        user_id: userId,
        card_number: cardNumber,
        payment_method: paymentMethod,
        ...(paymentMethod === 'credit_card' && {
          card_holder_name: cardDetails.card_holder_name,
          card_last_four: cardDetails.card_last_four,
          card_expiration: formattedExpiration
        })
      };

      console.log('Sending payload:', reservationPayload); // Debug log
      
      const result = await dispatch(createReservation(reservationPayload)).unwrap();
      setReservationData(result);
      setReservationSuccess(true);
      toast.success('Book reserved successfully! You have 3 days to pick it up.');
      
    } catch (error) {
      console.error('Reservation error:', error);
      toast.error(error.message || 'Failed to reserve book. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const input = pdfRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('reservation-confirmation.pdf');
    });
  };

  const handleCloseModal = () => {
    setReservationSuccess(false);
    setReservationData(null);
    handleClose();
  };

  return (
    <>
      <Modal show={show} onHide={handleCloseModal} className="reserve-fast-modal" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {reservationSuccess ? 'Reservation Confirmation' : `Reserve Book: ${book.title}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reservationSuccess ? (
            <>
              <div className="reservation-informations" ref={pdfRef}>
                <Card className="file">
                  <Card.Body>
                    <Card.Title className="text-file">Reservation Details</Card.Title>
                    
                    <div className="row">
                      <div className="infor">
                        <h5>Book Information</h5>
                        <p><strong>Title:</strong> {reservationData.book.title}</p>
                        <p><strong>Book condition:</strong> {reservationData.book.condition}</p>
                        <p><strong>Rental Price:</strong> ${reservationData.book.rental_price}</p>
                        <p><strong>Rental Period:</strong> {reservationData.book.rental_period_days} days</p>
                      </div>
                      <div className="infor">
                        <h5>Reservation Details</h5>
                        <p><strong>Reservation Code:</strong> {reservationData.reservation_code}</p>
                        <p><strong>Status:</strong> <span className="text-success">Reserved</span></p>
                        <p><strong>Pickup Deadline:</strong> {new Date(reservationData.pickup_deadline).toLocaleString()}</p>
                        <p><strong>Payment Method:</strong> {reservationData.payment_method}</p>
                      </div>
                    </div>

                    <div className="row">
                      <div className="infor">
                        <h5>Your Information</h5>
                        <p><strong>Name:</strong> {reservationData.user.name}</p>
                        <p><strong>Email:</strong> {reservationData.user.email}</p>
                        <p><strong>Membership Card:</strong> {reservationData.membership_card.card_number}</p>
                      </div>
                      {reservationData.payment_method === 'credit_card' && (
                        <div className="infor">
                          <h5>Payment Details</h5>
                          <p><strong>Card Holder:</strong> {reservationData.card_holder_name}</p>
                          <p><strong>Card Last Four:</strong> {reservationData.card_last_four}</p>
                          <p><strong>Expiration:</strong> {reservationData.card_expiration}</p>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </div>
              <div className="text-center mt-3">
                <Button variant="primary" onClick={handleDownloadPDF} className="me-2">
                  Download as PDF
                </Button>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Close
                </Button>
              </div>
            </>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Membership Card Number</Form.Label>
                <Form.Control
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  Enter your valid library membership card number
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="cash">Cash (Pay at pickup)</option>
                </Form.Select>
              </Form.Group>

              {paymentMethod === 'credit_card' && (
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
                    <Form.Label>Expiration Date (MM/YY)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardDetails.card_expiration}
                      onChange={(e) => setCardDetails({...cardDetails, card_expiration: e.target.value})}
                      required
                    />
                  </Form.Group>
                </>
              )}

              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Reserve Book
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default ReserveFastModal;