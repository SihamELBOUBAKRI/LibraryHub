import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addUser } from '../../features/users/userSlice';
import './AddUserForm.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const AddUserForm = () => {
    const dispatch = useDispatch();
    const navigate=useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cin: '',
        address: '',
        tele: '',
        password: '',
        birthdate: '',
        role: 'customer'
    });
    const [validationErrors, setValidationErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});

        try {
            // Format data for backend
            const userData = {
                name: formData.name,
                email: formData.email,
                cin: formData.cin,
                address: formData.address || null,
                tele: formData.tele || null,
                password: formData.password,
                birthyear: formatBirthdate(formData.birthdate),
                role: formData.role
            };

            await dispatch(addUser(userData)).unwrap();
            
            // Success notification only
            toast.success('User created successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                cin: '',
                address: '',
                tele: '',
                password: '',
                birthdate: '',
                role: 'customer'
            });
            navigate('/AdminDashboard')

        } catch (error) {
            setValidationErrors(error);

        }
    };

    const formatBirthdate = (dateString) => {
        if (!dateString) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const handleChange = (e) => {
        // Clear validation error for the field being edited
        if (validationErrors[e.target.name]) {
            setValidationErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[e.target.name];
                return newErrors;
            });
        }
        
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <>
            <div className="form-modal">
                <div className="form-content">
                    <button className="close-btn">×</button>
                    <h2>Add New User</h2>
                    
                    {/* Display general errors */}
                    {validationErrors.general && (
                        <div className="error-message">{validationErrors.general}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Name Field */}
                        <div className="form-group inline">
                            <label>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={validationErrors.name ? 'input-error' : ''}
                            />
                            {validationErrors.name && (
                                <span className="field-error">{validationErrors.name[0]}</span>
                            )}
                        </div>
                        
                        {/* CIN Field */}
                        <div className="form-group inline">
                            <label>CIN</label>
                            <input
                                type="text"
                                name="cin"
                                value={formData.cin}
                                onChange={handleChange}
                                required
                                className={validationErrors.cin ? 'input-error' : ''}
                            />
                            {validationErrors.cin && (
                                <span className="field-error">{validationErrors.cin[0]}</span>
                            )}
                        </div>

                        {/* Email Field */}
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={validationErrors.email ? 'input-error' : ''}
                            />
                            {validationErrors.email && (
                                <span className="field-error">{validationErrors.email[0]}</span>
                            )}
                        </div>

                        {/* Phone Field */}
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="text"
                                name="tele"
                                value={formData.tele}
                                onChange={handleChange}
                                className={validationErrors.tele ? 'input-error' : ''}
                            />
                            {validationErrors.tele && (
                                <span className="field-error">{validationErrors.tele[0]}</span>
                            )}
                        </div>

                        {/* Address Field */}
                        <div className="form-group inline">
                            <label>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className={validationErrors.address ? 'input-error' : ''}
                            />
                            {validationErrors.address && (
                                <span className="field-error">{validationErrors.address[0]}</span>
                            )}
                        </div>

                        {/* Birthdate Field */}
                        <div className="form-group inline">
                            <label>Birthdate</label>
                            <input
                                type="date"
                                name="birthdate"
                                value={formData.birthdate}
                                onChange={handleChange}
                                required
                                className={validationErrors.birthyear ? 'input-error' : ''}
                            />
                            {validationErrors.birthyear && (
                                <span className="field-error">{validationErrors.birthyear[0]}</span>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="form-group inline">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className={validationErrors.password ? 'input-error' : ''}
                            />
                            {validationErrors.password && (
                                <span className="field-error">{validationErrors.password[0]}</span>
                            )}
                        </div>

                        {/* Role Field */}
                        <div className="form-group inline">
                            <label>Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <button type="submit" className="submit-btn">Add User</button>
                    </form>
                </div>
            </div>
            
        </>
    );
};

export default AddUserForm;