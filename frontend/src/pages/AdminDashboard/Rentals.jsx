import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { 
  fetchRentals, deleteRental, createRental, updateRental 
} from "../../features/rentals/rentalsSlice";
import { 
  fetchOverdues, deleteOverdue, updateOverdue 
} from "../../features/overdues/overduesSlice";
import { 
  fetchActiveRentals, deleteActiveRental, createActiveRental, 
  updateActiveRental, updateRentalStatus 
} from "../../features/active_rentals/active_rentalsSlice";
import { 
  fetchReservations, deleteReservation, updateReservation, createReservation 
} from "../../features/reservations/bookReservationSlice";
import { fetchMemberships } from "../../features/membership/membershipSlice";
import { fetchBooksToRent } from "../../features/book_to_rent/book_to_rentSlice";
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
  const { overdues = [], loading: overduesLoading } = useSelector((state) => state.overdues || {});
  const { activeRentals = [], loading: activeRentalsLoading } = useSelector((state) => state.activeRentals || {});
  const { reservations = [], loading: reservationsLoading } = useSelector((state) => state.reservations || {});
  const { memberships = [], loading: membershipsLoading } = useSelector((state) => state.membership);
  const { books = [], loading: booksLoading } = useSelector((state) => state.book_to_rent);

  // Prepare membership options for select
  const membershipOptions = memberships
    .filter(card => card.user)
    .map(card => ({
      value: card.id,
      label: `${card.user.name} (${card.card_number})`,
      user: card.user,
      card_number: card.card_number
    }));

  // Prepare book options for select
  const bookOptions = books.map(book => ({
    value: book.id,
    label: `${book.title} (ID: ${book.id})`,
    book
  }));

  // Prepare active rental options for select
  const activeRentalOptions = activeRentals.map(rental => ({
    value: rental.id,
    label: `#${rental.id} - ${rental.user?.name || 'N/A'} (${rental.book?.title || 'N/A'})`,
    rental
  }));

  // Get available books for new rentals
  const availableBookOptions = books
    .filter(book => book.availability_status === 'available')
    .map(book => ({
      value: book.id,
      label: `${book.title} (ID: ${book.id})`,
      book
    }));

  useEffect(() => {
    dispatch(fetchRentals());
    dispatch(fetchOverdues());
    dispatch(fetchActiveRentals());
    dispatch(fetchReservations());
    dispatch(fetchMemberships());
    dispatch(fetchBooksToRent());
  }, [dispatch]);

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setEditItem(null);
    setIsModalOpen(false);
    setStatusFilter('all');
    setSearchTerm('');
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      switch(selectedSection) {
        case 'rentals': 
          dispatch(deleteRental(id))
            .then(() => toast.success('Rental deleted successfully!'))
            .catch(error => toast.error('Failed to delete rental'));
          break;
        case 'overdues': 
          dispatch(deleteOverdue(id))
            .then(() => toast.success('Overdue record deleted successfully!'))
            .catch(error => toast.error('Failed to delete overdue record'));
          break;
        case 'activeRentals': 
          dispatch(deleteActiveRental(id))
            .then(() => toast.success('Active rental deleted successfully!'))
            .catch(error => toast.error('Failed to delete active rental'));
          break;
        case 'reservations': 
          dispatch(deleteReservation(id))
            .then(() => toast.success('Reservation deleted successfully!'))
            .catch(error => toast.error('Failed to delete reservation'));
          break;
        default: break;
      }
    }
  };

  // In handleEdit function:
