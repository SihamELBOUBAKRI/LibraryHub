// AuthorsList.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuthors } from '../../features/authors/authorsSlice';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Import Link to enable navigation
import Navbar from '../Navbar/Navbar';
import './AuthorsList.css';

const AuthorsList = () => {
  const dispatch = useDispatch();
  const { authors, loading, error } = useSelector((state) => state.authors);

  useEffect(() => {
    dispatch(fetchAuthors());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Container className="authors-container">
        <h2 className="text-center">Authors</h2>

        {loading && (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        <Row>
          {authors.map((author) => (
            <Col key={author.id} md={4} lg={3} className="mb-4">
              <Link to={`/authors/${author.id}`}> {/* Navigate to AuthorDetails */}
                <Card className="shadow-sm">
                  <Card.Img
                    variant="top"
                    src={author.image ? `http://127.0.0.1:8000/storage/AuthorImages/${author.image}` : 'https://via.placeholder.com/150'}
                    alt={author.name}
                    className="author-image"
                  />
                  <Card.Body>
                    <Card.Title className="text-center">{author.name}</Card.Title>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default AuthorsList;
