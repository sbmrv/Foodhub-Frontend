import React from "react";
import "./Styles/home.css";
import Modal from "react-modal";
import "./Styles/forms.css";
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { googleLogout } from "@react-oauth/google";

import { withRouter } from "react-router-dom";
import jwtDecode from "jwt-decode";
import axios from "axios";
import queryString from "query-string";

const responseGoogle = (response) => {
  console.log(response);
};

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

class Nav1 extends React.Component {
  constructor() {
    super();
    this.state = {
      loginModalIsOpen: false,
      signUpModalIsOpen: false,
      isLoggedIn: false,
      loggedInUser: undefined,
      username: "",
      password: "",
      Name: "",
      loginError: undefined,
      signUpError: undefined,
      signUpsuccessfull: undefined,
      user: undefined,
      userMenuOpen: false,
    };
  }

  componentDidMount() {
    const savedUser = localStorage.getItem("user");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (savedUser && isLoggedIn) {
      this.setState({ user: JSON.parse(savedUser), isLoggedIn: true });
    }

    const qs = queryString.parse(this.props.location.search);
    if (qs.login === "1") {
      this.setState({ loginModalIsOpen: true });
    }
  }
  handleLogin = () => {
    this.setState({ loginModalIsOpen: true });
  };

  loginHandler = () => {
    const { username, password } = this.state;
    console.log(username);
    console.log(password);
    const req = {
      Email: username,
      Password: password,
    };

    axios({
      method: "POST",
      url: `http://localhost:8050/login`,
      headers: { "Content-Type": "application/json" },
      data: req,
    })
      .then((result) => {
        const user = result.data.user;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isLoggedIn", "true");
        this.setState({
          user: user,
          isLoggedIn: true,
          loginError: undefined,
          loginModalIsOpen: false,
        });
        const qs = queryString.parse(this.props.location.search);
        if (qs.return) {
          this.props.history.push(decodeURIComponent(qs.return));
        }
      })
      .catch((err) => {
        this.setState({
          isLoggedIn: false,
          loginError: "Username or password is wrong",
        });
      });
  };

  handleCancel = () => {
    this.setState({ loginModalIsOpen: false });
  };
  handleLogOut = () => {
    this.setState({
      isLoggedIn: false,
      loggedInUser: undefined,
      loginModalIsOpen: false,
    });
    localStorage.clear();
    googleLogout();
  };

  handleChange = (e, field) => {
    const val = e.target.value;
    this.setState({
      [field]: val,
      loginError: undefined,
      signUpError: undefined,
    });
    // console.log(this.state.password);
    // console.log(this.state.Name);
    // console.log(this.state.username)
  };

  handleSignUp = () => {
    console.log("helloo from signupis open");
    this.setState({
      signUpModalIsOpen: true,
    });
  };

  signupHandler = () => {
    const { username, password, Name } = this.state;
    console.log(username);
    console.log(password);
    console.log(Name);

    const req = {
      Name: Name,
      Email: username,
      Password: password,
    };

    axios({
      method: "POST",
      url: `http://localhost:8050/signup`,
      headers: { "Content-Type": "application/json" },
      data: req,
    })
      .then((result) => {
        const user = result.data.user;
        const message = result.data.message;
        console.log(message);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isLoggedIn", "true");
        this.setState({
          user: user,
          isLoggedIn: true,
          signUpError: undefined,
          signUpModalIsOpen: false,
          signUpsuccessfull: message,
        });
      })
      .catch((err) => {
        this.setState({
          isLoggedIn: false,
          signUpError: "Error Signing up",
        });
        // console.log(response.data.message)
      });
  };

  handleCancel1 = () => {
    console.log("cancel");
    this.setState({
      signUpModalIsOpen: false,
    });
  };

  Gohome = () => {
    this.props.history.push("/");
    console.log("logo");
  };

  response = (credentialResponse) => {
    const details = jwtDecode(credentialResponse.credential);

    console.log(details);
    console.log(details.given_name);
    this.setState({ isLoggedIn: true, loggedInUser: details.given_name });
    console.log(credentialResponse);
  };

  toggleMenu = () => {
    const menuToggle = document.querySelector(".menuToggle");
    const links = document.querySelector(".nav-actions");
    menuToggle.classList.toggle("active");
    links.classList.toggle("active");
  };

  toggleUserMenu = () => {
    this.setState((prev) => ({ userMenuOpen: !prev.userMenuOpen }));
  };

  closeUserMenu = () => {
    this.setState({ userMenuOpen: false });
  };

