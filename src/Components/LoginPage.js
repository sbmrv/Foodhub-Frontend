import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Modal from 'react-modal';
import axios from 'axios';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '450px'
    }
}

Modal.setAppElement('#root');

class LoginPage extends Component {

    constructor() {
        super();
        this.state = {
            backgroundStyle: '',
            isLoginModalOpen: false,
            isSignupModalOpen: false,
            username: '',
            password: '',
            Name: '',
            user: undefined,
            isLoggedIn: false,
            loginError: undefined,
            signUpError: undefined
        }
    }

    componentDidMount() {
        const initialPath = this.props.history.location.pathname;
        this.setHeaderStyle(initialPath);
        this.props.history.listen((location, action) => {
            this.setHeaderStyle(location.pathname);
        })
    }
    
    setHeaderStyle = (path) => {
        let bg = '';
        if (path == '/' || path == '/home') {
            bg = 'transparent';
        } else {
            bg = 'coloured';
        }
        this.setState({
            backgroundStyle: bg
        });
    }

    navigate = (path) => {
        this.props.history.push(path);
    }

    openLoginModal = () => {
        this.setState({
            isLoginModalOpen: true
        });
    }

    closeLoginModal = () => {
        this.setState({
            isLoginModalOpen: false
        });
    }

    loginHandler = () => {
        const { username, password } = this.state;
        const req = {
            Email: username,
            Password: password
        }
        axios({
            method: 'POST',
            url: `http://localhost:8050/login`,
            headers: { 'Content-Type': 'application/json' },
            data: req
        }).then(result =>  {
            const user = result.data.user;
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("isLoggedIn", true);
            this.setState({
                user: user,
                isLoggedIn: true,
                loginError: undefined,
                isLoginModalOpen: false
            });
        }).catch(err => {
            this.setState({
                isLoggedIn: false,
                loginError: "Username or password is wrong"
            })
        });
    }

    cancelLoginHanlder = () => {
        this.closeLoginModal();
    }

    openSignupModal = () => {
        this.setState({
            isSignupModalOpen: true
        });
    }

    closeSignupModal = () => {
        this.setState({
            isSignupModalOpen: false
        });
    }

    signupHandler = () => {
        const { username, password, Name } = this.state;
        const req = {
            Email: username,
            Password: password,
            Name: Name,
            
        }
        axios({
            method: 'POST',
            url: `http://localhost:8050/signup`,
            headers: { 'Content-Type': 'application/json' },
            data: req
        }).then(result =>  {
            const user = result.data.user;
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("isLoggedIn", true);
            this.setState({
                user: user,
                isLoggedIn: true,
                signUpError: undefined,
                isSignupModalOpen: false
            });
        }).catch(err => {
            this.setState({
                isLoggedIn: false,
                signUpError: "Error Signing up"
            })
        });
    }

    cancelSignupHanlder = () => {
        this.closeSignupModal();
    }

    logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
        this.setState({
            user: undefined,
            isLoggedIn: false
        });
    }

    handleChange = (e, field) => {
        const val = e.target.value;
        this.setState({
            [field]: val,
            loginError: undefined,
            signUpError: undefined
        })
    }

    faceBookLogin = (e) => {
        debugger

        // TODO: Learner Task to continue with the login or Signup flow
    }

    googleLogin = (e) => {
        debugger

        // TODO: Learner Task to continue with the login or Signup flow
    }

    render() {
        const { backgroundStyle, isLoginModalOpen, isSignupModalOpen, username, password, firstName, lastName, loginError, signUpError, isLoggedIn, user,Name } = this.state;
        return (
            <React.Fragment>

<div className="loginSection col-6">
                                {
                                    isLoggedIn 
                                    ?
                                    <>
                                        <span className="text-white m-4">{user.firstName}</span>
                                        <button className="loginButton" onClick={this.logout}>Logout</button>
                                    </>
                                    :
                                    <>
                                        <button className="loginButton" onClick={this.openLoginModal}>Login</button>
                                        <button className="createAccountButton" onClick={this.openSignupModal}>Create an account</button>
                                    </>
                                }
                            </div>   
                <Modal isOpen={isLoginModalOpen} style={customStyles}>
                    <h2>
                        Login
                        <button onClick={this.closeLoginModal} className="btn btn-outline-danger float-end">X</button>
                    </h2>
                    <form className="mt-4">
                        { loginError ? <div className="alert alert-danger text-center my-3">{loginError}</div> : null }
                        <input className="form-control" type="text" placeholder="Email" required value={username} onChange={(e) => this.handleChange(e, 'username')}/>
                        <input className="form-control my-3" type="password" placeholder="Password" required value={password} onChange={(e) => this.handleChange(e, 'password')}/>
                        <div className="text-center">
                            <input type="button" className="btn btn-primary m-2" onClick={this.loginHandler} value="Login" />
                            <button className="btn" onClick={this.cancelLoginHanlder}>Cancel</button>
                        </div>
                        
                    </form>
                </Modal>
                <Modal isOpen={isSignupModalOpen} style={customStyles}>
                    <h2>
                        Signup
                        <button onClick={this.closeSignupModal} className="btn btn-outline-danger float-end">X</button>
                    </h2>
                    <form className="mt-4">
                        { signUpError ? <div className="alert alert-danger text-center my-3">{signUpError}</div> : null }
                        <input className="form-control" type="text" placeholder="Email" required value={username} onChange={(e) => this.handleChange(e, 'username')}/>
                        <input className="form-control my-3" type="password" placeholder="Password" required value={password} onChange={(e) => this.handleChange(e, 'password')}/>
                        <input className="form-control my-3" type="text" placeholder="Name" required value={Name} onChange={(e) => this.handleChange(e, 'Name')}/>
                        
                        <div className="text-center">
                            <input type="button" className="btn btn-primary m-2" onClick={this.signupHandler} value="Signup" />
                            <button className="btn" onClick={this.cancelSignupHanlder}>Cancel</button>
                        </div>
                        
                    </form>
                </Modal>
            </React.Fragment>
        )
    }
}



export default withRouter(LoginPage);