import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOverdues } from "../../features/overdues/overduesSlice";
import { fetchUserActiveRentals } from "../../features/active_rentals/active_rentalsSlice";
import { fetchReservationsByUser } from "../../features/reservations/bookReservationSlice";
import "./Rental.css";

const Rental = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('overdues');

  const userId = useSelector((state) => state.auth.user?.id);
  const { userOverdues: overdues = [], loading: overdueLoading } = useSelector(
    (state) => state.Overdues || {}
  );
  
  const { userRentals: active_rentals = [], loading: activeRentalsLoading } = useSelector(
    (state) => state.activeRentals || {}
  );
  
  const { userReservations = [], loading: reservationsLoading } = useSelector(
    (state) =>state.reservations || {}
  );
  
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserOverdues(userId));
      dispatch(fetchUserActiveRentals(userId));
      dispatch(fetchReservationsByUser(userId));
      
    }
  }, [dispatch, userId]);

  return (
    <div className="rental-container">
      <div className="rental-top">
        <div 
          className={`purchases-square ${activeTab === "overdues" ? "active" : ""}`}
          onClick={() => setActiveTab("overdues")}
        >
          <h3>Overdues</h3>
          <p>{overdues?.length || 0} Total</p>
        </div>
        <div 
          className={`purchases-square ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          <h3>Active Rentals</h3>
          <p>{active_rentals?.length || 0} Total</p>
        </div>
        <div 
          className={`purchases-square ${activeTab === "reservations" ? "active" : ""}`}
          onClick={() => setActiveTab("reservations")}
        >
          <h3>Reservations</h3>
          <p>{userReservations?.length || 0} Total</p>
        </div>
      </div>

      {activeTab === "overdues" && (
        <div>
          <h2>Overdue Rentals</h2>
          {overdueLoading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Book</th>
                  <th>Book Title</th>
                  <th>Rental Date</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Fine Amount</th>
                </tr>
              </thead>
              <tbody>
                {overdues.map((overdue) => (
                  <tr key={overdue.id} className="overdue-row">
                    <td>{overdue.id}</td>
                    <td>
                      <img 
                        src={`http://127.0.0.1:8000/storage/BookImages/${overdue.book.image}`} 
                        alt={overdue.book.title} 
                      />
                    </td>
                    <td>{overdue.book.title}</td>
                    <td>{new Date(overdue.rental_date).toLocaleDateString()}</td>
                    <td>{new Date(overdue.due_date).toLocaleDateString()}</td>
                    <td>
                      {Math.floor((new Date() - new Date(overdue.due_date)) / (1000 * 60 * 60 * 24))}
                    </td>
                    <td>${overdue.fine_amount || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "active" && (
        <div>
          <h2>Active Rentals</h2>
          {activeRentalsLoading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Book</th>
                  <th>Book Title</th>
                  <th>Rental Date</th>
                  <th>Due Date</th>
                  <th>Days Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {active_rentals.map((rental) => (
                  <tr key={rental.id}>
                    <td>{rental.id}</td>
                    <td>
                      <img 
                        src={`http://127.0.0.1:8000/storage/BookImages/${rental.book.image}`} 
                        alt={rental.book.title} 
                      />
                    </td>
                    <td>{rental.book.title}</td>
                    <td>{new Date(rental.rental_date).toLocaleDateString()}</td>
                    <td>{new Date(rental.due_date).toLocaleDateString()}</td>
                    <td>
                      {Math.floor((new Date(rental.due_date) - new Date()) / (1000 * 60 * 60 * 24))}
                    </td>
                    <td className={`status-${rental.status.toLowerCase()}`}>{rental.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "reservations" && (
        <div>
          <h2>Your Reservations</h2>
          {reservationsLoading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Book</th>
                  <th>Book Title</th>
                  <th>Reservation Date</th>
                  <th>Pickup Deadline</th>
                  <th>Days Remaining</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {userReservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>{reservation.id}</td>
                    <td>
                      <img 
                        src={`http://127.0.0.1:8000/storage/BookImages/${reservation.book.image}`} 
                        alt={reservation.book.title} 
                      />
                    </td>
                    <td>{reservation.book.title}</td>
                    <td>{new Date(reservation.created_at).toLocaleDateString()}</td>
                    <td>{new Date(reservation.pickup_deadline).toLocaleDateString()}</td>
                    <td>
                      {Math.floor((new Date(reservation.pickup_deadline) - new Date()) / (1000 * 60 * 60 * 24))}
                    </td>
                    <td className={`status-${reservation.status.toLowerCase()}`}>{reservation.status}</td>
                    <td>{reservation.payment_method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Rental;