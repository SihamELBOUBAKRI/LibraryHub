// AuthorsList.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuthors } from '../../features/authors/authorsSlice';
import { Container, Row, Col, Card, Spinner, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Import Link to enable navigation
import Navbar from '../Navbar/Navbar';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './AuthorsList.css';
import { FaPlus } from 'react-icons/fa';

const AuthorsList = () => {
  const dispatch = useDispatch();
  const { authors, loading, error } = useSelector((state) => state.authors);
  const { user } = useSelector((state) => state.auth); // Get current user
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");



  useEffect(() => {
    dispatch(fetchAuthors());
  }, [dispatch]);


   // Handle Add Author Button click
   const handleAddAuthor = () => {
    if (user?.role === 'admin') {
      navigate('/add-author'); // Navigate to the Add Author page (make sure you have this route defined)
    }
  };

   // Handle the search input change
   const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  // Filter authors based on the search query
  const filteredAuthors = authors.filter((author) =>
    author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <Container className="authors-container">
        <h2 className="text-center">Authors</h2>

    {/* Search Bar */}
        <div className="mb-4 text-center">
              <Form.Control
                type="text"
                placeholder="Search for an author..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
        </div>

        {/* Show Add Author Button only if the user is an admin */}
        {user?.role === 'admin' && (
            <Button className="round"onClick={handleAddAuthor}>
              <FaPlus />            
            </Button>
        )}

        {loading && (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        <Row>
          {filteredAuthors.map((author) => (
            <Col key={author.id} md={4} lg={3} className="author-card">
              <Link to={`/authors/${author.id}`}> {/* Navigate to AuthorDetails */}
                <Card className="shadow-sm">
                  <Card.Img
                    variant="top"
                    src={`http://127.0.0.1:8000/storage/AuthorImages/${author.image}`}
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
