import  { useState } from "react";  
import axios from "axios";  

const LoginPage = ({ onLoginSuccess }) => {  
  const [username, setUsername] = useState("");  
  const [password, setPassword] = useState("");  
  const [error, setError] = useState(""); 
  


  const handleSubmit = async (e) => {  
    e.preventDefault();  
    try {  
      const response = await axios.post("http://localhost:8080/api/v1/accounts/staffs/login", {  
        username,  
        password  
      }, {
        headers: {
          "Content-Type": "application/json",
          "Portal": "Staff"
        }
      }); 
      
      console.log("data : ", response);

      const { account, school } = await response.data

      console.log(account);

      // Récupérer le token JWT et passer au parent la session utilisateur  
      onLoginSuccess(account.token, username, school.id);  
    } catch (err) {  
      setError("Nom d'utilisateur ou mot de passe incorrect");  
    }  
  };  

  return (  
    <div style={{ margin: "50px auto", maxWidth: "400px" }}>  
      <h2>Login</h2>  
      <form onSubmit={handleSubmit}>  
        <div>  
          <label>Nom d'utilisateur</label>  
          <input  
            type="text"  
            value={username}  
            onChange={(e) => setUsername(e.target.value)}  
            required  
          />  
        </div>  
        <div>  
          <label>Mot de passe</label>  
          <input  
            type="password"  
            value={password}  
            onChange={(e) => setPassword(e.target.value)}  
            required  
          />  
        </div>  
        <button type="submit">Se connecter</button>  
      </form>  
      {error && <p style={{ color: "red" }}>{error}</p>}  
    </div>  
  );  
};  

export default LoginPage;