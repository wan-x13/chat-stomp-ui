import { useState } from 'react';
import './App.css'
import ChatPage from './ChatApp';
import LoginPage from './loginPage';

function App() {
 

  const [isAuthenticated, setIsAuthenticated] = useState(false);  
  const [token, setToken] = useState("");  
  const [username, setUsername] = useState("");
  const [schoolId , setSchoolId] = useState("");
  const [id , setId] = useState("");

  const handleLoginSuccess = (token, username, schoolId, id) => {  
    setToken(token);  
    setUsername(username);  
    setIsAuthenticated(true);  
    setSchoolId(schoolId);
    setId(id);
  };  

  console.log("token is app ", token);

  return (  
    <div>  
      {isAuthenticated ? (  
        <ChatPage token={token} username={username} schoolId={schoolId} id={id}/>  
      ) : (  
        <LoginPage onLoginSuccess={handleLoginSuccess} />  
      )}  
    </div>  
  );  
}

export default App
