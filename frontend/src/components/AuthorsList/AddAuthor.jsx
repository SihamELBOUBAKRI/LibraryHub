import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAuthor } from '../../features/authors/authorsSlice';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import './AddAuthor.css'


const AddAuthor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.authors);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    image: '', // Changed from null to empty string
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear validation error when user types
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: null
      });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        image: e.target.files[0].name, // Store only the filename
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create a plain object instead of FormData
    const authorData = {
      name: formData.name,
      bio: formData.bio,
      image: formData.image, // This is now just the filename string
    };

    try {
      const result = await dispatch(createAuthor(authorData));
      
      if (createAuthor.fulfilled.match(result)) {
        toast.success('Author added succesfully!');
        navigate('/authors');
      } else if (createAuthor.rejected.match(result)) {
        // Handle specific error cases
        if (result.payload?.errors) {
          setValidationErrors(result.payload.errors);
        }
      }
    } catch (err) {
        toast.error('Failed to create author!');
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
    }
  };

  return (
    <>
    <Container className="add-author-container mt-4">
      <h2 className='add-author-title'>Add New Author</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form className='add-author-form' onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            isInvalid={!!validationErrors.name}
            required
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.name}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Biography</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            isInvalid={!!validationErrors.bio}
            required
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.bio}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Author Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            isInvalid={!!validationErrors.image}
            required
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.image}
          </Form.Control.Feedback>
          <Form.Text muted>
            Selected file: {formData.image || 'None'}
          </Form.Text>
        </Form.Group>

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              {' Adding...'}
            </>
          ) : (
            'Add Author'
          )}
        </Button>
      </Form>
    </Container>
    </>
    
  );
};

export default AddAuthor;