const handleEdit = (item) => {
  setEditItem(item);
  setFormData({
    ...item,
    ...(selectedSection === 'activeRentals' && {
      user_id: item.user?.id || null,
      membership_card_number: item.membership_card_number || '',
      payment_method: item.payment_method || 'cash',
      card_holder_name: item.card_holder_name || '',
      card_last_four: item.card_last_four || '',
      card_expiration: item.card_expiration || '',
      // Format dates for input fields
      rental_date: item.rental_date ? item.rental_date.split('T')[0] : '',
      due_date: item.due_date ? item.due_date.split('T')[0] : ''
    }),
    ...(selectedSection === 'rentals' && {
      active_rental_id: item.active_rental_id || null
    })
  });
  setIsModalOpen(true);
};

  const handleAddNew = () => {
    setEditItem(null);
    const defaults = {
      rentals: {
        active_rental_id: null,
        book_id: null,
        user_id: null,
        rental_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        return_date: new Date().toISOString().split('T')[0],
        days_late: 0
      },
      overdues: {
        user_id: null,
        book_id: null,
        active_rental_id: null,
        days_overdue: 1,
        fine_amount: 5.00,
        penalty_paid: false,
        paid_date: null
      },
      activeRentals: {
        user_id: null,
        book_id: null,
        membership_card_number: '',
        payment_method: 'cash',
        card_holder_name: '',
        card_last_four: '',
        card_expiration: '',
        rental_days: 14,
        rental_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      },
      reservations: {
        user_id: null,
        book_id: null,
        card_number: '',
        payment_method: 'cash',
        card_holder_name: '',
        card_last_four: '',
        card_expiration: '',
        staff_notes: ''
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
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Automatically calculate days late when return date changes
      if (name === 'return_date' && selectedSection === 'rentals') {
        if (newData.return_date && newData.due_date) {
          const returnDate = new Date(newData.return_date);
          const dueDate = new Date(newData.due_date);
          const daysLate = Math.max(0, Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24)));
          newData.days_late = daysLate;
        } else {
          newData.days_late = 0;
        }
      }
      
      return newData;
    });
  };

  const handleUserChange = (selectedOption, isReservation = false) => {
    if (!selectedOption) return;
    
    if (isReservation) {
      setFormData(prev => ({
        ...prev,
        user_id: selectedOption.user.id,
        card_number: selectedOption.card_number
      }));
    } else {
      setFormData(prev => ({
        ...prev, 
        user_id: selectedOption.user.id,
        membership_card_number: selectedOption.card_number
      }));
    }
  };

  const handleBookChange = (selectedOption) => {
    if (selectedOption) {
      setFormData(prev => ({
        ...prev,
        book_id: selectedOption.value
      }));
    }
  };

  const handleActiveRentalChange = (selectedOption) => {
    if (selectedOption) {
      const rental = selectedOption.rental;
      setFormData(prev => ({
        ...prev,
        active_rental_id: rental.id,
        book_id: rental.book_id,
        user_id: rental.user_id,
        rental_date: rental.rental_date.split('T')[0],
        due_date: rental.due_date.split('T')[0],
        return_date: '',
        days_late: 0
      }));
    }
  };

  const handleStatusChange = async (rentalId, newStatus) => {
    try {
      await dispatch(updateRentalStatus({ id: rentalId, status: newStatus })).unwrap();
      toast.success('Status updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editItem) {
        const changedFields = {};
        const dateFields = ['rental_date', 'due_date']; // Add other date fields if needed

        Object.keys(formData).forEach(key => {
          let currentValue = formData[key];
          let originalValue = editItem[key];
          
          // Handle date comparisons
          if (dateFields.includes(key)) {
            currentValue = currentValue ? new Date(currentValue).toISOString() : '';
            originalValue = originalValue ? new Date(originalValue).toISOString() : '';
          }
          
          if (currentValue !== originalValue) {
            changedFields[key] = formData[key];
          }
        });
        switch(selectedSection) {
          case 'rentals': 
            // Always calculate days late based on current dates
            const currentReturnDate = new Date(formData.return_date);
            const currentDueDate = new Date(formData.due_date);
            const currentDaysLate = Math.max(0, Math.floor((currentReturnDate - currentDueDate) / (1000 * 60 * 60 * 24)));
            
            // Force include days_late in these cases:
            // 1. If return_date was changed
            // 2. If due_date was changed (which affects the calculation)
            // 3. If days_late was manually changed
            if (changedFields.return_date || changedFields.due_date || changedFields.days_late) {
              changedFields.days_late = currentDaysLate;
            }
            
            // Validate that return date isn't before rental date
            const rentalDate = new Date(formData.rental_date);
            if (currentReturnDate < rentalDate) {
              throw new Error('Return date cannot be before rental date');
            }
            
            await dispatch(updateRental({ 
              id: editItem.id, 
              ...changedFields 
            })).unwrap();
            toast.success('Rental updated successfully!');
            break;
            
          case 'overdues':
            await dispatch(updateOverdue({ 
              id: editItem.id, 
              ...changedFields 
            })).unwrap();
            toast.success('Overdue record updated successfully!');
            break;
            
            case 'activeRentals': 
            // Format dates for backend
            const formattedData = {
              ...changedFields,
              ...(changedFields.rental_date && { 
                rental_date: new Date(changedFields.rental_date).toISOString()
              }),
              ...(changedFields.due_date && { 
                due_date: new Date(changedFields.due_date).toISOString()
              })
            };
            // Calculate new due date if rental days changed
          if (changedFields.rental_days) {
            const rentalDate = changedFields.rental_date || formData.rental_date;
            formattedData.due_date = new Date(
              new Date(rentalDate).getTime() + 
              changedFields.rental_days * 24 * 60 * 60 * 1000
            ).toISOString();
          }
          await dispatch(updateActiveRental({
            id: editItem.id,
            ...formattedData
          })).unwrap();
          toast.success('Active rental updated successfully!');
          break;
            
          case 'reservations':
            await dispatch(updateReservation({ 
              id: editItem.id, 
              ...changedFields 
            })).unwrap();
            toast.success('Reservation updated successfully!');
            break;
            
          default: break;
        }
      } else {
        switch(selectedSection) {
          case 'rentals': 
            // Validate dates
            const returnDate = new Date(formData.return_date);
            const dueDate = new Date(formData.due_date);
            const rentalDate = new Date(formData.rental_date);
            
            if (returnDate < rentalDate) {
              throw new Error('Return date cannot be before rental date');
            }
            
            const daysLate = Math.max(0, Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24)));
            
            const rentalData = {
              active_rental_id: formData.active_rental_id,
              book_id: formData.book_id,
              user_id: formData.user_id,
              rental_date: formData.rental_date,
              due_date: formData.due_date,
              return_date: formData.return_date,
              days_late: daysLate
            };
  
            await dispatch(createRental(rentalData)).unwrap();
            toast.success('Rental created successfully!');
            break;
            
          case 'activeRentals': 
            const activeRentalData = {
              user_id: formData.user_id,
              book_id: formData.book_id,
              membership_card_number: formData.membership_card_number,
              payment_method: formData.payment_method,
              ...(formData.payment_method === 'credit_card' && {
                card_holder_name: formData.card_holder_name,
                card_last_four: formData.card_last_four,
                card_expiration: formData.card_expiration
              }),
              rental_days: formData.rental_days,
              rental_date: formData.rental_date,
              due_date: formData.due_date || new Date(
                new Date(formData.rental_date).getTime() + 
                formData.rental_days * 24 * 60 * 60 * 1000
              ).toISOString().split('T')[0],
              status: formData.status || 'active'
            };
            await dispatch(createActiveRental(activeRentalData)).unwrap();
            toast.success('Active rental created successfully!');
            break;
            
          case 'reservations': 
            // Validate credit card info if payment method is credit card
            if (formData.payment_method === 'credit_card') {
              if (!formData.card_holder_name || !formData.card_last_four || !formData.card_expiration) {
                throw new Error('Please fill all credit card details');
              }
            }
            
            const reservationData = {
              book_id: formData.book_id,
              card_number: formData.card_number,
              payment_method: formData.payment_method,
              staff_notes: formData.staff_notes || null,
              ...(formData.payment_method === 'credit_card' && {
                card_holder_name: formData.card_holder_name,
                card_last_four: formData.card_last_four,
                card_expiration: formData.card_expiration
              })
            };
            await dispatch(createReservation(reservationData)).unwrap();
            toast.success('Reservation created successfully!');
            break;
            
          default: break;
        }
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error(error.message || 'Failed to save data');
    }
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
      case 'waiting':
        return 'status-pending';
      case 'failed':
      case 'overdue':
      case 'expired':
      case 'cancelled':
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
            <label>Active Rental *</label>
            <Select
              options={activeRentalOptions.filter(rental => 
                !rentals.some(r => r.active_rental_id === rental.value)
              )}
              onChange={handleActiveRentalChange}
              value={activeRentalOptions.find(option => option.value === formData.active_rental_id)}
              isSearchable
              placeholder="Search active rental..."
              isLoading={activeRentalsLoading}
              loadingMessage={() => "Loading active rentals..."}
              noOptionsMessage={() => "No active rentals available"}
              required
            />
          </div>
          <div className="form-group">
            <label>Member</label>
            <input
              type="text"
              value={membershipOptions.find(opt => opt.user.id === formData.user_id)?.label || 'N/A'}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Book</label>
            <input
              type="text"
              value={bookOptions.find(opt => opt.value === formData.book_id)?.label || 'N/A'}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Rental Date</label>
            <input 
              type="text"
              value={formData.rental_date ? new Date(formData.rental_date).toLocaleDateString() : 'N/A'}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input 
              type="text"
              value={formData.due_date ? new Date(formData.due_date).toLocaleDateString() : 'N/A'}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Return Date *</label>
            <input 
              type="date" 
              name="return_date" 
              value={formData.return_date || ''} 
              onChange={handleInputChange}
              required
              min={formData.rental_date}
            />
            {formData.return_date && formData.due_date && (
              <div className={new Date(formData.return_date) > new Date(formData.due_date) ? "warning-text" : "info-text"}>
                {new Date(formData.return_date) > new Date(formData.due_date) 
                  ? `This return is ${formData.days_late} days late`
                  : 'This return is on time'}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Days Late *</label>
            <input 
              type="number" 
              name="days_late" 
              value={formData.days_late || 0} 
              onChange={handleInputChange}
              min="0"
              required
              readOnly
            />
          </div>
        </>
      );
      case 'overdues':
        return (
          <>
            <div className="form-group">
              <label>Member *</label>
              <Select
                options={membershipOptions}
                onChange={(option) => handleUserChange(option)}
                value={membershipOptions.find(option => option.user.id === formData.user_id)}
                isSearchable
                placeholder="Search member..."
                isLoading={membershipsLoading}
                loadingMessage={() => "Loading members..."}
                noOptionsMessage={() => "No members found"}
                required
              />
            </div>
            <div className="form-group">
              <label>Membership Card Number *</label>
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
              <label>Book *</label>
              <Select
                options={bookOptions}
                onChange={handleBookChange}
                value={bookOptions.find(option => option.value === formData.book_id)}
                isSearchable
                placeholder="Search book by title..."
                isLoading={booksLoading}
                loadingMessage={() => "Loading books..."}
                noOptionsMessage={() => "No books found"}
                required
              />
            </div>
            <div className="form-group">
              <label>Active Rental ID *</label>
              <Select
                options={activeRentalOptions}
                onChange={handleActiveRentalChange}
                value={activeRentalOptions.find(option => option.value === formData.active_rental_id)}
                isSearchable
                placeholder="Search active rental..."
                isLoading={activeRentalsLoading}
                loadingMessage={() => "Loading active rentals..."}
                noOptionsMessage={() => "No active rentals found"}
                required
              />
            </div>
            <div className="form-group">
              <label>Days Overdue *</label>
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
              <label>Fine Amount *</label>
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
              <label>Member *</label>
              <Select
                options={membershipOptions}
                onChange={(option) => handleUserChange(option)}
                value={membershipOptions.find(option => option.user.id === formData.user_id)}
                isSearchable
                placeholder="Search member..."
                isLoading={membershipsLoading}
                loadingMessage={() => "Loading members..."}
                noOptionsMessage={() => "No members found"}
                required={!editItem}
                isDisabled={!!editItem}
              />
            </div>
            <div className="form-group">
              <label>Membership Card Number *</label>
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
              <label>Book *</label>
              <Select
                options={editItem ? bookOptions : availableBookOptions}
                onChange={handleBookChange}
                value={bookOptions.find(option => option.value === formData.book_id)}
                isSearchable
                placeholder="Search book by title..."
                isLoading={booksLoading}
                loadingMessage={() => "Loading books..."}
                noOptionsMessage={() => "No books found"}
                required={!editItem}
                isDisabled={!!editItem}
              />
            </div>
            <div className="form-group">
              <label>Payment Method *</label>
              <select
                name="payment_method"
                value={formData.payment_method || 'cash'}
                onChange={handleInputChange}
                required
              >
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
              </select>
            </div>
            {formData.payment_method === 'credit_card' && (
              <>
                <div className="form-group">
                  <label>Card Holder Name *</label>
                  <input
                    type="text"
                    name="card_holder_name"
                    value={formData.card_holder_name || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last 4 Digits *</label>
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
                  <label>Expiration (MM/YY) *</label>
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
            <div className="form-group">
              <label>Status *</label>
              <select
                name="status"
                value={formData.status || 'active'}
                onChange={handleInputChange}
                required
              >
                <option value="active">Active</option>
                <option value="overdue">Overdue</option>
                <option value="returned">Returned</option>
              </select>
            </div>
            <div className="form-group">
              <label>Rental Days *</label>
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
            <div className="form-group">
              <label>Rental Date *</label>
              <input 
                type="date" 
                name="rental_date" 
                value={formData.rental_date || ''} 
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        );
      
      case 'reservations':
        return (
          <>
            <div className="form-group">
              <label>Member *</label>
              <Select
                options={membershipOptions}
                onChange={(option) => handleUserChange(option, true)}
                value={membershipOptions.find(option => 
                  option.user.id === formData.user_id
                )}
                isSearchable
                placeholder="Search member..."
                isLoading={membershipsLoading}
                loadingMessage={() => "Loading members..."}
                noOptionsMessage={() => "No members found"}
                required
              />
            </div>
            <div className="form-group">
              <label>Membership Card Number *</label>
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
              <label>Book *</label>
              <Select
                options={availableBookOptions}
                onChange={handleBookChange}
                value={bookOptions.find(option => option.value === formData.book_id)}
                isSearchable
                placeholder="Search book by title..."
                isLoading={booksLoading}
                loadingMessage={() => "Loading books..."}
                noOptionsMessage={() => "No books found"}
                required
              />
            </div>
            <div className="form-group">
              <label>Payment Method *</label>
              <select 
                name="payment_method" 
                value={formData.payment_method || 'cash'} 
                onChange={handleInputChange}
                required
              >
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
              </select>
            </div>
            {formData.payment_method === 'credit_card' && (
              <>
                <div className="form-group">
                  <label>Card Holder Name *</label>
                  <input 
                    type="text" 
                    name="card_holder_name" 
                    value={formData.card_holder_name || ''} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last 4 Digits *</label>
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
                  <label>Expiration (MM/YY) *</label>
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
            <div className="form-group">
              <label>Staff Notes</label>
              <textarea
                name="staff_notes"
                value={formData.staff_notes || ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="Optional notes about the reservation"
              />
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  // Filter functions for each section
  const filterItems = (items) => {
    if (!items) return [];
    
    return items.filter(item => {
      // Status filter
      const statusMatch = statusFilter === 'all' || 
        (item.status && item.status.toLowerCase() === statusFilter.toLowerCase());
      
      // Search term filter
      let searchMatch = true;
      if (searchTerm) {
        searchMatch = Object.values(item).some(value => {
          if (typeof value === 'object' && value !== null) {
            return Object.values(value).some(
              nestedValue => String(nestedValue).toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      }
      
      return statusMatch && searchMatch;
    });
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

        {/* Filter and Search Row */}
        <div className="filter-row">
          {selectedSection !== 'rentals' && (
            <div className="status-filter">
              <label>Filter by Status:</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                {selectedSection === 'activeRentals' && (
                  <>
                    <option value="active">Active</option>
                    <option value="overdue">Overdue</option>
                    <option value="returned">Returned</option>
                  </>
                )}
                {selectedSection === 'overdues' && (
                  <>
                    <option value="overdue">Overdue</option>
                    <option value="paid">Paid</option>
                  </>
                )}
                {selectedSection === 'reservations' && (
                  <>
                    <option value="waiting">Waiting</option>
                    <option value="picked">Picked</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </>
                )}
              </select>
            </div>
          )}
          
          <div className="search-bar">
            <input
              type="text"
              placeholder={`Search ${selectedSection}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Rentals Table */}
        {selectedSection === "rentals" && (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Member</th>
                  <th>Active Rental ID</th>
                  <th>Book</th>
                  <th>Rental Date</th>
                  <th>Due Date</th>
                  <th>Returned Date</th>
                  <th>Days Late</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterItems(rentals).map((rental) => (
                  <tr key={rental.id}>
                    <td>{rental.id}</td>
                    <td>{rental.user?.name || 'N/A'}</td>
                    <td>{rental.active_rental_id || 'N/A'}</td>
                    <td>{rental.book?.title || 'N/A'}</td>
                    <td>{new Date(rental.rental_date).toLocaleDateString()}</td>
                    <td>{new Date(rental.due_date).toLocaleDateString()}</td>
                    <td>{rental.return_date ? new Date(rental.return_date).toLocaleDateString() : 'Not returned'}</td>
                    <td>{rental.days_late}</td>
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
                  <th>Book</th>
                  <th>Active Rental ID</th>
                  <th>Days Overdue</th>
                  <th>Penalty Amount</th>
                  <th>Penalty Paid</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterItems(overdues).map((overdue) => (
                  <tr key={overdue.id}>
                    <td>{overdue.id}</td>
                    <td>{overdue.user?.name || 'N/A'}</td>
                    <td>{overdue.book?.title || 'N/A'}</td>
                    <td>{overdue.active_rental_id || 'N/A'}</td>
                    <td>{overdue.days_overdue}</td>
                    <td>${Number(overdue.penalty_amount)?.toFixed(2) || '0.00'}</td>
                    <td>{overdue.penalty_paid ? "Yes" : "No"}</td>
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
                  <th>Book</th>
                  <th>Payment Method</th>
                  <th>Rental Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterItems(activeRentals).map((active) => (
                  <tr key={active.id}>
                    <td>{active.id}</td>
                    <td>{active.user?.name || 'N/A'}</td>
                    <td>{active.membership_card_number || 'N/A'}</td>
                    <td>{active.book?.title || 'N/A'}</td>
                    <td>{active.payment_method || 'N/A'}</td>
                    <td>{new Date(active.rental_date).toLocaleDateString()}</td>
                    <td>{new Date(active.due_date).toLocaleDateString()}</td>
                    <td className={getStatusClass(active.status)}>
                      <select
                        value={active.status}
                        onChange={(e) => handleStatusChange(active.id, e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="overdue">Overdue</option>
                        <option value="returned">Returned</option>
                      </select>
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
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reservation Code</th>
                  <th>Member</th>
                  <th>Card Number</th>
                  <th>Book</th>
                  <th>Payment Method</th>
                  <th>Reservation Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterItems(reservations).map((reservation) => (
                  <tr key={reservation.id}>
                    <td>{reservation.id}</td>
                    <td>{reservation.reservation_code || 'N/A'}</td>
                    <td>{reservation.user?.name || 'N/A'}</td>
                    <td>{reservation.membership_card?.card_number || 'N/A'}</td>
                    <td>{reservation.book?.title || 'N/A'}</td>
                    <td>{reservation.payment_method || 'N/A'}</td>
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
                              status: statusChangeData.newStatus
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