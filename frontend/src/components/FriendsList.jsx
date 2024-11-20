import React, { useState, useCallback, useEffect } from 'react';
import './FriendsList.css';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentTakingTo } from '../store/UserInfo';
import { setChat } from '../store/chat';
import { FaGlobe, FaUserSecret, FaRobot } from 'react-icons/fa';
function FriendsList({ data }) {
    const [data2, setData] = useState(null);
    const [addFr, setAddfr] = useState(false);
    const [addFrEmail, setAddfrEamil] = useState("");
    const [isMsg, setIsMsg] = useState(false);
    const friends = useSelector((state) => state.user);
    const userFriendListStore = useSelector((state) => state.userFriendList);
    const chat = useSelector((state) => state.chat);
    const dispatch = useDispatch();

    const setCurrentTalkingTo = useCallback((e) => {
        dispatch(setCurrentTakingTo(e));
        console.log("after adding", friends);
    }, [dispatch, friends]);

    const addFriend = useCallback(async () => {
        try {
            const response = await fetch(`https://chatsphere-6vy6.onrender.com/addFriend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: addFrEmail,
                    sender: friends.user.email,
                    senderUsername: friends.user.username
                }),
            });

            if (response.ok) {
                console.log('Friend added successfully');
            } else {
                console.error('Failed to add friend');
            }
        } catch (error) {
            console.error('Error adding friend:', error);
        }
    }, [addFrEmail, friends.user.email, friends.user.username]);

    const FriendStatusUpdated = useCallback(async ({ status, sender }) => {
        try {
            const response = await fetch(`https://chatsphere-6vy6.onrender.com/addFriend/updateFriendStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: sender,
                    sender: friends.user.email,
                    senderUsername: friends.user.username,
                    status
                }),
            });

            if (response.ok) {
                console.log('Friend status updated successfully');
            } else {
                console.error('Failed to update friend status');
            }
        } catch (error) {
            console.error('Error updating friend status:', error);
        }
    }, [friends.user.email, friends.user.username]);

    const demandPreviousChat = useCallback(async (e) => {
        console.log("demanding chat", e);

        try {
            const response = await fetch(`https://chatsphere-6vy6.onrender.com/userInfo/getPreviousChat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(e),
            });

            const data1 = await response.json();
            console.log("Imp data 1 : 900", data1);
            
            if (data1.data && data1.data.length > 0) {
                console.log('Success:', data1.data[0].chat);
                console.log('Pending:', data1.data[0].pending);
                data1.data[0].pending.forEach(e => {
                    if(e.email === friends.user.email){
                        if(e.sender === e.reciver)
                        setIsMsg(true);
                    }
                });
                setData(data1.data[0].chat);
                dispatch(setChat({ "email": e.email1, "chat": data1.data[0].chat }));
            } else {
                dispatch(setChat({ "email": e.email1, "chat": [] }));
                console.log('No previous chat data found');
            }
        } catch (error) {
            console.error('Error fetching previous chat:', error);
        }
    }, [dispatch, friends.user.email]);

    return (
        <div className="friends-list-container">
            {console.log("data friendlist")}
            {data ? data.map((friend, index) => (
                <div key={index} className="friend-item" onClick={() => {
                    setCurrentTalkingTo({ email: friend.email, username: friend.username });
                    demandPreviousChat({
                        email1: friend.email,
                        email2: friends.user.email
                    });
                }}>
                    {friend.status === "pending" ? (
                        <>
                            <h6>New friend request from {friend.email}</h6>
                            <button onClick={() => FriendStatusUpdated({ status: true, sender: friend.email })}>Accept</button>
                            <button onClick={() => FriendStatusUpdated({ status: false, sender: friend.email })}>Reject</button>
                        </>
                    ) : (
                        <>
                            <h3>{friend.username}</h3>
                            <p>{friend.email}</p>
                           
                        </>
                    )}
                </div>
            )) : null}
          
             
              <div className="friend-item" style={{textAlign:"center"}} onClick={() => {
                    setCurrentTalkingTo({ email: "global@chat", username: "Chat Globally" });
                    demandPreviousChat({
                        email1: "global@chat",
                        email2: "global@chat"
                    });
                }}> <FaGlobe style={{textAlign:"center" , fontSize:"50px"}}  title="Global Chat" /></div>
              <div className="friend-item" style={{textAlign:"center"}} onClick={() => {
                    setCurrentTalkingTo({ email: "anonyms@chat", username: "Chat Anonyms" });
                    demandPreviousChat({
                        email1: "anonyms@chat",
                        email2: "anonyms@chat"
                    });}}> <FaUserSecret style={{textAlign:"center" , fontSize:"50px"}}  title="Anonyms Chat"  /></div>
              <div className="friend-item" style={{textAlign:"center"}} onClick={() => {
                    setCurrentTalkingTo({ email: "ai@chat", username: "Chat AI" });
                    demandPreviousChat({
                        email1: "ai@chat",
                        email2: "ai@chat"
                    });}}> <FaRobot style={{textAlign:"center" , fontSize:"50px"}}  title="AI Chat" /></div>
              <button onClick={() => setAddfr(prev => !prev)}>Add Friend</button>
     
   
            
            {addFr && (
                <>
                    <input type="text" placeholder="Enter email" value={addFrEmail} onChange={(e) => setAddfrEamil(e.target.value)} />
                    <button onClick={addFriend}>Add</button>
                </>
            )}
             {console.log("userFriendListStore" , userFriendListStore)}
        </div>
    );
}

export default FriendsList;