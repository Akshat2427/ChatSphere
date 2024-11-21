import React, { useEffect, useState } from 'react';
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setUser } from '../store/UserInfo';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const user = localStorage.getItem('user'); 
        if (user !=="undefined") {
            try {
                const parsedUser = JSON.parse(user); 
                dispatch(setUser(parsedUser)); 
                navigate("/dashboard");
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, [dispatch, navigate]);

    function changeLogginState(e) {
        e.preventDefault();
        setIsLogin(!isLogin);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const userData = {
            username,
            email,
            password,
            isLogin,
        };

        try {
            const response = await fetch(`https://chatsphere-9hfj.onrender.com/login`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const responseData = await response.json();
            console.log("Response:", responseData);
            console.log("rest", responseData.rest);
            localStorage.setItem('user', JSON.stringify(responseData.rest));
            dispatch(setUser(responseData.rest));
            navigate("/dashboard");
            
        } catch (error) {
            console.error('Error:', error.message);
            alert('Login failed. Please try again.');
        }
    }

    return (
        <div className="container">
            <div className="form-box">
                <div className="header-form">
                    <h4 className="text-primary text-center">
                        <i className="fa fa-user-circle" style={{ fontSize: "110px" }}></i>
                    </h4>
                </div>
                <div className="body-form">
                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text"><i className="fa fa-user"></i></span>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username" 
                                />
                            </div>
                        )}
                        <div className="input-group">
                            <div className="input-group-prepend">
                                <span className="input-group-text"><i className="fa fa-envelope"></i></span>
                            </div>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email" 
                            />
                        </div>
                        <div className="input-group">
                            <div className="input-group-prepend">
                                <span className="input-group-text"><i className="fa fa-lock"></i></span>
                            </div>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password" 
                            />
                        </div>
                        <button type="submit" className="btn btn-secondary" style={{ fontSize: "15px" }}>
                            {isLogin ? "Login" : "Signup"}
                        </button>
                        <div className="message">
                            <div style={{ marginTop: "10px", textDecoration: "none" }}>
                                <a href="#">Forgot your password?</a>
                            </div>
                            <div style={{ marginTop: "10px", textDecoration: "none" }}>
                                <a onClick={changeLogginState} href="#">{isLogin ? "Create New Account" : "Already Have an Account"}</a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
