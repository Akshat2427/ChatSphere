import React, { useEffect } from 'react';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import socketIO from 'socket.io-client';
const socket = socketIO.connect(`https://chatsphere-6vy6.onrender.com`);
function App() {
  const user = useSelector(state => state.user).user;
  console.log("app.js", user);
  const navigate = useNavigate();
  const location = useLocation();

useEffect(() => {
  if (user) {
    console.log("user at navigate by domain" , user);
    
    navigate("/dashboard");
  } else {
    console.log("user at navigate login" , user);

    navigate("/login");
  }
}, [user, location.pathname]);


  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={user ? <Dashboard socket={socket} /> : <Login /> } />
      <Route path="/" element={user ? <Dashboard /> : <Login />} />
    </Routes>
  );
}

export default App;