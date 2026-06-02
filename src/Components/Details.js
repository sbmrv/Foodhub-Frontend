import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "./Styles/detail.css";
import queryString from "query-string";
import axios from "axios";
import Modal from "react-modal";
import { withRouter } from "react-router-dom";
import { getImageUrl } from "../utils/images";

const API = "http://localhost:8050";

const customStyles = {
  content: {
    marginTop: "30px",
    top: "45%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxHeight: "90vh",
    overflow: "auto",
  },
};

class Details extends React.Component {
  constructor() {
    super();
    this.state = {
      restaurant: {},
      arr: [],
      thumbnail: [],
      menuItem: [],
      menuModelIsOpen: false,
      orderModelIsOpen: false,
      orderSuccessOpen: false,
      subTotal: 0,
      myMenu: [],
      paymentMethod: "cod",
      orderForm: {
        name: "",
        email: "",
        phone: "",
        address: "",
      },
      placedOrder: null,
      orderError: "",
      placingOrder: false,
    };
  }

  isLoggedIn = () => {
    return localStorage.getItem("isLoggedIn") === "true" && localStorage.getItem("user");
  };

  getLoggedInUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  requireLogin = (message) => {
    alert(message || "Please login to place an order");
    const returnPath = this.props.location.pathname + this.props.location.search;
    this.props.history.push(`/?login=1&return=${encodeURIComponent(returnPath)}`);
  };

  componentDidMount = async () => {
    const user = this.getLoggedInUser();
    if (user) {
      this.setState({
        orderForm: {
          name: user.name || "",
          email: user.email || "",
          phone: "",
          address: "",
        },
      });
    }

    const qs = queryString.parse(this.props.location.search);
    const { restaurants } = qs;

    const result = await axios({
      method: "GET",
      url: `${API}/getRestaurantById/${restaurants}`,
      headers: { "Content-Type": "application/json" },
    });

    const restaurant = result.data.restaurants;
    this.setState({
      restaurant,
      arr: restaurant.cuisine?.map((key) => key.name) || [],
      thumbnail: restaurant.thumb || [],
    });
  };

  handlePlaceOrderClick = () => {
    if (!this.isLoggedIn()) {
      this.requireLogin("Please login to place an order");
      return;
    }
    const resID = this.state.restaurant.restaurant_id || this.state.restaurant._id;
    this.handleOrder(resID);
  };

  handleOrder = async (resID) => {
    if (!resID) {
      alert("Restaurant menu not available");
      return;
    }
    try {
      const menucard = await axios({
        method: "GET",
        url: `${API}/menu/${resID}`,
        headers: { "Content-Type": "application/json" },
      });
      const mymenu = menucard.data.mymenu || [];
      if (!mymenu.length) {
        alert("No menu available for this restaurant");
        return;
      }
      this.setState({
        menuItem: menucard.data.Menu,
        myMenu: mymenu,
        menuModelIsOpen: true,
        subTotal: 0,
      });
    } catch (err) {
      alert("Could not load menu");
    }
  };

  addItems = (index, operation_type) => {
    let total = 0;
    let { myMenu } = this.state;
    const items = [...myMenu];
    const item = { ...items[index] };

    if (operation_type === "add") {
      item.qty = (item.qty || 0) + 1;
    } else {
      item.qty = Math.max(0, (item.qty || 0) - 1);
    }
    items[index] = item;
    items.forEach((i) => {
      total += (i.qty || 0) * i.price;
    });
    this.setState({ myMenu: items, subTotal: total });
  };

  handleProceedCheckout = () => {
    if (!this.isLoggedIn()) {
      this.requireLogin();
      return;
    }
    if (this.state.subTotal <= 0) {
      alert("Please add items to your cart first");
      return;
    }
    const user = this.getLoggedInUser();
    this.setState({
      orderModelIsOpen: true,
      orderForm: {
        ...this.state.orderForm,
        name: user?.name || this.state.orderForm.name,
        email: user?.email || this.state.orderForm.email,
      },
    });
  };

  handleFormChange = (e) => {
    this.setState({
      orderForm: { ...this.state.orderForm, [e.target.name]: e.target.value },
    });
  };

