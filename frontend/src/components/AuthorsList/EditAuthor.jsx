import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updateAuthor, fetchAuthorDetails } from '../../features/authors/authorsSlice';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
const EditAuthor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authorId } = useParams();
  const { author, loading, error } = useSelector((state) => state.authors);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    image: '', // Now storing just the filename string
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null); // For file selection only

  // Load author data
  useEffect(() => {
    dispatch(fetchAuthorDetails(authorId));
  }, [dispatch, authorId]);

  // Initialize form data
  useEffect(() => {
    if (author) {
      setFormData({
        name: author.name,
        bio: author.bio,
        image: author.image, // Existing image filename
      });
    }
  }, [author]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: null
      });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Update the formData with just the filename
      setFormData({
        ...formData,
        image: file.name,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    // Create a regular object instead of FormData
    const authorData = {
      name: formData.name,
      bio: formData.bio,
      image: formData.image, // Just the filename string
    };


    try {
      const result = await dispatch(updateAuthor({
        id: authorId,
        authorData // Regular object instead of FormData
      }));

      if (updateAuthor.fulfilled.match(result)) {
        navigate(`/authors/${authorId}`);
      } else if (updateAuthor.rejected.match(result)) {
        console.error('Update error:', result.error);
        if (result.payload?.errors) {
          setValidationErrors(result.payload.errors);
        }
      }
    } catch (err) {
      console.error('Submission error:', err);
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
    }
  };

  return (
    <Container className="add-author-container mt-4">
      <h2 className='add-author-title'>Edit Author</h2>
      
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
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.image}
          </Form.Control.Feedback>
          
          {/* Current image info */}
          {formData.image && (
            <div className="mt-2">
              <p>Current image: {formData.image}</p>
              {selectedFile ? (
                <img 
                  src={`http://127.0.0.1:8000/storage/AuthorImages/${selectedFile.name}`}
                  alt="Current author"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                  className="img-thumbnail"
                />
              ) : (
                <img 
                  src={`http://127.0.0.1:8000/storage/AuthorImages/${formData.image}`}
                  alt="Current author"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                  className="img-thumbnail"
                />
              )}
            </div>
          )}
        </Form.Group>

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              {' Updating...'}
            </>
          ) : (
            'Update Author'
          )}
        </Button>
        
        <Button 
          variant="secondary" 
          className="ms-2"
          onClick={() => navigate(`/authors/${authorId}`)}
        >
          Cancel
        </Button>
      </Form>
    </Container>
  );
};

export default EditAuthor;