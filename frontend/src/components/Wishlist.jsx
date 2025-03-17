import React from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';

const WishlistPage = () => {
  const wishlist = useSelector(state => state.wishlist.items);

  return (
    <Container className="my-4">
      <h2>Your Wishlist</h2>
      {wishlist.length === 0 ? (
        <Alert variant="info">Your wishlist is empty.</Alert>
      ) : (
        <Row>
          {wishlist.map((book) => (
            <Col key={book.id} md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <Card.Text>{book.author}</Card.Text>
                  {/* Optionally, add a button to remove the book from wishlist */}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default WishlistPage;
