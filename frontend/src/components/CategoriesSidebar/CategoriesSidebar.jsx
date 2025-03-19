// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchCategories } from "../../features/categories/categorySlice";
// import "./CategoriesSidebar.css";
// import { FaSearch, FaShoppingCart } from "react-icons/fa";

// const CategoriesSidebar = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const { categories, loading, error } = useSelector((state) => state.categories);

//   useEffect(() => {
//     dispatch(fetchCategories());
//   }, [dispatch]);

//   const handleSearch = (e) => {
//     e.preventDefault(); // Prevent default form submission behavior
  
//     // Use the latest input value directly instead of relying on state
//     const query = e.target.elements.search.value.trim(); 
//     if (query) {
//       navigate(`/books?search=${encodeURIComponent(query)}`);
//     }
//   };

//   if (loading) return <div>Loading categories...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className="categories-sidebar">
//       <form onSubmit={handleSearch} className="search-bar">
//         <FaSearch className="search-icon" />
//         <input
//           type="text"
//           name="search" // Ensure it has a name for form handling
//           placeholder="Search for books..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)} // Only update state here
//         />
//         <button type="submit">Search</button>
//       </form>

//       <div className="categories-list">
//         <ul>
//           <li>
//             <Link to="/books" className="category-link">
//               <img src="/images/all.png" alt="All" />
//               <span>All</span>
//             </Link>
//           </li>
//           {categories.map((category) => (
//             <li key={category.id}>
//               <Link to={`/books?category=${encodeURIComponent(category.name)}`} className="category-link">
//                 <img src={`/images/${category.name.toLowerCase()}.png`} alt={category.name} />
//                 <span>{category.name}</span>
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default CategoriesSidebar;
