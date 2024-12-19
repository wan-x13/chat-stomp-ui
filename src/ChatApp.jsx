import React, { useState, useEffect } from "react";  
import { Client } from "@stomp/stompjs";  
import SockJS from "sockjs-client";  

const ChatPage = ({ token, username , schoolId }) => {  
  const [onlineUsers, setOnlineUsers] = useState([]);  
  const [messages, setMessages] = useState([]);  
  const [currentMessage, setCurrentMessage] = useState("");  
  const [recipient, setRecipient] = useState("");  
  const client = React.useRef(null);  

  console.log("school id is ", schoolId);

  useEffect(() => {  
    // Initialisation de WebSocket  
    client.current = new Client({  
      brokerURL: "ws://localhost:8080/ws",  
      connectHeaders: {  
        Authorization: `Bearer ${token}`,  
      },  
      debug: function (str) {  
        console.log(str);  
      },  
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),  
      onConnect: () => {  
        console.log("WebSocket connected");  

        // S'abonner aux utilisateurs en ligne  
        client.current.subscribe("/topic/online-users/"+schoolId, (message) => {  
          console.log("Received online users:", message.body);  
          setOnlineUsers(JSON.parse(message.body));  
        });  

        // S'abonner aux messages privés  
        client.current.subscribe(`/user/${username}/private`, (message) => {  
          const receivedMessage = JSON.parse(message.body);  
          setMessages((prev) => [...prev, receivedMessage]);  
        });  

        // Récupération initiale des utilisateurs en ligne  
        client.current.publish({  
          destination: "/app/online-users", 
          body: JSON.stringify({schoolId: schoolId}) 
        });  
      },  
      onDisconnect: () => {  
        console.log("WebSocket disconnected");  
      },  
    });  

    client.current.activate();  

    return () => {  
      client.current.deactivate();  
    };  
  }, [token]);  

  const sendMessage = () => {  
    if (!recipient || !currentMessage) {  
      alert("Veuillez sélectionner un destinataire et saisir un message");  
      return;  
    }  

    // Publier un message privé  
    const messageToSend = {  
      receiverId: recipient,  
      content: currentMessage,  
    };  

    client.current.publish({  
      destination: "/app/send-private-message",  
      body: JSON.stringify(messageToSend),  
    });  

    // Créer un message local pour l'affichage  
    const message = {  
      id: null, // L'ID sera généré par le backend  
      content: currentMessage,  
      sentDate: new Date().toISOString(), // Date actuelle  
      isRead: false, // Par défaut, le message n'est pas lu  
      senderId: null, // Vous pouvez ajouter l'ID de l'expéditeur si nécessaire  
      receiverName: onlineUsers.find(user => user.id === recipient)?.username || '',  
      senderName: username,  
      receiverId: recipient,  
      files: [], // Si vous avez des fichiers, gérez-les ici  
    };  

    setMessages((prev) => [...prev, message]);  
    setCurrentMessage("");  
  };  

  return (  
    <div style={{ margin: "20px" }}>  
      <h2>Bienvenue {username}</h2>  

      <div style={{ display: "flex", gap: "20px" }}>  
        {/* Liste des utilisateurs connectés */}  
        <div>  
          <h3>Utilisateurs en ligne</h3>  
          <ul>  
            {onlineUsers.map((user) => (  
              <li key={user.id}>  
                <button onClick={() => setRecipient(user.id)}>  
                  {user.username === username ? `${username} (Vous)` : user.username}  
                </button>  
              </li>  
            ))}  
          </ul>  
        </div>  

        {/* Section Chat */}  
        <div>  
          <h3>Chat avec : {recipient || "Personne"}</h3>  
          <div style={{ border: "1px solid black", padding: "10px", height: "200px", overflowY: "auto" }}>  
            {messages.map((message, index) => (  
              <div key={index} style={{ margin: "10px 0" }}>  
                <b>{message.senderName} :</b> {message.content}  
              </div>  
            ))}  
          </div>  
          <div>  
            <input  
              type="text"  
              value={currentMessage}  
              onChange={(e) => setCurrentMessage(e.target.value)}  
              placeholder="Ecrire un message..."  
            />  
            <button onClick={sendMessage}>Envoyer</button>  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
};  

export default ChatPage;