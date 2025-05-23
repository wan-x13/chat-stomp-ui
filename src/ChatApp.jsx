import React, { useState, useEffect } from "react";  
import { Client } from "@stomp/stompjs";  
import SockJS from "sockjs-client";  

const ChatPage = ({ token, username, schoolId , id }) => {  
  const [onlineUsers, setOnlineUsers] = useState([]);  
  const [messages, setMessages] = useState([]);  
  const [currentMessage, setCurrentMessage] = useState("");  
  const [recipient, setRecipient] = useState("");  
  const [unreadCounts, setUnreadCounts] = useState({});  
  const client = React.useRef(null);  
  const [notification, setNotification] = useState([]);

  useEffect(() => {  
    // Initialisation de WebSocket  
    client.current = new Client({  
      brokerURL: "wss://bmlsms-k12-testnet-api.azurewebsites.net/ws",  
      connectHeaders: {  
        Authorization: `Bearer ${token}`,   
        "Portal": "Staff",
           "X-SMS-API-KEY": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"    
      },  
      debug: function (str) {  
        console.log(str);  
      },  
      webSocketFactory: () => new SockJS("https://bmlsms-k12-testnet-api.azurewebsites.net/ws"),  
      onConnect: () => {  
        console.log("WebSocket connecté");  

        
         

        // S'abonner aux messages privés  
        client.current.subscribe(`/user/${username}/private`, (message) => {  
          const data = JSON.parse(message.body);  
          if (Array.isArray(data)) {  
            // Si une liste de messages est reçue (réponse à get-private-messages)  
            setMessages(data);  
          } else {  
            // Si un seul message est reçu (nouveau message)  
            setMessages((prev) => [...prev, data]);  

            // Mettre à jour le compte non lu pour l'expéditeur  
            setUnreadCounts((prev) => ({  
              ...prev,  
              [data.senderId]: (prev[data.senderId] || 0) + 1  
            }));  
          }  
        });  

        client.current.subscribe(`/topic/notifications/edb02584-740f-429c-88df-38983d647ad1`, (message) => {
          const data = JSON.parse(message.body);
          console.log("Notifications :", data);
        }
          )

        // S'abonner aux comptes non lus  
        client.current.subscribe(`/user/${username}/unread-count`, (message) => {  
          const data = JSON.parse(message.body);  
          console.log("unread-count",data);
          const formattedCounts = {};  
          for (const [senderId, count] of Object.entries(data)) {  
            formattedCounts[senderId] = count;  
          }  
          setUnreadCounts(formattedCounts);  
        });  

        // Récupération initiale des utilisateurs en ligne  
        client.current.publish({  
          destination: "/app/online-users",  
          body: JSON.stringify({ schoolId: schoolId }),  
        });  
      },  
      onDisconnect: () => {  
        console.log("WebSocket déconnecté");  
      },  
    });  

    client.current.activate();  

    const fetchOnlineUsers = async () => {  
          try {  
            const response = await fetch(`http://localhost:8080/api/v1/user-messagings/school?schoolId=${schoolId}`, {  
              method: "GET",  
              headers: {  
                "Content-Type": "application/json",  
                Authorization: `Bearer ${token}`,  
                Portal: "Staff" ,
                "X-SMS-API-KEY": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" 
              },  
            });  
            const data = await response.json();  
            setOnlineUsers(data);  
            console.log("Utilisateurs en ligne :", data);  
          } catch (error) {  
            console.error("Erreur lors de la récupération des utilisateurs en ligne :", error);  
          }  
        }

        fetchOnlineUsers(); 

    return () => {  
      client.current.deactivate();  
    };  
  }, [token, schoolId, username]);  

  const getMessagesFunc = (receiverId) => {  
    setRecipient(receiverId);  
    setMessages([]); // Réinitialiser les messages avant de les récupérer  

    client.current.publish({  
      destination: "/app/get-private-messages",   
      body: JSON.stringify({ receiverId: receiverId }),  
    });  

    // Marquer les messages comme lus  
    markMessagesAsRead(receiverId);  
  };  

  const sendMessage = () => {  
    if (!recipient || !currentMessage.trim()) {  
      alert("Veuillez sélectionner un destinataire et saisir un message");  
      return;  
    }  

    // Publier un message privé  
    const messageToSend = {  
      receiverId: recipient,  
      content: currentMessage.trim(),  
    };  

    client.current.publish({  
      destination: "/app/send-private-message",  
      body: JSON.stringify(messageToSend),  
    });  

    // Créer un message local pour l'affichage  
    const localMessage = {  
      id: null, // L'ID sera généré par le backend  
      message: currentMessage.trim(),  
      sentDate: new Date().toISOString(),  
      isRead: false,  
      senderId: username, // Assurez-vous que `username` correspond à l'ID de l'expéditeur  
      receiverName: onlineUsers.find((user) => user.id === recipient)?.username || "",  
      senderName: username,  
      receiverId: recipient,  
      files: "",  
    };  

    setMessages((prev) => [...prev, localMessage]);  
    setCurrentMessage("");  
  };  

  const markMessagesAsRead = (senderId) => {  
    client.current.publish({  
      destination: "/app/mark-as-read",  
      body: JSON.stringify({  
        senderId: senderId,  
        receiverId: username, // Assurez-vous que `username` est l'ID de l'utilisateur receveur  
      }),  
    });  

    // Mettre à jour localement le compte des messages non lus  
    setUnreadCounts((prev) => ({  
      ...prev,  
      [senderId]: 0  
    }));  
  };  

  console.log(messages)  

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
                <button  
                  onClick={() => {  
                    if (user.id === username) return; // Empêcher de cliquer sur soi-même  
                    getMessagesFunc(user.id);  
                  }}  
                >  
                  {user.username === username ? `${username} (Vous)` : user.username}  
                  {unreadCounts[user.id] > 0 && (  
                    <span className="unread-badge">{unreadCounts[user.id]}</span>  
                  )}  
                </button>  
              </li>  
            ))}  
          </ul>  
        </div>  

        {/* Section Chat */}  
        <div style={{ flex: 1 }}>  
          <h3>Chat avec : {recipient ? onlineUsers.find((u) => u.id === recipient)?.username : "Personne"}</h3>  
          <div  
            style={{  
              border: "1px solid black",  
              padding: "10px",  
              height: "300px",  
              overflowY: "auto",  
              // backgroundColor: "#f9f9f9",  
            }}  
          >  
            {messages.length > 0 ? (  
              messages.map((it, index) => (  
                <div key={index} style={{ margin: "10px 0" }}>  
                  <b>{it.senderName} :</b> {it.message}  
                </div>  
              ))  
            ) : (  
              <p>Aucun message. Commencez la conversation !</p>  
            )}  
          </div>  
          <div style={{ marginTop: "10px" }}>  
            <input  
              type="text"  
              value={currentMessage}  
              onChange={(e) => setCurrentMessage(e.target.value)}  
              placeholder="Écrire un message..."  
              style={{ width: "80%", padding: "8px" }}  
            />  
            <button onClick={sendMessage} style={{ padding: "8px 16px", marginLeft: "10px" }}>  
              Envoyer  
            </button>  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
};  

export default ChatPage;