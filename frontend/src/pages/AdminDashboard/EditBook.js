import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const EditBook = ({ book: initialBook, onClose, onSave }) => {
  const token = useSelector((state) => state.auth.token);
  const [book, setBook] = useState({
    title: "",
    author: "",
    category: "",
    price: "",
  });

  useEffect(() => {
    if (initialBook) {
      setBook(initialBook); // Pre-fill the form if editing an existing book
    }
  }, [initialBook]);

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = initialBook
      ? `http://localhost:8000/api/book-to-rent/${initialBook.id}` // Update existing book
      : "http://localhost:8000/api/book-to-rent"; // Add new book

    const method = initialBook ? "put" : "post";

    axios[method](url, book, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        Swal.fire({
          title: "Success",
          text: initialBook ? "Book updated successfully!" : "Book added successfully!",
          icon: "success",
        });
        onSave(); // Trigger the onSave callback
      })
      .catch((error) => {
        console.error("Failed to save book:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to save book. Please try again.",
          icon: "error",
        });
      });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {initialBook ? "Edit Book" : "Add New Book"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={book.title}
            onChange={handleChange}
            placeholder="Enter book title"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Author</label>
          <input
            type="text"
            name="author"
            value={book.author}
            onChange={handleChange}
            placeholder="Enter book author"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={book.category}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Choose A Category</option>
            <option value="business">Business</option>
            <option value="technology">Technology</option>
            <option value="fiction">Fiction</option>
            <option value="horror">Horror</option>
            <option value="adventure">Adventure</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={book.price}
            onChange={handleChange}
            placeholder="Enter book price"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBook;