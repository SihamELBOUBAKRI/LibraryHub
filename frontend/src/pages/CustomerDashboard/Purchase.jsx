import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserPurchases } from "../../features/purchases/purchasesSlice";
import { fetchUserTransactions } from "../../features/transactions/transactionsSlice";
import { fetchUserOrders } from "../../features/orders/orderSlice";
import "./Purchase.css";

const Purchase = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('purchases');

  const userId = useSelector((state) => state.auth.user?.id);
  const { userPurchases, status: purchaseStatus } = useSelector((state) => state.purchases);
  const { userTransactions, loading: transactionLoading } = useSelector((state) => state.transactions);
  const { userOrders, loading: orderLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserPurchases(userId));
      dispatch(fetchUserTransactions(userId));
      dispatch(fetchUserOrders(userId));
    }
  }, [dispatch, userId]);

  return (
    <div className="purchase-container">
      <div className="purchases-top">
        <div 
          className={`purchases-square ${activeTab === "purchases" ? "active" : ""}`}
          onClick={() => setActiveTab("purchases")}
        >
          <h3>Purchases</h3>
          <p>{userPurchases.length} Total</p>
        </div>
        <div 
          className={`purchases-square ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <h3>Orders</h3>
          <p>{userOrders.length} Total</p>
        </div>
        <div 
          className={`purchases-square ${activeTab === "transactions" ? "active" : ""}`}
          onClick={() => setActiveTab("transactions")}
        >
          <h3>Transactions</h3>
          <p>{userTransactions.length} Total</p>
        </div>
      </div>

      {activeTab === "purchases" && (
        <div>
          <h2>Purchases</h2>
          {purchaseStatus === "loading" ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>book</th>
                  <th>Book title</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {userPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>{purchase.id}</td>
                    <td><img src={`http://127.0.0.1:8000/storage/BookImages/${purchase.book.image}`} alt="book" /></td>
                    <td>{purchase.book.title}</td>
                    <td>{purchase.price_per_unit}</td>
                    <td>{purchase.quantity}</td>
                    <td>{purchase.total_price}</td>
                    <td>{purchase.payment_method}</td>
                    <td>{purchase.purchase_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div>
          <h2>Orders</h2>
          {orderLoading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Book</th>
                  <th>Book Title</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>shipping_address</th>
                  <th>Notes</th>
                  <th>Created</th>
                  <th>Delivery</th>
                  <th>Transaction</th>
                </tr>
              </thead>
              <tbody>
                {userOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>

                    {order.books.map(book => (
                    <td key={book.id}>
                      <img 
                        src={`http://127.0.0.1:8000/storage/BookImages/${book.image}`} 
                        alt={book.title} 
                      />
                    </td>
                  ))}      
                  {order.books.map(book => (
                    <td key={book.id}>{book.title}</td>
                  ))}              
                    <td>{order.book_price}</td>
                    <td>{order.quantity}</td>
                    <td>{order.total_price}</td>
                    <td>{order.payment_method}</td>
                    <td className={`status-${order.payment_status.toLowerCase()}`}>{order.payment_status}</td>
                    <td>{order.shipping_address}</td>
                    <td>{order.notes}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td>{order.expected_delivery_date}</td>
                    <td>{order.transaction_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "transactions" && (
        <div>
          <h2>Transactions</h2>
          {transactionLoading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Order</th>
                  <th>Membership</th>
                </tr>
              </thead>
              <tbody>
                {userTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>${transaction.amount}</td>
                    <td>{transaction.payment_method}</td>
                    <td className={`status-${transaction.payment_status.toLowerCase()}`}>{transaction.payment_status}</td>
                    <td>{transaction.transaction_type}</td>
                    <td>{transaction.order_id ?? "X"}</td>
                    <td>{transaction.membership_card_id ?? "X"}</td>
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

export default Purchase;