  getUserInitials = (name) => {
    if (!name) return "?";
    const parts = String(name).trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  render() {
    if (this.props.location?.pathname === "/admin") {
      return null;
    }
    const {
      loginModalIsOpen,
      isLoggedIn,
      loggedInUser,
      signUpModalIsOpen,
      username,
      password,
      Name,
      loginError,
      signUpError,
      user,
      signUpsuccessfull,
    } = this.state;
    console.log(user);
    return (
      <>
        <div className="nav1" onScroll={this.handleScroll}>
          <div className="logo">
            <h4 onClick={this.Gohome}>
              <span>Food</span>Hub
            </h4>
          </div>
          <div className="menuToggle" onClick={this.toggleMenu} aria-label="Menu" />
          <div className="nav-actions">
            {!isLoggedIn ? (
              <>
                <button
                  type="button"
                  className="nav-link-quiet"
                  onClick={() => this.props.history.push("/admin")}
                >
                  Admin
                </button>
                <button type="button" className="nav-link-quiet" onClick={this.handleSignUp}>
                  Sign up
                </button>
                <button type="button" className="nav-btn-primary" onClick={this.handleLogin}>
                  Log in
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="nav-link-quiet"
                  onClick={() => this.props.history.push("/orders")}
                >
                  My Orders
                </button>
                <div className="nav-user-menu">
                  <button
                    type="button"
                    className="nav-user-trigger"
                    onClick={this.toggleUserMenu}
                    aria-expanded={this.state.userMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="nav-user-avatar">{this.getUserInitials(user?.name)}</span>
                    <span className="nav-user-name">{user?.name || "Account"}</span>
                    <span className={`nav-chevron ${this.state.userMenuOpen ? "open" : ""}`} />
                  </button>
                  {this.state.userMenuOpen && (
                    <>
                      <div className="nav-dropdown-backdrop" onClick={this.closeUserMenu} />
                      <div className="nav-dropdown" role="menu">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            this.closeUserMenu();
                            this.props.history.push("/admin");
                          }}
                        >
                          Admin
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="nav-dropdown-danger"
                          onClick={() => {
                            this.closeUserMenu();
                            this.handleLogOut();
                          }}
                        >
                          Log out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          <Modal isOpen={loginModalIsOpen} style={customStyles}>
            <div className="bxcont">
              <div className="heading">
                <h2>Login</h2>
                <a className="xbtn" onClick={this.handleCancel}>
                  x
                </a>
              </div>
              <form className="mt-4">
                {loginError ? (
                  <div className="alert alert-danger text-center my-3">
                    {loginError}
                  </div>
                ) : null}
                <input
                  className="form-control"
                  type="email"
                  placeholder="Email"
                  required
                  value={username}
                  onChange={(e) => this.handleChange(e, "username")}
                />
                <input
                  className="form-control my-3"
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => this.handleChange(e, "password")}
                />
                <div className="text-center">
                  <input
                    type="button"
                    className="btn btn-primary m-2"
                    onClick={this.loginHandler}
                    value="Login"
                  />
                  <button className="btn" onClick={this.cancelLoginHanlder}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          <Modal isOpen={signUpModalIsOpen} style={customStyles}>
            <div className="bxcont">
              <div className="heading">
                <h2>SignUp</h2>

                <a className="xbtn" onClick={this.handleCancel1}>
                  x
                </a>
              </div>
              <form>
                {signUpError ? (
                  <div className="alert alert-danger text-center my-3">
                    {signUpError}
                  </div>
                ) : null}

                <input
                  className="form-control"
                  type="email"
                  placeholder="Email"
                  value={username}
                  onChange={(e) => this.handleChange(e, "username")}
                  required
                />
                <input
                  className="form-control my-3"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => this.handleChange(e, "password")}
                  required
                />
                <input
                  className="form-control my-3"
                  type="text"
                  placeholder="Name"
                  value={Name}
                  onChange={(e) => this.handleChange(e, "Name")}
                  required
                />

                <div className="text-center">
                  <input
                    type="submit"
                    className="btn btn-primary m-2"
                    onClick={this.signupHandler}
                    value="Signup"
                  />
                  <button className="btn" onClick={this.cancelSignupHanlder}>
                    Cancel
                  </button>
                </div>
                <GoogleOAuthProvider clientId="442304858941-0u5heehmpt3iv0ar6d7v0t1p3u3ru9l0.apps.googleusercontent.com">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      console.log(credentialResponse);
                    }}
                    onError={() => {
                      console.log("Login Failed");
                    }}
                  />
                </GoogleOAuthProvider>
              </form>
            </div>
          </Modal>
        </div>
      </>
    );
  }
}
export default withRouter(Nav1);
