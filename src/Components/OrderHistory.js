import React from "react";
import axios from "axios";
import { withRouter } from "react-router-dom";
import "./Styles/orderHistory.css";

const API = "http://localhost:8050";

class OrderHistory extends React.Component {
  constructor() {
    super();
    this.state = {
      orders: [],
      loading: true,
      error: "",
      expandedId: null,
    };
  }

  componentDidMount() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userStr = localStorage.getItem("user");

    if (!isLoggedIn || !userStr) {
      this.props.history.push("/?login=1&return=" + encodeURIComponent("/orders"));
      return;
    }

    const user = JSON.parse(userStr);
    this.fetchOrders(user.email);
  }

  fetchOrders = async (email) => {
    try {
      const res = await axios.get(`${API}/orders/user/history`, {
        params: { email },
      });
      this.setState({
        orders: res.data.orders || [],
        loading: false,
        error: "",
      });
    } catch (err) {
      this.setState({
        loading: false,
        error: err.response?.data?.message || "Failed to load orders",
      });
    }
  };

  formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  statusLabel = (order) => {
    if (order.payment_status === "paid") return "Paid & Confirmed";
    if (order.payment_method === "cod") return "COD — " + (order.order_status || "placed");
    if (order.payment_status === "pending") return "Payment Pending";
    return order.order_status || "Placed";
  };

  toggleExpand = (orderId) => {
    this.setState((prev) => ({
      expandedId: prev.expandedId === orderId ? null : orderId,
    }));
  };

  render() {
    const { orders, loading, error, expandedId } = this.state;

    return (
      <div className="order-history-page">
        <div className="order-history-container">
          <div className="order-history-header">
            <h1>
              <span>My</span> Orders
            </h1>
            <button className="btn btn-outline-secondary" onClick={() => this.props.history.push("/")}>
              Back to Home
            </button>
          </div>

          {loading && <p className="order-history-msg">Loading your orders...</p>}
          {error && <p className="order-history-msg error">{error}</p>}

          {!loading && !error && orders.length === 0 && (
            <div className="order-empty">
              <h3>No orders yet</h3>
              <p>You have not placed any orders. Explore restaurants and place your first order!</p>
              <button className="btn btn-danger" onClick={() => this.props.history.push("/")}>
                Browse Restaurants
              </button>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <p className="order-count">{orders.length} order(s) found</p>
          )}

          <div className="order-list">
            {orders.map((order) => (
              <div key={order._id || order.order_id} className="order-card">
                <div className="order-card-top" onClick={() => this.toggleExpand(order.order_id)}>
                  <div>
                    <h4>{order.restaurant_name}</h4>
                    <p className="order-id">#{order.order_id}</p>
                    <p className="order-date">{this.formatDate(order.created_at)}</p>
                  </div>
                  <div className="order-card-right">
                    <span className="order-total">₹{order.sub_total}</span>
                    <span className={`order-badge status-${order.order_status}`}>
                      {this.statusLabel(order)}
                    </span>
                  </div>
                </div>

                {expandedId === order.order_id && (
                  <div className="order-card-details">
                    <p>
                      <strong>Payment:</strong>{" "}
                      {order.payment_method === "online" ? "Razorpay (Online)" : "Cash on Delivery"}
                    </p>
                    <p>
                      <strong>Address:</strong> {order.delivery_address}
                    </p>
                    <p>
                      <strong>Phone:</strong> {order.user_phone}
                    </p>

                    <h5>Items</h5>
                    <ul>
                      {order.items?.map((item, i) => (
                        <li key={i}>
                          {item.name} × {item.qty} — ₹{item.price * item.qty}
                        </li>
                      ))}
                    </ul>

                    {order.driver && (
                      <div className="order-driver">
                        <h5>Delivery partner</h5>
                        <p>{order.driver.name}</p>
                        <p>{order.driver.phone}</p>
                        <p>{order.driver.vehicle}</p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  className="order-toggle-btn"
                  onClick={() => this.toggleExpand(order.order_id)}
                >
                  {expandedId === order.order_id ? "Hide details" : "View details"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(OrderHistory);
