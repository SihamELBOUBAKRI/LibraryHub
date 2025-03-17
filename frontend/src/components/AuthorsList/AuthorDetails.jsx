// AuthorDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuthorDetails } from '../../features/authors/authorsSlice';
import { Card, Container, Spinner, Alert, Row, Col } from 'react-bootstrap';
import Navbar from '../Navbar/Navbar';
import './AuthorDetails.css';

const AuthorDetails = () => {
  const { id } = useParams(); // Get author ID from the URL
  const dispatch = useDispatch();
  const { author, books, loading, error } = useSelector((state) => state.authors);
  
  useEffect(() => {
    dispatch(fetchAuthorDetails(id)); // Dispatch action to fetch author details and books
  }, [dispatch, id]);

  return (
    <>
      <Navbar />
      <Container className="author-details-container">
        {loading && (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {author && (
          <Card className="mb-4">
            <Card.Img
              variant="top"
              src={author.image ? `http://127.0.0.1:8000/storage/AuthorImages/${author.image}` : 'https://via.placeholder.com/150'}
              alt={author.name}
              className="author-image"
            />
            <Card.Body>
              <Card.Title>{author.name}</Card.Title>
              <Card.Text>{author.bio}</Card.Text>
            </Card.Body>
          </Card>
        )}

        <h3>Books by {author?.name}</h3>
        <Row>
          {books?.map((book) => (
            <Col key={book.id} md={4} lg={3} className="mb-4">
              <Card className="shadow-sm">
                <Card.Img
                  variant="top"
                  src={book.image ? `http://127.0.0.1:8000/storage/BookImages/${book.image}` : 'https://via.placeholder.com/150'}
                  alt={book.title}
                />
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <Card.Text>{book.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default AuthorDetails;
