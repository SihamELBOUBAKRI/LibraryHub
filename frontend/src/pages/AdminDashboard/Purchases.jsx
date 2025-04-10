import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { fetchTransactions, deleteTransaction, updateTransaction, addTransaction } from "../../features/transactions/transactionsSlice";
import { fetchPurchases, deletePurchase, updatePurchase, addPurchase } from "../../features/purchases/purchasesSlice";
import { fetchOrders, deleteOrder, updateOrder, createOrder } from "../../features/orders/orderSlice";
import Select from 'react-select';
import "../AdminDashboard/Purchases.css";

const Purchases = () => {
  const dispatch = useDispatch();
  const [selectedSection, setSelectedSection] = useState('purchases');
  const [editItem, setEditItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');

  const { transactions = [], loading: transactionLoading } = useSelector((state) => state.transactions);
  const { purchases = [], loading: purchaseLoading } = useSelector((state) => state.purchases);
  const { orders = [], loading: orderLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchPurchases());
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setEditItem(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      switch(selectedSection) {
        case 'transactions': dispatch(deleteTransaction(id)); break;
        case 'purchases': dispatch(deletePurchase(id)); break;
        case 'orders': dispatch(deleteOrder(id)); break;
        default: break;
      }
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditItem(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (editItem) {
      switch(selectedSection) {
        case 'transactions': 
          dispatch(updateTransaction({ id: editItem.id, ...formData }));
          break;
        case 'purchases':
          dispatch(updatePurchase({ id: editItem.id, ...formData }));
          break;
        case 'orders':
          dispatch(updateOrder({ id: editItem.id, ...formData }));
          break;
        default: break;
      }
    } else {
      switch(selectedSection) {
        case 'transactions': dispatch(addTransaction(formData)); break;
        case 'purchases': dispatch(addPurchase(formData)); break;
        case 'orders': dispatch(createOrder(formData)); break;
        default: break;
      }
    }
    
    setIsModalOpen(false);
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-default';
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'paid':
        return 'status-completed';
      case 'pending':
      case 'processing':
        return 'status-pending';
      case 'failed':
      case 'cancelled':
        return 'status-failed';
      default:
        return 'status-default';
    }
  };

  const renderModalContent = () => {
    switch(selectedSection) {
      case 'transactions':
        return (
          <>
            <div className="form-group">
              <label>Amount</label>
              <input 
                type="number" 
                name="amount" 
                value={formData.amount || ''} 
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select 
                name="payment_method" 
                value={formData.payment_method || ''} 
                onChange={handleInputChange}
                required
              >
                <option value="">Select...</option>
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Status</label>
              <select 
                name="payment_status" 
                value={formData.payment_status || ''} 
                onChange={handleInputChange}
                required
              >
                <option value="">Select...</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </>
        );
      
      case 'purchases':
        return (
          <>
            <div className="form-group">
              <label>Book ID</label>
              <input 
                type="text" 
                name="book_id" 
                value={formData.book_id || ''} 
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input 
                type="number" 
                name="quantity" 
                value={formData.quantity || ''} 
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Price Per Unit</label>
              <input 
                type="number" 
                name="price_per_unit" 
                value={formData.price_per_unit || ''} 
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>Payment Status</label>
              <select 
                name="payment_status" 
                value={formData.payment_status || ''} 
                onChange={handleInputChange}
                required
              >
                <option value="">Select...</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </>
        );
      
      case 'orders':
        return (
          <>
            <div className="form-group">
              <label>Shipping Address</label>
              <input 
                type="text" 
                name="shipping_address" 
                value={formData.shipping_address || ''} 
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select 
                name="status" 
                value={formData.status || ''} 
                onChange={handleInputChange}
                required
              >
                <option value="">Select...</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select 
                name="payment_method" 
                value={formData.payment_method || ''} 
                onChange={handleInputChange}
                required
              >
                <option value="">Select...</option>
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
            {formData.payment_method === 'Credit Card' && (
              <>
                <div className="form-group">
                  <label>Card Holder Name</label>
                  <input 
                    type="text" 
                    name="card_holder_name" 
                    value={formData.card_holder_name || ''} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last 4 Digits</label>
                  <input 
                    type="text" 
                    name="card_last_four" 
                    value={formData.card_last_four || ''} 
                    onChange={handleInputChange}
                    maxLength="4"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expiration Date</label>
                  <input 
                    type="text" 
                    name="expiration_date" 
                    value={formData.expiration_date || ''} 
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    required
                  />
                </div>
              </>
            )}
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="purchases-container">
      {/* Section Boxes */}
      <div className="purchases-top">
        <div 
          className={`purchases-square ${selectedSection === "transactions" ? "active" : ""}`} 
          onClick={() => handleSectionClick("transactions")}
        >
          <h3>Transactions</h3>
          {transactionLoading ? <p>Loading...</p> : <p>{transactions.length} Transactions</p>}
        </div>
        <div 
          className={`purchases-square ${selectedSection === "purchases" ? "active" : ""}`} 
          onClick={() => handleSectionClick("purchases")}
        >
          <h3>Purchases</h3>
          {purchaseLoading ? <p>Loading...</p> : <p>{purchases.length} Purchases</p>}
        </div>
        <div 
          className={`purchases-square ${selectedSection === "orders" ? "active" : ""}`} 
          onClick={() => handleSectionClick("orders")}
        >
          <h3>Orders</h3>
          {orderLoading ? <p>Loading...</p> : <p>{orders.length} Orders</p>}
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="m-overlay">
          <div className="m-content">
            <div className="m-header">
              <h3>{editItem ? "Edit" : "Add New"} {selectedSection.slice(0, -1)}</h3>
              <button className="close-m" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="m-body">
              <form onSubmit={handleFormSubmit}>
                {renderModalContent()}
                <div className="m-footer">
                  <button type="submit" className="save">
                    {editItem ? "Update" : "Save"}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Display Table Based on Selection */}
      <div className="table-section">
        <div className="table-header">
          <h2>{selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}</h2>
          <button className="add-btn" onClick={handleAddNew}>
            <FontAwesomeIcon icon={faPlus} /> Add New
          </button>
        </div>

        {/* Transactions Table */}
        {selectedSection === "transactions" && (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>${transaction.amount}</td>
                    <td>{transaction.payment_method}</td>
                    <td className={getStatusClass(transaction.payment_status)}>
                      {transaction.payment_status}
                    </td>
                    <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                    <td className="action-buttons">
                      <button 
                        onClick={() => handleEdit(transaction)} 
                        className="edit-btn"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        onClick={() => handleDelete(transaction.id)} 
                        className="delete-btn"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Purchases Table */}
        {selectedSection === "purchases" && (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Book ID</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>{purchase.id}</td>
                    <td>{purchase.book_id}</td>
                    <td>${purchase.price_per_unit}</td>
                    <td>{purchase.quantity}</td>
                    <td>${purchase.total_price}</td>
                    <td>{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                    <td className={getStatusClass(purchase.payment_status)}>
                      {purchase.payment_status}
                    </td>
                    <td className="action-buttons">
                      <button 
                        onClick={() => handleEdit(purchase)} 
                        className="edit-btn"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        onClick={() => handleDelete(purchase.id)} 
                        className="delete-btn"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders Table */}
        {selectedSection === "orders" && (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.user?.name || order.user_id}</td>
                    <td>${order.total_price}</td>
                    <td>{order.payment_method}</td>
                    <td className={getStatusClass(order.status)}>
                      {order.status}
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="action-buttons">
                      <button 
                        onClick={() => handleEdit(order)} 
                        className="edit-btn"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        onClick={() => handleDelete(order.id)} 
                        className="delete-btn"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchases;