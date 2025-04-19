import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { 
  fetchTransactions, 
  deleteTransaction, 
  updateTransaction, 
  addTransaction,
  updateTransactionStatus 
} from "../../features/transactions/transactionsSlice";
import { fetchPurchases, deletePurchase, updatePurchase, addPurchase } from "../../features/purchases/purchasesSlice";
import { fetchOrders, deleteOrder, updateOrder, updateOrderStatus } from "../../features/orders/orderSlice";
import { fetchBooksToSell } from "../../features/book_to_sell/book_to_sellSlice";
import { fetchUsers } from "../../features/users/userSlice";
import Select from 'react-select';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../AdminDashboard/Purchases.css";

const Purchases = () => {
  const dispatch = useDispatch();
  const [selectedSection, setSelectedSection] = useState('purchases');
  const [editItem, setEditItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUpdatingId, setCurrentUpdatingId] = useState(null);

  // Redux state selectors
  const { 
    transactions = [], 
    loading: transactionLoading, 
    statusUpdateLoading,
    error: transactionError
  } = useSelector((state) => state.transactions);
  
  const { purchases = [], loading: purchaseLoading, error: purchaseError } = useSelector((state) => state.purchases);
  const { orders = [], loading: orderLoading, error: orderError } = useSelector((state) => state.orders);
  const { books = [], loading: booksLoading } = useSelector((state) => state.book_to_sell);
  const { users = [], loading: usersLoading } = useSelector((state) => state.users);
  const currentUser = useSelector((state) => state.auth.user);

  // Show toast notifications for errors
  useEffect(() => {
    if (transactionError) {
      toast.error(transactionError);
    }
    if (purchaseError) {
      toast.error(purchaseError);
    }
    if (orderError) {
      toast.error(orderError);
    }
  }, [transactionError, purchaseError, orderError]);

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchPurchases());
    dispatch(fetchOrders());
    dispatch(fetchBooksToSell());
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchTerm.toLowerCase()) ||
    (order.transaction_id && order.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setEditItem(null);
    setIsModalOpen(false);
    setSearchTerm('');
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        let action;
        switch(selectedSection) {
          case 'transactions': 
            action = await dispatch(deleteTransaction(id)).unwrap();
            break;
          case 'purchases': 
            action = await dispatch(deletePurchase(id)).unwrap();
            break;
          case 'orders': 
            action = await dispatch(deleteOrder(id)).unwrap();
            break;
          default: break;
        }
        toast.success(`${selectedSection.slice(0, -1)} deleted successfully!`);
      } catch (error) {
        toast.error(`Failed to delete: ${error}`);
      }
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    
    const user = users.find(u => u.id === item.user_id);
    
    // Prepare the initial form data based on the selected section
    let initialFormData = {
      ...item,
      user_id: user?.id,
    };
  
    if (selectedSection === 'transactions') {
      initialFormData = {
        ...initialFormData,
        amount: item.amount,
        payment_method: item.payment_method,
        payment_status: item.payment_status,
        transaction_type: item.transaction_type,
        ...(item.order_id && { order_id: item.order_id }),
        ...(item.membership_card_id && { membership_card_id: item.membership_card_id })
      };
      
      if (item.order_id) {
        const order = orders.find(o => o.id === item.order_id);
        if (order) {
          initialFormData.order_id = order.id
        }
      }
    }
    
    if (item.book_id) {
      const book = books.find(b => b.id === item.book_id);
      if (book) {
        initialFormData.book_id = book.id
      }
    }
    
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleTransactionStatusChange = async (transactionId, newStatus) => {
    if (window.confirm(`Are you sure you want to update status to ${newStatus}?`)) {
      setCurrentUpdatingId(transactionId);
      try {
        await dispatch(updateTransactionStatus({ 
          id: transactionId, 
          payment_status: newStatus 
        })).unwrap();
        toast.success('Transaction status updated successfully!');
      } catch (error) {
        toast.error(`Failed to update status: ${error}`);
      } finally {
        setCurrentUpdatingId(null);
      }
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus, paymentStatus = null) => {
    if (window.confirm(`Are you sure you want to update status to ${newStatus}?`)) {
      try {
        await dispatch(
          updateOrderStatus({
            id: orderId,
            status: newStatus,
            payment_status: paymentStatus,
          })
        ).unwrap();
        toast.success("Order status updated successfully!");
      } catch (error) {
        toast.error(`Failed to update status: ${error}`);
      }
    }
  };

  const handleAddNew = () => {
    setEditItem(null);
    const defaults = {
      purchases: {
        user_id: null,
        book_id: null,
        quantity: 1,
        price_per_unit: 0,
        total_price: 0,
        purchase_date: new Date().toISOString().split('T')[0],
        payment_method: 'Credit Card',
        payment_status: 'pending'
      },
      transactions: {
        user_id: currentUser?.id || '',
        amount: 0,
        payment_method: 'Credit Card',
        transaction_type: 'Order',
        payment_status: 'Pending',
        order_id: null,
        membership_card_id: null
      },
      orders: {
        user_id: null,
        book_id: null,
        quantity: 1,
        shipping_address: '',
        payment_method: 'Credit Card',
        status: 'Pending'
      }
    };
    setFormData(defaults[selectedSection] || {});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      ...(name === 'quantity' || name === 'price_per_unit') && selectedSection === 'purchases' ? {
        total_price: (name === 'quantity' ? value * (prev.price_per_unit || 0) : (prev.quantity || 0) * value)
      } : {}
    }));
  };

  const handleUserSelect = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      user_id: selectedOption.value
    }));
  };

  const handleBookSelect = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      book_id: selectedOption.value
    }));
  };

  const handleOrderSelect = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      order_id: selectedOption.value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      if (editItem) {
        // For editing items
        if (selectedSection === 'transactions') {
          // Create object with only changed fields
          const changedFields = {};
          
          // Check each field for changes
          if (formData.amount !== editItem.amount) changedFields.amount = formData.amount;
          if (formData.payment_method !== editItem.payment_method) changedFields.payment_method = formData.payment_method;
          if (formData.payment_status !== editItem.payment_status) changedFields.payment_status = formData.payment_status;
          if (formData.transaction_type !== editItem.transaction_type) changedFields.transaction_type = formData.transaction_type;
          if (formData.user_id !== editItem.user_id) changedFields.user_id = formData.user_id;
          
          // Handle type-specific fields
          if (formData.transaction_type === 'Order' && formData.order_id !== editItem.order_id) {
            changedFields.order_id = formData.order_id;
          }
          if (formData.transaction_type === 'Membership' && formData.membership_card_id !== editItem.membership_card_id) {
            changedFields.membership_card_id = formData.membership_card_id;
          }
          
          if (Object.keys(changedFields).length === 0) {
            toast.info("No changes detected");
            setIsModalOpen(false);
            return;
          }
          
          result = await dispatch(updateTransaction({ 
            id: editItem.id, 
            ...changedFields 
          })).unwrap();
          toast.success('Transaction updated successfully!');
        } else if (selectedSection === 'purchases') {
          // Create object with only changed fields for purchases
          const changedFields = {};
          
          // Check each field for changes
          if (formData.user_id !== editItem.user_id) changedFields.user_id = formData.user_id;
          if (formData.book_id !== editItem.book_id) changedFields.book_id = formData.book_id;
          if (formData.quantity !== editItem.quantity) changedFields.quantity = formData.quantity;
          if (formData.price_per_unit !== editItem.price_per_unit) changedFields.price_per_unit = formData.price_per_unit;
          if (formData.purchase_date !== editItem.purchase_date) changedFields.purchase_date = formData.purchase_date;
          if (formData.payment_method !== editItem.payment_method) changedFields.payment_method = formData.payment_method;
          if (formData.payment_status !== editItem.payment_status) changedFields.payment_status = formData.payment_status;
          
          // Recalculate total price if quantity or price_per_unit changed
          if (changedFields.quantity || changedFields.price_per_unit) {
            const newQuantity = changedFields.quantity !== undefined ? changedFields.quantity : editItem.quantity;
            const newPrice = changedFields.price_per_unit !== undefined ? changedFields.price_per_unit : editItem.price_per_unit;
            changedFields.total_price = newQuantity * newPrice;
          }
          
          if (Object.keys(changedFields).length === 0) {
            toast.info("No changes detected");
            setIsModalOpen(false);
            return;
          }
          
          result = await dispatch(updatePurchase({ 
            id: editItem.id, 
            ...changedFields 
          })).unwrap();
          toast.success('Purchase updated successfully!');
        } else if (selectedSection === 'orders') {
          // Create object with only changed fields for orders
          const changedFields = {};
          
          // Check each field for changes
          if (formData.user_id !== editItem.user_id) changedFields.user_id = formData.user_id;
          if (formData.book_id !== editItem.book_id) changedFields.book_id = formData.book_id;
          if (formData.quantity !== editItem.quantity) changedFields.quantity = formData.quantity;
          if (formData.shipping_address !== editItem.shipping_address) changedFields.shipping_address = formData.shipping_address;
          if (formData.status !== editItem.status) changedFields.status = formData.status;
          if (formData.payment_method !== editItem.payment_method) changedFields.payment_method = formData.payment_method;
          
          if (Object.keys(changedFields).length === 0) {
            toast.info("No changes detected");
            setIsModalOpen(false);
            return;
          }
          
          result = await dispatch(updateOrder({ 
            id: editItem.id, 
            ...changedFields 
          })).unwrap();
          toast.success('Order updated successfully!');
        }
      } else {
        // For adding new items
        const submissionData = {
          ...formData,
          user_id: formData.user_id?.value || formData.user_id,
          book_id: formData.book_id?.value || formData.book_id,
          ...(selectedSection === 'purchases' && {
            total_price: formData.price_per_unit * formData.quantity
          })
        };

        if (selectedSection === 'transactions') {
          const transactionData = {
            user_id: submissionData.user_id,
            amount: submissionData.amount,
            payment_method: submissionData.payment_method,
            transaction_type: submissionData.transaction_type,
            payment_status: submissionData.payment_status || 'Pending',
            transaction_id: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
            ...(submissionData.transaction_type === 'Order' && { 
              order_id: submissionData.order_id 
            }),
            ...(submissionData.transaction_type === 'Membership' && { 
              membership_card_id: submissionData.membership_card_id 
            })
          };

          result = await dispatch(addTransaction(transactionData)).unwrap();
        } else if (selectedSection === 'purchases') {
          result = await dispatch(addPurchase(submissionData)).unwrap();
        }
        toast.success(`${selectedSection.slice(0, -1)} added successfully!`);
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(`Operation failed: ${error.message || error}`);
      console.error("Error details:", error);
    }
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

  const userOptions = users.map(user => ({
    value: user.id,
    label: `${user.name} (ID: ${user.id})`
  }));

  const bookOptions = books.map(book => ({
    value: book.id,
    label: `${book.title} (ID: ${book.id})`
  }));

  const orderOptions = orders.map(order => ({
    value: order.id,
    label: `Order #${order.id} ($${order.total_price})`
  }));

  const renderModalContent = () => {
    switch(selectedSection) {
      case 'transactions':
        return (
          <>
            <div className="form-group">
              <label>User</label>
              <Select
                options={userOptions}
                value={userOptions.find(opt => opt.value === formData.user_id)}
                onChange={handleUserSelect}
                placeholder="Search user..."
                isSearchable
                isLoading={usersLoading}
                required
              />
            </div>
            <div className="form-group">
              <label>Amount ($)</label>
              <input 
                type="number" 
                name="amount" 
                value={formData.amount || ''} 
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required={!editItem}
              />
            </div>
            <div className="form-group">
              <label>Transaction Type</label>
              <select 
                name="transaction_type" 
                value={formData.transaction_type || ''} 
                onChange={handleInputChange}
                required
              >
                <option value="">Select type...</option>
                <option value="Order">Order</option>
                <option value="Membership">Membership</option>
              </select>
            </div>
            
            {formData.transaction_type === 'Order' && (
              <div className="form-group">
                <label>Order</label>
                <Select
                  options={orderOptions}
                  value={orderOptions.find(opt => opt.value === formData.order_id)}
                  onChange={handleOrderSelect}
                  placeholder="Select order..."
                  isSearchable
                  required={!editItem}
                />
              </div>
            )}
            
            {formData.transaction_type === 'Membership' && (
              <div className="form-group">
                <label>Membership Card ID</label>
                <input
                  type="text"
                  name="membership_card_id"
                  value={formData.membership_card_id || ''}
                  onChange={handleInputChange}
                  placeholder="Enter membership card ID"
                  required={!editItem}
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Payment Method</label>
              <select 
                name="payment_method" 
                value={formData.payment_method || ''} 
                onChange={handleInputChange}
                required
              >
                <option value="">Select method...</option>
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
                <option value="">Select status...</option>
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
              <label>User</label>
              <Select
                options={userOptions}
                value={userOptions.find(opt => opt.value === formData.user_id)}
                onChange={handleUserSelect}
                placeholder="Search user..."
                isSearchable
                isLoading={usersLoading}
                required
              />
            </div>
            <div className="form-group">
              <label>Book</label>
              <Select
                options={bookOptions}
                value={bookOptions.find(opt => opt.value === formData.book_id)}
                onChange={handleBookSelect}
                placeholder="Search book..."
                isSearchable
                isLoading={booksLoading}
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
              <label>Price Per Unit ($)</label>
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
              <label>Total Price ($)</label>
              <input 
                type="number" 
                name="total_price" 
                value={formData.total_price || ''} 
                onChange={handleInputChange}
                min="0"
                step="0.01"
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Purchase Date</label>
              <input 
                type="date" 
                name="purchase_date" 
                value={formData.purchase_date || ''} 
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
                <option value="">Select method...</option>
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
                <option value="">Select status...</option>
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
              <label>User</label>
              <Select
                options={userOptions}
                value={userOptions.find(opt => opt.value === formData.user_id)}
                onChange={handleUserSelect}
                placeholder="Search user..."
                isSearchable
                isLoading={usersLoading}
                required
              />
            </div>
            <div className="form-group">
              <label>Book</label>
              <Select
                options={bookOptions}
                value={bookOptions.find(opt => opt.value === formData.book_id)}
                onChange={handleBookSelect}
                placeholder="Search book..."
                isSearchable
                isLoading={booksLoading}
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
                <option value="">Select status...</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Shipped">Shipped</option>
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
                <option value="">Select method...</option>
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
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
          {selectedSection !== 'orders' && (
            <button className="add-btn" onClick={handleAddNew}>
              <FontAwesomeIcon icon={faPlus} /> Add New
            </button>
          )}
          {selectedSection === 'orders' && (
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search by order code or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Transactions Table */}
        {selectedSection === "transactions" && (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>type</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const user = users.find(u => u.id === transaction.user_id);
                  return (
                    <tr key={transaction.id}>
                      <td>{transaction.id}</td>
                      <td>{user ? `${user.name} (ID: ${user.id})` : `User ${transaction.user_id}`}</td>
                      <td>${Number(transaction.amount).toFixed(2)}</td>
                      <td>{transaction.transaction_type}</td>
                      <td>{transaction.payment_method}</td>
                      <td className={getStatusClass(transaction.payment_status)}>
                        <select
                          value={transaction.payment_status}
                          onChange={(e) => handleTransactionStatusChange(transaction.id, e.target.value)}
                          className={`status-select ${getStatusClass(transaction.payment_status)}`}
                          disabled={statusUpdateLoading && currentUpdatingId === transaction.id}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Failed">Failed</option>
                        </select>
                        {statusUpdateLoading && currentUpdatingId === transaction.id && (
                          <FontAwesomeIcon icon={faSpinner} spin className="status-spinner" />
                        )}
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
                  );
                })}
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
                  <th>User</th>
                  <th>Book</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => {
                  const user = users.find(u => u.id === purchase.user_id);
                  const book = books.find(b => b.id === purchase.book_id);
                  return (
                    <tr key={purchase.id}>
                      <td>{purchase.id}</td>
                      <td>{user ? `${user.name} (ID: ${user.id})` : `User ${purchase.user_id}`}</td>
                      <td>{book ? `${book.title} (ID: ${book.id})` : `Book ${purchase.book_id}`}</td>
                      <td>${Number(purchase.price_per_unit).toFixed(2)}</td>
                      <td>{purchase.quantity}</td>
                      <td>${Number(purchase.total_price).toFixed(2)}</td>
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
                  );
                })}
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
                  <th>User</th>
                  <th>Book</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const user = users.find(u => u.id === order.user_id);
                  const book = books.find(b => b.id === order.book_id);
                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{user ? `${user.name} (ID: ${user.id})` : `User ${order.user_id}`}</td>
                      <td>{book ? `${book.title} (ID: ${book.id})` : `Book ${order.book_id}`}</td>
                      <td>{order.quantity}</td>
                      <td>${Number(order.total_price).toFixed(2)}</td>
                      <td>{order.payment_method}</td>
                      <td className={`status-cell ${getStatusClass(order.status)}`}>
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                          className={`status-select ${getStatusClass(order.status)}`}
                          aria-label={`Change order status from ${order.status}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchases;