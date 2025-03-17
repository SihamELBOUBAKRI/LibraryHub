import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import authReducer from './features/auth/authSlice';
import cartReducer from './features/cart/cartSlice';
import wishlistReducer from './features/wishlist/wishlistSlice';
import categoryReducer from './features/categories/categorySlice';
import usersReducerr from './features/users/userSlice';
import ordersReducer from './features/orders/orderSlice';
import authorsReducer from './features/authors/authorsSlice';
import book_to_rentReducer from './features/book_to_rent/book_to_rentSlice';
import book_to_sellReducer from './features/book_to_sell/book_to_sellSlice';
import membershipReducer from './features/membership/membershipSlice';
import overduesReducer from './features/overdues/overduesSlice';
import purchasesReducer from './features/purchases/purchasesSlice';
import rentalsReducer from './features/rentals/rentalsSlice';
import transactionsReducer from './features/transactions/transactionsSlice';
import active_rentalsReducer from './features/active_rentals/active_rentalsSlice';

// Configuring the Redux Store
const store = configureStore({
  reducer: {
    auth: authReducer, // Fixed typo: Changed `autt` to `auth`
    cart: cartReducer,
    wishlist: wishlistReducer,
    categories: categoryReducer,
    users: usersReducerr,
    orders: ordersReducer,
    authors: authorsReducer,
    book_to_rent: book_to_rentReducer,
    book_to_sell: book_to_sellReducer,
    membership: membershipReducer,
    overdues: overduesReducer,
    purchases: purchasesReducer,
    rentals: rentalsReducer,
    transactions: transactionsReducer,
    active_rentals: active_rentalsReducer,
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);