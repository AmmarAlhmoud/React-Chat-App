import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Chat from './pages/Chat';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check if user is logged in
    const savedLoginState = localStorage.getItem('chatapp_logged_in');
    if (savedLoginState) {
      setIsLoggedIn(true);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('chatapp_theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.body.setAttribute('data-theme', 'dark');
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('chatapp_logged_in', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('chatapp_logged_in');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (newTheme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
    
    localStorage.setItem('chatapp_theme', newTheme);
  };

  return (
    <AuthProvider value={{ isLoggedIn, theme, toggleTheme, handleLogin, handleLogout }}>
      <div className="App">
        {isLoggedIn ? (
          <Chat onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
    </AuthProvider>
  );
}

export default App;