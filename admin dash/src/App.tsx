// The exported code uses standard Tailwind CSS. Ensure Tailwind is properly configured in your React app.
import React, { useState } from 'react';
import Login_SignUp from './Login_SignUp.tsx';
import Home from './Home.tsx';
import 'leaflet/dist/leaflet.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <div>
      {isAuthenticated ? (
        <Home onLogout={handleLogout}/>
      ) : (
        <Login_SignUp onLogin={handleLogin} />
        
      )}
    </div>
  );
}

export default App;
