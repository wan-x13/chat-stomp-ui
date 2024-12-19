import { useState } from 'react';
import './App.css'
import ChatPage from './ChatApp';
import LoginPage from './loginPage';

function App() {
 

  const [isAuthenticated, setIsAuthenticated] = useState(false);  
  const [token, setToken] = useState("");  
  const [username, setUsername] = useState("");
  const [schoolId , setSchoolId] = useState("");

  const handleLoginSuccess = (token, username, schoolId) => {  
    setToken(token);  
    setUsername(username);  
    setIsAuthenticated(true);  
    setSchoolId(schoolId);
  };  

  console.log("token is app ", token);

  return (  
    <div>  
      {isAuthenticated ? (  
        <ChatPage token={token} username={username} schoolId={schoolId}/>  
      ) : (  
        <LoginPage onLoginSuccess={handleLoginSuccess} />  
      )}  
    </div>  
  );  
}

export default App
