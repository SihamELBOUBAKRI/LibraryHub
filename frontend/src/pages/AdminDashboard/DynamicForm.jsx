import React, { useState,useEffect } from "react";
import { useDispatch } from "react-redux";
import { addUser, updateUser } from "../../features/users/userSlice";
import { createMembership, updateMembership } from "../../features/membership/membershipSlice";
import { addBookToSell, updateBookToSell } from "../../features/book_to_sell/book_to_sellSlice";
import { createAuthor, updateAuthor } from "../../features/authors/authorsSlice";

const DynamicForm = ({ formType, initialData, onCancel }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState(initialData || {});
    const membershipPrices = {
        monthly: 20,
        yearly: 200
      };
      const [membershipType, setMembershipType] = useState("monthly");
    const [amount, setAmount] = useState(membershipPrices[membershipType]);
    useEffect(() => {
        setAmount(membershipPrices[membershipType]);
      }, [membershipType]);
    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        switch (formType) {
            case "addUser":
                dispatch(addUser(formData));
                break;
            case "updateUser":
                dispatch(updateUser(formData));
                break;
            case "addMembership":
                dispatch(createMembership(formData));
                break;
            case "updateMembership":
                dispatch(updateMembership(formData));
                break;
            case "addBook":
                dispatch(addBookToSell(formData));
                break;
            case "updateBook":
                dispatch(updateBookToSell(formData));
                break;
            case "addAuthor":
                dispatch(createAuthor(formData));
                break;
            case "updateAuthor":
                dispatch(updateAuthor(formData));
                break;
            default:
                break;
        }
        onCancel(); // Close form after submission
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <h3>{formType.includes("update") ? `Update ${formType.split("update")[1]}` : `Add ${formType.split("add")[1]}`}</h3>

                {/* User Form Fields */}
                {formType.includes("User") && (
                    <>
                        <input name="name" value={formData.name || ""} onChange={handleChange} placeholder="Name" required />
                        <input name="email" value={formData.email || ""} onChange={handleChange} placeholder="Email" required />
                        <input type="password" name="password" value={formData.password || ""} onChange={handleChange} placeholder="Password" />
                        <input name="address" value={formData.address || ""} onChange={handleChange} placeholder="Address" />
                        <input name="tele" value={formData.tele || ""} onChange={handleChange} placeholder="Phone Number" />
                        <input name="cin" value={formData.cin || ""} onChange={handleChange} placeholder="CIN" required />
                        <input type="date" name="birthyear" value={formData.birthyear || ""} onChange={handleChange} placeholder="Birth Year" />
                    </>
                )}

                {/* Membership Form Fields */}
                {formType.includes("Membership") && (
                    <>
                        <input name="user_id" value={formData.user_id || ""} onChange={handleChange} placeholder="User ID" required />
                        <select name="membership_type" value={formData.membership_type || ""} onChange={handleChange} required>
                            <option value="">Select Membership Type</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                        <input type="number" name="amount_paid" value={formData.amount_paid || ""} onChange={handleChange} placeholder="Amount Paid" required />
                        <select name="payment_method" required>
                            <option value="credit_card">Credit Card</option>
                            <option value="paypal">PayPal</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cash">Cash</option>
                        </select>
                        <input name="transaction_id" value={formData.transaction_id || ""} onChange={handleChange} placeholder="Transaction ID (Optional)" />
                        
                    </>
                )}

                {/* Book for Sale Form Fields */}
                {formType.includes("Book") && (
                    <>
                        <input name="title" value={formData.title || ""} onChange={handleChange} placeholder="Book Title" required />
                        <input name="author" value={formData.author || ""} onChange={handleChange} placeholder="Author ID" required />
                        <input type="number" name="price" value={formData.price || ""} onChange={handleChange} placeholder="Price" required />
                        <input type="number" name="stock" value={formData.stock || ""} onChange={handleChange} placeholder="Stock Quantity" required />
                    </>
                )}

                {/* Author Form Fields */}
                {formType.includes("Author") && (
                    <>
                        <input name="name" value={formData.name || ""} onChange={handleChange} placeholder="Author Name" required />
                        <textarea name="bio" value={formData.bio || ""} onChange={handleChange} placeholder="Biography"></textarea>
                    </>
                )}

                <div className="form-actions">
                    <button type="submit">Submit</button>
                    <button type="button" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default DynamicForm;
