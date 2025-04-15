import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { 
  fetchRentals, deleteRental, createRental, updateRental 
} from "../../features/rentals/rentalsSlice";
import { 
  fetchOverdues, deleteOverdue, updateOverdue 
} from "../../features/overdues/overduesSlice";
import { 
  fetchActiveRentals, deleteActiveRental, createActiveRental, updateActiveRental 
} from "../../features/active_rentals/active_rentalsSlice";
import { 
  fetchReservations, deleteReservation, updateReservation, createReservation 
} from "../../features/reservations/bookReservationSlice";
import { fetchMemberships } from "../../features/membership/membershipSlice";
import Select from 'react-select';
import "../AdminDashboard/Purchases.css";

const Rentals = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('rentals');
  const [editItem, setEditItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusChangeData, setStatusChangeData] = useState({
    reservationId: null,
    newStatus: ''
  });

  // Select data from Redux store
  const { rentals = [], loading: rentalsLoading } = useSelector((state) => state.rentals);
  const { overdues = [], loading: overduesLoading } = useSelector((state) => state.overdue || {});
  const { activeRentals = [], loading: activeRentalsLoading } = useSelector((state) => state.activeRentals || {});
  const { reservations = [], loading: reservationsLoading } = useSelector((state) => state.reservations || {});
  const { memberships = [], loading: membershipsLoading } = useSelector((state) => state.membership);


  // Filter memberships to only show users with membership cards
  const membersWithCards = memberships
    .filter(card => card.user)
    .map(card => ({
      ...card.user,
      card_number: card.card_number
    }));

  const membershipOptions = membersWithCards.map(user => ({
    value: user.id,
    label: `${user.name} (Card: ${user.card_number})`
  }));

  useEffect(() => {
    dispatch(fetchRentals());
    dispatch(fetchOverdues());
    dispatch(fetchActiveRentals());
    dispatch(fetchReservations());
    dispatch(fetchMemberships());
  }, [dispatch]);

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setEditItem(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      switch(selectedSection) {
        case 'rentals': dispatch(deleteRental(id)); break;
        case 'overdues': dispatch(deleteOverdue(id)); break;
        case 'activeRentals': dispatch(deleteActiveRental(id)); break;
        case 'reservations': dispatch(deleteReservation(id)); break;
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

  const handleUserChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev, 
      user_id: selectedOption.value,
      membership_card_number: membersWithCards.find(u => u.id === selectedOption.value)?.card_number || ''
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (editItem) {
      switch(selectedSection) {
        case 'rentals': 
          dispatch(updateRental({ id: editItem.id, ...formData }));
          break;
        case 'overdues':
          dispatch(updateOverdue({ id: editItem.id, ...formData }));
          break;
        case 'activeRentals':
          dispatch(updateActiveRental({ id: editItem.id, ...formData }));
          break;
        case 'reservations':
          dispatch(updateReservation({ id: editItem.id, updateData: formData }));
          break;
        default: break;
      }
    } else {
      switch(selectedSection) {
        case 'rentals': dispatch(createRental(formData)); break;
        case 'activeRentals': dispatch(createActiveRental(formData)); break;
        case 'reservations': dispatch(createReservation(formData)); break;
        default: break;
      }
    }
    
    setIsModalOpen(false);
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-default';
    switch (status.toLowerCase()) {
      case 'completed':
      case 'returned':
      case 'paid':
        return 'status-completed';
      case 'pending':
      case 'active':
        return 'status-pending';
      case 'failed':
      case 'overdue':
        return 'status-failed';
      default:
        return 'status-default';
    }
  };

  const renderModalContent = () => {
    switch(selectedSection) {
      case 'rentals':
        return (
          <>
            <div className="form-group">
              <label>Member</label>
              <Select
                options={membershipOptions}
                onChange={handleUserChange}
                value={membershipOptions.find(option => option.value === formData.user_id)}
                isSearchable
                placeholder="Search member..."
                isLoading={membershipsLoading}
                loadingMessage={() => "Loading members..."}
                noOptionsMessage={() => "No members found"}
              />
            </div>
            <div className="form-group">
              <label>Membership Card Number</label>
              <input
                type="text"
                name="membership_card_number"
                value={formData.membership_card_number || ''}
                onChange={handleInputChange}
                required
                disabled
              />
            </div>
            <div className="form-group">
              <label>Rental Days</label>
              <input 
                type="number" 
                name="rental_days" 
                value={formData.rental_days || ''} 
                onChange={handleInputChange}
                min="1"
                max="30"
                required
              />
            </div>
          </>
        );
      
      case 'overdues':
        return (
          <>
            <div className="form-group">
              <label>Member</label>
              <Select
                options={membershipOptions}
                onChange={handleUserChange}
                value={membershipOptions.find(option => option.value === formData.user_id)}
                isSearchable
                placeholder="Search member..."
                isLoading={membershipsLoading}
                loadingMessage={() => "Loading members..."}
                noOptionsMessage={() => "No members found"}
              />
            </div>
            <div className="form-group">
              <label>Membership Card Number</label>
              <input
                type="text"
                name="membership_card_number"
                value={formData.membership_card_number || ''}
                onChange={handleInputChange}
                required
                disabled
              />
            </div>
            <div className="form-group">
              <label>Days Overdue</label>
              <input 
                type="number" 
                name="days_overdue" 
                value={formData.days_overdue || ''} 
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Fine Amount</label>
              <input 
                type="number" 
                name="fine_amount" 
                value={formData.fine_amount || ''} 
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </>
        );
      
      case 'activeRentals':
        return (
          <>
            <div className="form-group">
              <label>Member</label>
              <Select
                options={membershipOptions}
                onChange={handleUserChange}
                value={membershipOptions.find(option => option.value === formData.user_id)}
                isSearchable
                placeholder="Search member..."
                isLoading={membershipsLoading}
                loadingMessage={() => "Loading members..."}
                noOptionsMessage={() => "No members found"}
              />
            </div>
            <div className="form-group">
              <label>Membership Card Number</label>
              <input
                type="text"
                name="membership_card_number"
                value={formData.membership_card_number || ''}
                onChange={handleInputChange}
                required
                disabled
              />
            </div>
            <div className="form-group">
              <label>Rental Days</label>
              <input 
                type="number" 
                name="rental_days" 
                value={formData.rental_days || ''} 
                onChange={handleInputChange}
                min="1"
                max="30"
                required
              />
            </div>
          </>
        );
      
      case 'reservations':
        return (
          <>
            <div className="form-group">
              <label>Member</label>
              <Select
                options={membershipOptions}
                onChange={handleUserChange}
                value={membershipOptions.find(option => option.value === formData.user_id)}
                isSearchable
                placeholder="Search member..."
                isLoading={membershipsLoading}
                loadingMessage={() => "Loading members..."}
                noOptionsMessage={() => "No members found"}
              />
            </div>
            <div className="form-group">
              <label>Membership Card Number</label>
              <input
                type="text"
                name="card_number"
                value={formData.card_number || ''}
                onChange={handleInputChange}
                required
                disabled
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
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
              </select>
            </div>
            {formData.payment_method === 'credit_card' && (
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
                  <label>Expiration (MM/YY)</label>
                  <input 
                    type="text" 
                    name="card_expiration" 
                    value={formData.card_expiration || ''} 
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
          className={`purchases-square ${selectedSection === "rentals" ? "active" : ""}`} 
          onClick={() => handleSectionClick("rentals")}
        >
          <h3>Rentals</h3>
          {rentalsLoading ? <p>Loading...</p> : <p>{rentals.length} Rentals</p>}
        </div>
        <div 
          className={`purchases-square ${selectedSection === "overdues" ? "active" : ""}`} 
          onClick={() => handleSectionClick("overdues")}
        >
          <h3>Overdues</h3>
          {overduesLoading ? <p>Loading...</p> : <p>{overdues.length} Overdues</p>}
        </div>
        <div 
          className={`purchases-square ${selectedSection === "activeRentals" ? "active" : ""}`} 
          onClick={() => handleSectionClick("activeRentals")}
        >
          <h3>Active Rentals</h3>
          {activeRentalsLoading ? <p>Loading...</p> : <p>{activeRentals.length} Active</p>}
        </div>
        <div 
          className={`purchases-square ${selectedSection === "reservations" ? "active" : ""}`} 
          onClick={() => handleSectionClick("reservations")}
        >
          <h3>Reservations</h3>
          {reservationsLoading ? <p>Loading...</p> : <p>{reservations.length} Reservations</p>}
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
          {/* Only show Add New button for sections that allow creation (not overdues) */}
          {selectedSection !== 'overdues' && (
            <button className="add-btn" onClick={handleAddNew}>
              <FontAwesomeIcon icon={faPlus} /> Add New
            </button>
          )}
        </div>

        {/* Rentals Table */}
        {selectedSection === "rentals" && (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Member</th>
                  <th>Card Number</th>
                  <th>Rental Date</th>
                  <th>Due Date</th>
                  <th>Returned Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((rental) => (
                  <tr key={rental.id}>
                    <td>{rental.id}</td>
                    <td>{rental.user?.name || 'N/A'}</td>
                    <td>{rental.active_rental.membership_card_number || 'N/A'}</td>
                    <td>{new Date(rental.rental_date).toLocaleDateString()}</td>
                    <td>{new Date(rental.due_date).toLocaleDateString()}</td>
                    <td>{rental.return_date ? new Date(rental.return_date).toLocaleDateString() : 'Not returned'}</td>
                    <td className="action-buttons">
                      <button 
                        onClick={() => handleEdit(rental)} 
                        className="edit-btn"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        onClick={() => handleDelete(rental.id)} 
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

        {/* Overdues Table */}
        {selectedSection === "overdues" && (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Member</th>
                  <th>Card Number</th>
                  <th>Days Overdue</th>
                  <th>Fine Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {overdues.map((overdue) => (
                  <tr key={overdue.id}>
                    <td>{overdue.id}</td>
                    <td>{overdue.user?.name || 'N/A'}</td>
                    <td>{overdue.membership_card_number || 'N/A'}</td>
                    <td>{overdue.days_overdue}</td>
                    <td>${overdue.fine_amount}</td>
                    <td className={getStatusClass(overdue.status)}>
                      {overdue.status || 'overdue'}
                    </td>
                    <td className="action-buttons">
                      <button 
                        onClick={() => handleEdit(overdue)} 
                        className="edit-btn"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        onClick={() => handleDelete(overdue.id)} 
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

        {/* Active Rentals Table */}
        {selectedSection === "activeRentals" && (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Member</th>
                  <th>Card Number</th>
                  <th>Rental Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeRentals.map((active) => (
                  <tr key={active.id}>
                    <td>{active.id}</td>
                    <td>{active.user?.name || 'N/A'}</td>
                    <td>{active.membership_card_number || 'N/A'}</td>
                    <td>{new Date(active.rental_date).toLocaleDateString()}</td>
                    <td>{new Date(active.due_date).toLocaleDateString()}</td>
                    <td className={getStatusClass(active.status)}>
                      {active.status || 'active'}
                    </td>
                    <td className="action-buttons">
                      <button 
                        onClick={() => handleEdit(active)} 
                        className="edit-btn"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        onClick={() => handleDelete(active.id)} 
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

        {/* Reservations Table */}
        {selectedSection === "reservations" && (
          <div className="table-responsive">
            <div className="filter-row">
              <div className="status-filter">
                <label>Filter by Status:</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="waiting">Waiting</option>
                  <option value="picked">Picked</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search by reservation code..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reservation Code</th>
                  <th>Member</th>
                  <th>Card Number</th>
                  <th>Reservation Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations
                  .filter(res => {
                    const statusMatch = statusFilter === 'all' || res.status === statusFilter;
                    const searchMatch = !searchTerm || 
                      (res.reservation_code?.toLowerCase().includes(searchTerm.toLowerCase()));
                    return statusMatch && searchMatch;
                  })
                  .map((reservation) => (
                    <tr key={reservation.id}>
                      <td>{reservation.id}</td>
                      <td>{reservation.reservation_code || 'N/A'}</td>
                      <td>{reservation.user?.name || 'N/A'}</td>
                      <td>{reservation.card_number || 'N/A'}</td>
                      <td>{new Date(reservation.created_at).toLocaleDateString()}</td>
                      <td>
                        {new Date(new Date(reservation.created_at).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </td>
                      <td className={getStatusClass(reservation.status)}>
                        <select
                          value={reservation.status}
                          onChange={(e) => setStatusChangeData({
                            reservationId: reservation.id,
                            newStatus: e.target.value
                          })}
                          onBlur={() => {
                            if (statusChangeData.reservationId === reservation.id) {
                              dispatch(updateReservation({
                                id: reservation.id,
                                updateData: { status: statusChangeData.newStatus }
                              }));
                              setStatusChangeData({ reservationId: null, newStatus: '' });
                            }
                          }}
                        >
                          <option value="waiting">Waiting</option>
                          <option value="picked">Picked</option>
                          <option value="expired">Expired</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="action-buttons">
                        <button 
                          onClick={() => handleEdit(reservation)} 
                          className="edit-btn"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          onClick={() => handleDelete(reservation.id)} 
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

export default Rentals;