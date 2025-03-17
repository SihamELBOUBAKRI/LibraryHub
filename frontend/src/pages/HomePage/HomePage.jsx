import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap'; // Import Spinner here
import BookList from '../../components/Booklist/BookList';
import './HomePage.css';
import Navbar from '../../components/Navbar/Navbar';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Container className="my-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-4">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="homepage-container">
      <section id="main-content">
        <BookList />
      </section>

      <section id="contact-section" className="contact-section">
        <Container>
          <h2>Contact Us</h2>
          <Row>
            <Col md={4}>
              <h3>Contact</h3>
              <p>
                Email: <a href="mailto:info@ourlibrary.com" className="contact-link">info@ourlibrary.com</a>
              </p>
              <p>
                Phone: <a href="tel:+1234567890" className="contact-link">+123 456 7890</a>
              </p>
            </Col>
            <Col md={4}>
              <h3>Address</h3>
              <p>
                <a 
                  href="https://maps.google.com/?q=123+Book+Street,Knowledge+City,World" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-link"
                >
                  123 Book Street, Knowledge City, World
                </a>
              </p>
            </Col>
            <Col md={4}>
              <h3>Follow Us</h3>
              <p>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">Facebook</a> |
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link"> Twitter</a> |
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link"> Instagram</a>
              </p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
    </>
  );
};

export default HomePage;