  buildOrderPayload = () => {
    const { restaurant, myMenu, subTotal, orderForm, paymentMethod } = this.state;
    const user = this.getLoggedInUser();
    const items = myMenu
      .filter((i) => i.qty > 0)
      .map((i) => ({
        name: i.name,
        price: i.price,
        qty: i.qty,
        desc: i.desc,
      }));

    return {
      user_id: user?._id || user?.email,
      user_name: orderForm.name,
      user_email: orderForm.email,
      user_phone: orderForm.phone,
      restaurant_id: restaurant.restaurant_id || restaurant._id,
      restaurant_name: restaurant.name,
      items,
      sub_total: subTotal,
      delivery_address: orderForm.address,
      payment_method: paymentMethod,
    };
  };

  placeOrder = async (e) => {
    e.preventDefault();
    if (!this.isLoggedIn()) {
      this.requireLogin();
      return;
    }

    this.setState({ placingOrder: true, orderError: "" });

    try {
      const payload = this.buildOrderPayload();
      const result = await axios.post(`${API}/orders`, payload);
      const order = result.data.order;

      if (this.state.paymentMethod === "online") {
        await this.startOnlinePayment(order);
      } else {
        this.setState({
          placedOrder: order,
          orderModelIsOpen: false,
          menuModelIsOpen: false,
          orderSuccessOpen: true,
          placingOrder: false,
          subTotal: 0,
        });
      }
    } catch (err) {
      this.setState({
        orderError: err.response?.data?.message || "Failed to place order",
        placingOrder: false,
      });
    }
  };

  loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  startOnlinePayment = async (order) => {
    const { orderForm } = this.state;
    const loaded = await this.loadRazorpayScript();
    if (!loaded) {
      this.setState({
        orderError: "Could not load Razorpay. Check your internet connection.",
        placingOrder: false,
      });
      return;
    }

    const paymentRes = await fetch(`${API}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: order.sub_total,
        email: orderForm.email,
        mobileNo: orderForm.phone,
        orderId: order.order_id,
      }),
    });

    const paymentData = await paymentRes.json();
    if (!paymentRes.ok) {
      throw new Error(paymentData.message || "Failed to create payment");
    }

    const options = {
      key: paymentData.key_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: "FoodHub",
      description: `Order ${order.order_id}`,
      order_id: paymentData.razorpay_order_id,
      prefill: {
        name: orderForm.name,
        email: orderForm.email,
        contact: orderForm.phone,
      },
      theme: { color: "#ce2f2f" },
      handler: async (response) => {
        try {
          const verifyRes = await axios.post(`${API}/payment/verify`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            foodhub_order_id: order.order_id,
          });
          const updatedOrder = verifyRes.data.order || order;
          this.setState({
            placedOrder: { ...updatedOrder, payment_status: "paid" },
            orderModelIsOpen: false,
            menuModelIsOpen: false,
            orderSuccessOpen: true,
            placingOrder: false,
            subTotal: 0,
            orderError: "",
          });
        } catch (err) {
          this.setState({
            orderError: "Payment verification failed. Contact support.",
            placingOrder: false,
          });
        }
      },
      modal: {
        ondismiss: () => {
          this.setState({ placingOrder: false });
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => {
      this.setState({
        orderError: "Payment failed. Please try again.",
        placingOrder: false,
      });
    });
    rzp.open();
    this.setState({ placingOrder: false });
  };

  render() {
    const {
      restaurant,
      arr,
      thumbnail,
      myMenu,
      orderModelIsOpen,
      menuModelIsOpen,
      subTotal,
      paymentMethod,
      orderForm,
      placedOrder,
      orderSuccessOpen,
      orderError,
      placingOrder,
    } = this.state;

    return (
      <>
        <div className="container-fluid crausal1">
          <Carousel showThumbs={false}>
            {thumbnail.map((i, idx) => (
              <div className="imgcont" key={idx}>
                <img className="img-2" src={getImageUrl(i)} alt={restaurant.name} />
              </div>
            ))}
          </Carousel>
          <h2 className="menuName">{restaurant.name}</h2>
          <div className="btnbox">
            <button
              className="btn-3 btn btn-danger"
              type="button"
              onClick={this.handlePlaceOrderClick}
            >
              Place online Order
            </button>
          </div>

          <div className="tab-wrapper">
            <Tabs selectedTabClassName="tab">
              <TabList>
                <Tab>
                  <b>Overview</b>
                </Tab>
                <Tab>
                  <b>Contact</b>
                </Tab>
              </TabList>

              <TabPanel className="container2">
                <h3 className="phNo">About this place</h3>
                <h4 className="cuisineH">Cuisine</h4>
                <p className="head">
                  {arr.map((item, i) => (
                    <span key={i}>&nbsp;&nbsp;{item}&nbsp;</span>
                  ))}
                </p>
                <h4>Average cost</h4>
                <p className="address">&#8377;{restaurant.min_price} for two people (approx)</p>
              </TabPanel>
              <TabPanel className="container2">
                <h4 className="phNo">Phone Number</h4>
                <p className="Mob">+91 {restaurant.contact_number}</p>
                <h4 id="head">{restaurant.name}</h4>
                <address className="address">
                  Shop1, plotD,{restaurant.locality}
                  <br />
                  {restaurant.city}, Maharashtra
                </address>
              </TabPanel>
            </Tabs>
          </div>
        </div>

        <Modal isOpen={menuModelIsOpen} style={customStyles}>
          <div className="menuhead">
            <h3>{restaurant.name}</h3>
            <h4>Sub Total: ₹{subTotal}</h4>
            <button className="btn btn-danger" onClick={this.handleProceedCheckout}>
              Proceed to Checkout
            </button>
            <button
              className="remove"
              onClick={() => this.setState({ menuModelIsOpen: false, subTotal: 0 })}
            >
              <i className="fa-solid fa-x"></i>
            </button>
          </div>
          <div className="restList row">
            {myMenu.map((elem, index) => (
              <div className="card22" key={index}>
                <div className="info">
                  <h3>{elem.name}</h3>
                  <h4>₹{elem.price}</h4>
                  <p>{elem.desc}</p>
                </div>
                <div className="imagecont">
                  <img src={getImageUrl(elem.image)} alt={elem.name} />
                  {elem.qty === 0 || !elem.qty ? (
                    <button className="btn btn-secondary add" onClick={() => this.addItems(index, "add")}>
                      Add
                    </button>
                  ) : (
                    <div className="addNumber">
                      <button className="btn btn-secondary n1" onClick={() => this.addItems(index, "subtract")}>
                        -
                      </button>
                      <span>{elem.qty}</span>
                      <button className="btn btn-secondary" onClick={() => this.addItems(index, "add")}>
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Modal>

        <Modal isOpen={orderModelIsOpen} style={customStyles}>
          <div>
            <button className="remove" onClick={() => this.setState({ orderModelIsOpen: false })}>
              <i className="fa-solid fa-x"></i>
            </button>
          </div>
          <div className="orderhead">
            <h5>Checkout — {restaurant.name}</h5>
            <p>Total: ₹{subTotal}</p>
          </div>
          <div className="orderForm">
            {orderError && <div className="order-error">{orderError}</div>}
            <form onSubmit={this.placeOrder}>
              <input
                type="text"
                name="name"
                required
                placeholder="Name"
                value={orderForm.name}
                onChange={this.handleFormChange}
              />
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                value={orderForm.email}
                onChange={this.handleFormChange}
              />
              <input
                type="tel"
                name="phone"
                required
                placeholder="Phone Number"
                value={orderForm.phone}
                onChange={this.handleFormChange}
              />
              <input
                type="text"
                name="address"
                required
                placeholder="Delivery Address"
                value={orderForm.address}
                onChange={this.handleFormChange}
              />

              <div className="payment-options">
                <h6>Payment method</h6>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => this.setState({ paymentMethod: "cod" })}
                  />
                  Cash on Delivery (COD)
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={() => this.setState({ paymentMethod: "online" })}
                  />
                  Online Payment (Razorpay)
                </label>
              </div>

              <button className="btn btn-success" type="submit" disabled={placingOrder}>
                {placingOrder ? "Placing order..." : "Place Order"}
              </button>
            </form>
          </div>
        </Modal>

        <Modal isOpen={orderSuccessOpen} style={customStyles}>
          <div className="order-success">
            <h3>Order Placed!</h3>
            {placedOrder && (
              <>
                <p>
                  <strong>Order ID:</strong> {placedOrder.order_id}
                </p>
                <p>
                  <strong>Status:</strong> {placedOrder.order_status}
                </p>
                <p>
                  <strong>Payment:</strong>{" "}
                  {placedOrder.payment_method === "online" ? "Online (Razorpay)" : "Cash on Delivery"}
                </p>
                <div className="driver-info">
                  <h5>Driver assigned</h5>
                  <p>{placedOrder.driver?.name}</p>
                  <p>{placedOrder.driver?.phone}</p>
                  <p>{placedOrder.driver?.vehicle}</p>
                </div>
              </>
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                className="btn btn-outline-danger"
                onClick={() => this.props.history.push("/orders")}
              >
                View My Orders
              </button>
              <button
                className="btn btn-danger"
                onClick={() => this.setState({ orderSuccessOpen: false })}
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

export default withRouter(Details);
