import React from "react";
import axios from "axios";
import { withRouter } from "react-router-dom";
import "./Styles/admin.css";
import { ASSETS } from "../utils/images";

const API = "http://localhost:8050";

class AdminPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      token: sessionStorage.getItem("adminToken") || "",
      isAdmin: !!sessionStorage.getItem("adminToken"),
      tab: "restaurant",
      message: "",
      error: "",
      loginEmail: "",
      loginPassword: "",
      locations: [],
      mealtypes: [],
      restaurants: [],
      menus: [],
      restaurantForm: {
        name: "",
        city: "Pune",
        locality: "",
        location_id: "",
        city_id: 12,
        min_price: "",
        contact_number: "",
        aggregate_rating: 4,
        rating_text: "Good",
        image: ASSETS.restaurants[0],
        thumb: `${ASSETS.restaurants[0]}, ${ASSETS.restaurants[1]}, ${ASSETS.restaurants[2]}`,
        cuisine: [],
        mealtype_id: [],
      },
      menuForm: {
        restaurant_id: "",
        menuCard: [{ name: "", price: "", desc: "", image: ASSETS.menuItem }],
      },
    };
  }

  getHeaders = () => ({
    "Content-Type": "application/json",
    "x-admin-token": this.state.token,
  });

  componentDidMount() {
    if (this.state.isAdmin) {
      this.loadAdminData();
    }
  }

  loadAdminData = async () => {
    try {
      const [locRes, mealRes, restRes, menuRes] = await Promise.all([
        axios.get(`${API}/admin/locations`, { headers: this.getHeaders() }),
        axios.get(`${API}/admin/mealtypes`, { headers: this.getHeaders() }),
        axios.get(`${API}/admin/restaurants`, { headers: this.getHeaders() }),
        axios.get(`${API}/admin/menus`, { headers: this.getHeaders() }),
      ]);
      this.setState({
        locations: locRes.data.locations || [],
        mealtypes: mealRes.data.mealtypes || [],
        restaurants: restRes.data.restaurants || [],
        menus: menuRes.data.menus || [],
      });
    } catch (err) {
      if (err.response?.status === 401) {
        this.handleLogout();
      }
    }
  };

  handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/admin/login`, {
        email: this.state.loginEmail,
        password: this.state.loginPassword,
      });
      sessionStorage.setItem("adminToken", res.data.token);
      this.setState(
        { token: res.data.token, isAdmin: true, message: "Logged in", error: "" },
        this.loadAdminData
      );
    } catch (err) {
      this.setState({ error: "Invalid admin email or password" });
    }
  };

  handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    this.setState({ token: "", isAdmin: false, tab: "restaurant" });
  };

  handleRestaurantChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      restaurantForm: { ...this.state.restaurantForm, [name]: value },
    });
  };

  toggleArrayField = (field, value) => {
    const arr = [...this.state.restaurantForm[field]];
    const num = Number(value);
    const idx = arr.indexOf(num);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(num);
    this.setState({
      restaurantForm: { ...this.state.restaurantForm, [field]: arr },
    });
  };

  submitRestaurant = async (e) => {
    e.preventDefault();
    const { restaurantForm } = this.state;
    try {
      await axios.post(`${API}/admin/restaurants`, restaurantForm, {
        headers: this.getHeaders(),
      });
      this.setState({
        message: "Restaurant added successfully!",
        error: "",
        restaurantForm: {
          ...restaurantForm,
          name: "",
          locality: "",
          min_price: "",
          contact_number: "",
          cuisine: [],
          mealtype_id: [],
        },
      });
      this.loadAdminData();
    } catch (err) {
      this.setState({ error: err.response?.data?.message || "Failed to add restaurant" });
    }
  };

  deleteRestaurant = async (id) => {
    if (!window.confirm("Delete this restaurant?")) return;
    try {
      await axios.delete(`${API}/admin/restaurants/${id}`, {
        headers: this.getHeaders(),
      });
      this.setState({ message: "Restaurant deleted" });
      this.loadAdminData();
    } catch (err) {
      this.setState({ error: "Delete failed" });
    }
  };

  handleMenuChange = (e) => {
    this.setState({
      menuForm: { ...this.state.menuForm, [e.target.name]: e.target.value },
    });
  };

  handleMenuItemChange = (index, field, value) => {
    const items = [...this.state.menuForm.menuCard];
    items[index] = { ...items[index], [field]: value };
    this.setState({ menuForm: { ...this.state.menuForm, menuCard: items } });
  };

  addMenuRow = () => {
    this.setState({
      menuForm: {
        ...this.state.menuForm,
        menuCard: [
          ...this.state.menuForm.menuCard,
          { name: "", price: "", desc: "", image: ASSETS.menuItem },
        ],
      },
    });
  };

  removeMenuRow = (index) => {
    const items = this.state.menuForm.menuCard.filter((_, i) => i !== index);
    this.setState({
      menuForm: {
        ...this.state.menuForm,
        menuCard: items.length ? items : [{ name: "", price: "", desc: "", image: "Assets/breakfast.jpg" }],
      },
    });
  };

  submitMenu = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/menus`, this.state.menuForm, {
        headers: this.getHeaders(),
      });
      this.setState({ message: "Menu saved successfully!", error: "" });
      this.loadAdminData();
    } catch (err) {
      this.setState({ error: err.response?.data?.message || "Failed to save menu" });
    }
  };

  deleteMenu = async (id) => {
    if (!window.confirm("Delete this menu?")) return;
    try {
      await axios.delete(`${API}/admin/menus/${id}`, { headers: this.getHeaders() });
      this.setState({ message: "Menu deleted" });
      this.loadAdminData();
    } catch (err) {
      this.setState({ error: "Delete failed" });
    }
  };

  renderLogin() {
    return (
      <div className="admin-page">
        <div className="admin-card admin-login">
          <h2>Admin Login</h2>
          {this.state.error && <div className="admin-msg error">{this.state.error}</div>}
          <form onSubmit={this.handleLogin} className="admin-form">
            <div className="full">
              <label>Email</label>
              <input
                type="email"
                required
                value={this.state.loginEmail}
                onChange={(e) => this.setState({ loginEmail: e.target.value })}
                placeholder="admin@foodhub.com"
              />
            </div>
            <div className="full">
              <label>Password</label>
              <input
                type="password"
                required
                value={this.state.loginPassword}
                onChange={(e) => this.setState({ loginPassword: e.target.value })}
              />
            </div>
            <button type="submit" className="admin-btn">
              Login
            </button>
          </form>
          <p style={{ marginTop: 12, fontSize: "0.85rem", color: "#666" }}>
            Default: admin@foodhub.com / admin123
          </p>
        </div>
      </div>
    );
  }

  renderRestaurantForm() {
    const f = this.state.restaurantForm;
    const { locations, mealtypes } = this.state;
    return (
      <div className="admin-card">
        <h2>Add Restaurant</h2>
        <form onSubmit={this.submitRestaurant} className="admin-form">
          <div>
            <label>Name *</label>
            <input name="name" value={f.name} onChange={this.handleRestaurantChange} required />
          </div>
          <div>
            <label>City *</label>
            <input name="city" value={f.city} onChange={this.handleRestaurantChange} required />
          </div>
          <div>
            <label>Locality *</label>
            <input name="locality" value={f.locality} onChange={this.handleRestaurantChange} required />
          </div>
          <div>
            <label>Location</label>
            <select name="location_id" value={f.location_id} onChange={this.handleRestaurantChange} required>
              <option value="">Select</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc.location_id}>
                  {loc.name}, {loc.city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Min price (for two) *</label>
            <input name="min_price" type="number" value={f.min_price} onChange={this.handleRestaurantChange} required />
          </div>
          <div>
            <label>Contact number *</label>
            <input name="contact_number" type="number" value={f.contact_number} onChange={this.handleRestaurantChange} required />
          </div>
          <div>
            <label>Rating</label>
            <input name="aggregate_rating" type="number" step="0.1" value={f.aggregate_rating} onChange={this.handleRestaurantChange} />
          </div>
          <div>
            <label>Rating text</label>
            <input name="rating_text" value={f.rating_text} onChange={this.handleRestaurantChange} />
          </div>
          <div>
            <label>City ID</label>
            <input name="city_id" type="number" value={f.city_id} onChange={this.handleRestaurantChange} />
          </div>
          <div>
            <label>Main image path</label>
            <input name="image" value={f.image} onChange={this.handleRestaurantChange} />
          </div>
          <div className="full">
            <label>Thumb images (comma separated)</label>
            <input name="thumb" value={f.thumb} onChange={this.handleRestaurantChange} />
          </div>
          <div className="admin-checks">
            <strong>Cuisine:</strong>
            {[1, 2, 3, 4, 5].map((id) => (
              <label key={id}>
                <input
                  type="checkbox"
                  checked={f.cuisine.includes(id)}
                  onChange={() => this.toggleArrayField("cuisine", id)}
                />
                {["North Indian", "South Indian", "Chinese", "Fast Food", "Street Food"][id - 1]}
              </label>
            ))}
          </div>
          <div className="admin-checks">
            <strong>Meal types:</strong>
            {mealtypes.map((m) => (
              <label key={m._id}>
                <input
                  type="checkbox"
                  checked={f.mealtype_id.includes(m.mealtype_id)}
                  onChange={() => this.toggleArrayField("mealtype_id", m.mealtype_id)}
                />
                {m.name}
              </label>
            ))}
            {!mealtypes.length &&
              [1, 2, 3, 4, 5, 6].map((id) => (
                <label key={id}>
                  <input
                    type="checkbox"
                    checked={f.mealtype_id.includes(id)}
                    onChange={() => this.toggleArrayField("mealtype_id", id)}
                  />
                  Type {id}
                </label>
              ))}
          </div>
          <button type="submit" className="admin-btn">
            Add Restaurant
          </button>
        </form>
      </div>
    );
  }

  renderMenuForm() {
    const { menuForm, restaurants } = this.state;
    return (
      <div className="admin-card">
        <h2>Add / Update Menu Card</h2>
        <form onSubmit={this.submitMenu} className="admin-form">
          <div className="full">
            <label>Restaurant *</label>
            <select
              name="restaurant_id"
              value={menuForm.restaurant_id}
              onChange={this.handleMenuChange}
              required
            >
              <option value="">Select restaurant</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r.restaurant_id}>
                  #{r.restaurant_id} — {r.name} ({r.city})
                </option>
              ))}
            </select>
          </div>
          <div className="full">
            <label>Menu items</label>
            {menuForm.menuCard.map((item, index) => (
              <div key={index} className="menu-item-row">
                <input
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => this.handleMenuItemChange(index, "name", e.target.value)}
                  required
                />
                <input
                  placeholder="Price"
                  type="number"
                  value={item.price}
                  onChange={(e) => this.handleMenuItemChange(index, "price", e.target.value)}
                  required
                />
                <input
                  placeholder="Description"
                  value={item.desc}
                  onChange={(e) => this.handleMenuItemChange(index, "desc", e.target.value)}
                />
                <input
                  placeholder="Image path"
                  value={item.image}
                  onChange={(e) => this.handleMenuItemChange(index, "image", e.target.value)}
                />
                <button type="button" className="admin-btn danger" onClick={() => this.removeMenuRow(index)}>
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="admin-btn secondary" onClick={this.addMenuRow} style={{ marginTop: 8 }}>
              + Add item
            </button>
          </div>
          <button type="submit" className="admin-btn">
            Save Menu
          </button>
        </form>
      </div>
    );
  }

  renderLists() {
    const { restaurants, menus } = this.state;
    return (
      <>
        <div className="admin-card">
          <h2>Restaurants ({restaurants.length})</h2>
          <ul className="admin-list">
            {restaurants.map((r) => (
              <li key={r._id}>
                <span>
                  <strong>#{r.restaurant_id}</strong> {r.name} — {r.city}, {r.locality} (₹{r.min_price})
                </span>
                <button className="admin-btn danger" onClick={() => this.deleteRestaurant(r._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="admin-card">
          <h2>Menus ({menus.length})</h2>
          <ul className="admin-list">
            {menus.map((m) => (
              <li key={m._id}>
                <span>
                  Restaurant #{m.restaurant_id} — {m.menuCard?.length || 0} items
                </span>
                <button className="admin-btn danger" onClick={() => this.deleteMenu(m._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }

  render() {
    if (!this.state.isAdmin) return this.renderLogin();

    const { tab, message, error } = this.state;
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-header">
            <h1>
              <span>Food</span>Hub Admin
            </h1>
            <div>
              <button className="admin-btn secondary" onClick={() => this.props.history.push("/")} style={{ marginRight: 8 }}>
                Home
              </button>
              <button className="admin-btn danger" onClick={this.handleLogout}>
                Logout
              </button>
            </div>
          </div>

          {message && <div className="admin-msg success">{message}</div>}
          {error && <div className="admin-msg error">{error}</div>}

          <div className="admin-tabs">
            <button className={tab === "restaurant" ? "active" : ""} onClick={() => this.setState({ tab: "restaurant", message: "", error: "" })}>
              Add Restaurant
            </button>
            <button className={tab === "menu" ? "active" : ""} onClick={() => this.setState({ tab: "menu", message: "", error: "" })}>
              Add Menu
            </button>
            <button className={tab === "manage" ? "active" : ""} onClick={() => this.setState({ tab: "manage", message: "", error: "" })}>
              Manage All
            </button>
          </div>

          {tab === "restaurant" && this.renderRestaurantForm()}
          {tab === "menu" && this.renderMenuForm()}
          {tab === "manage" && this.renderLists()}
        </div>
      </div>
    );
  }
}

export default withRouter(AdminPanel);
