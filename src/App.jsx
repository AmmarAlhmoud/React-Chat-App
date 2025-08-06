import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { AuthProvider, signOut } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [isSignupMode, setIsSignupMode] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      // Save login state to localStorage
      if (user) {
        localStorage.setItem("chatapp_logged_in", "true");
      } else {
        localStorage.removeItem("chatapp_logged_in");
      }
    });

    // Load saved theme
    const savedTheme = localStorage.getItem("chatapp_theme");
    if (savedTheme === "dark") {
      setTheme("dark");
      document.body.setAttribute("data-theme", "dark");
    }

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = (firebaseUser) => {
    setUser(firebaseUser);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // The onAuthStateChanged listener will handle updating the state
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    if (newTheme === "dark") {
      document.body.setAttribute("data-theme", "dark");
    } else {
      document.body.removeAttribute("data-theme");
    }

    localStorage.setItem("chatapp_theme", newTheme);
  };

  const switchToSignup = () => {
    setIsSignupMode(true);
  };

  const switchToLogin = () => {
    setIsSignupMode(false);
  };

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="App">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <i
            className="fas fa-spinner fa-spin"
            style={{ fontSize: "2rem" }}
          ></i>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider
      value={{
        user,
        isLoggedIn: !!user,
        theme,
        toggleTheme,
        handleLogin,
        handleLogout,
        switchToSignup,
        switchToLogin,
        isSignupMode,
      }}
    >
      <div className="App">
        {user ? (
          <Chat
            onLogout={handleLogout}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        ) : isSignupMode ? (
          <Signup />
        ) : (
          <Login />
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
