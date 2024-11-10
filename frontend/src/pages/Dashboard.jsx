import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ChatInterface from '../components/ChatInterface';
import FriendsList from '../components/FriendsList';
import { setUserFriendList } from '../store/UserFriendList';
import { useDispatch } from 'react-redux';

import './Dashboard.css';

function Dashboard({ socket }) {
  const [friends, setFriends] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector(state => state.user);
  const userFriendList = useSelector(state => state.userFriendList);
  console.log("userFriendList : OG",userFriendList);
  
  const dispatch = useDispatch();
  useEffect(() => {
    if (user?.user?.email) {
      fetchDataFromServer();
    }
  }, [user]);
  useEffect(() => {
    console.log("Updated userFriendList: ", userFriendList);
}, [userFriendList]);
  async function fetchDataFromServer() {
    try {
      const response = await fetch(`https://chatsphere-6vy6.onrender.com/userInfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.user.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const responseData = await response.json();
      const obj = responseData.data;
            
      Object.keys(obj).forEach(key => {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
              obj[key].messagePending = false;
          }
      });

      dispatch(setUserFriendList(obj)); 
      setFriends(obj);
      
console.log("User Dahboard 99" , userFriendList);

      console.log("friends ", friends);
      
      console.log("Response:", responseData.data);
      
    } catch (error) {
      console.error('Error:', error.message);
      alert('Fetching data failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="friends-list-container-2">
        <FriendsList data={friends} />
      </div>
      <div className="chat-interface-container">
        {/* <h2>{user?.user?.username}</h2> */}
        <ChatInterface socket={socket} username={user?.user?.username} email={user?.user?.email} />
      </div>
    </div>
  );
}

export default Dashboard;
