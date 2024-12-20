import React, { useState, useEffect } from 'react';
import './ChatInterface.css';
import { useSelector, useDispatch } from 'react-redux';
import UserFriendList, { setUserFriendList } from '../store/UserFriendList';
import { imgDB } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";

function ChatInterface({ socket, username, email }) {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [img, setImg] = useState(null);
  const [aiError, setAiError] = useState(null);  
  const friends = useSelector((state) => state.user);
  const chat = useSelector((state) => state.chat);
  const userFriendList = useSelector(state => state.userFriendList);
  const dispatch = useDispatch();

  const takingTo = friends.currentTakingTo?.username;

  async function responseFromAI(msg) {
    try {
      const response = await fetch(`https://chatsphere-9hfj.onrender.com/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          msg: msg,
          username: username
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI response');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error handling AI response:', error);
      setAiError("Sorry, the AI model is currently unavailable. Please try again later.");
    }
  }

  useEffect(() => {
    socket.emit('userConnected', email);

    socket.on('messageResponse', (data) => {
      console.log("Message received:", data);

      if (takingTo === data.name || (data?.recipient === "global@chat" && data?.email !== email) || (data?.recipient === "anonyms@chat" && data?.email !== email)) {
        setMessages((prevMessages) => [...prevMessages, data]);
      } else {
        Object.keys(userFriendList).forEach(key => {
          if (userFriendList[key]?.username === data.name) {
            userFriendList[key].messagePending = true;
          }
        });
        dispatch(setUserFriendList(userFriendList));
        alert("Message from someone: " + data.name);
      }
    });

    return () => {
      socket.off('messageResponse');
    };
  }, [socket, email, friends.currentTakingTo, takingTo, userFriendList, dispatch]);

  useEffect(() => {
    setMessages([]);
  }, [takingTo]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (img !== null) {
      handleSendImage();
      return;
    }

    if (msg.trim()) {
      const messageData = {
        text: msg,
        name: username,
        email: email,
        recipient: friends.currentTakingTo?.email,
      };

      socket.emit('message', messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setMsg('');

      if (friends.currentTakingTo?.email === "ai@chat") {
        try {
          const dataFromAI = await responseFromAI(msg); 
          if (dataFromAI) {
            const aiMessageData = {
              text: dataFromAI.response, 
              name: "AI",
              email: "ai@chat",
              recipient: email,
            };

            socket.emit('aiMessage', aiMessageData);
            setMessages((prevMessages) => [...prevMessages, aiMessageData]);
          }
        } catch (error) {
          console.error('Error handling AI response:', error);
        }
      }
    }
  };

  const handleSendImage = () => {
    const file = img;
    const maxSize = 2 * 1024 * 1024; 
    
    if (file && file.size > maxSize) {
      alert("File size exceeds 2 MB. Limited storage, sorry.");
      setImg(null);
      return;
    }

    const imgref = ref(imgDB, `files/${v4()}`);
    
    uploadBytes(imgref, img)
      .then(() => {
        console.log("Image uploaded successfully");
        return getDownloadURL(imgref);
      })
      .then((url) => {
        console.log("Image URL:", url);
       
        const messageData = {
          text: `${url}`, 
          name: username,
          email: email,
          recipient: friends.currentTakingTo?.email,
        };
  
        socket.emit('message', messageData);
        setMessages((prevMessages) => [...prevMessages, messageData]);
        setImg(null);
      })
      .catch((error) => {
        console.error("Upload failed", error);
      });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">{takingTo || "Chat Sphere"}</div>
      <div className="chat-display" style={{ lineBreak: "anywhere" }}>
        {chat && !chat?.chat[0] ? (
          <>
            <h1 style={{ textAlign: "center" }}>Select a friend to chat</h1>
            <img style={{ display: "block", margin: "0 auto" }} src="chating.png" alt="Image of friend" />
          </>
        ) : (
          chat?.chat[0]?.chat?.map((e) => (
            <div 
              key={e.time} 
              className={`chat-message ${(e.sendBy === friends.currentTakingTo?.email || (friends.currentTakingTo?.email === "global@chat" && e.sendBy !== email) || (friends.currentTakingTo?.email === "anonyms@chat" && e.sendBy !== email)) ? 'received-message' : 'sent-message' }`}
            >
              {e.msg.startsWith("https://firebasestorage.googleapis.com/") ? (
                <img src={e.msg} alt="Uploaded" style={{ maxWidth: "100%", height: "auto" }} />
              ) : (
                <p style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  {friends.currentTakingTo?.email === "global@chat" && (
                    <span style={{ fontSize: "10px", color: "red" }}>{e.sendBy}</span>
                  )}
                  <span>{e.msg}</span>
                </p>
              )}
            </div>
          ))
        )}

        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`chat-message ${msg.email === email ? 'sent-message' : 'received-message'}`}
          >
            {msg.text.startsWith("https://firebasestorage.googleapis.com/") ? (
              <img src={msg.text} alt="Uploaded" style={{ maxWidth: "100%", height: "auto" }} />
            ) : (
              <p style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                {friends.currentTakingTo?.email === "global@chat" && (
                  <span style={{ fontSize: "10px", color: "red" }}>{msg.email}</span>
                )}
                <span>{msg.text}</span>
              </p>
            )}
          </div>
        ))}
        
        {aiError && friends.currentTakingTo?.email === "ai@chat" && <div style={{textAlign:"center" , backgroundColor:"red" , color:"white" , height:"20px" } } className="error-message">{aiError}</div>} 
      </div>

      {takingTo ? (
        <div className="chat-input-container" style={{ position: "relative", bottom: "0" }}>
          <div>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}  
              onChange={(e) => setImg(e.target.files[0])} 
            />
            <button onClick={() => document.getElementById('fileInput').click()}>
              Upload Image
            </button>
          </div>
          <input 
            type="text" 
            value={msg} 
            onChange={(e) => setMsg(e.target.value)} 
          />
          <button onClick={handleSend}>Send</button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default ChatInterface;
