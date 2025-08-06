import React, { useState } from "react";
import { signInWithEmail, signInWithGoogle } from "../firebase/auth";
import { useAuth } from "../context/AuthContext";
import styles from "./Login.module.css";

const Login = () => {
  const { handleLogin, switchToSignup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setError("");

    try {
      const result = await signInWithEmail(email, password);
      showToast("Success", "Logged in successfully!", "success");
      handleLogin(result.user);
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";

      // Handle specific Firebase auth errors
      switch (error.code) {
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Try again later.";
          break;
        default:
          errorMessage = error.message || "Login failed. Please try again.";
      }

      setError(errorMessage);
      showToast("Error", errorMessage, "error");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const result = await signInWithGoogle();
      showToast("Success", "Logged in with Google!", "success");
      handleLogin(result.user);
    } catch (error) {
      console.error("Google login error:", error);
      let errorMessage = "Google login failed. Please try again.";

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Login cancelled.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup blocked. Please allow popups and try again.";
      }

      setError(errorMessage);
      showToast("Error", errorMessage, "error");
    } finally {
      setGoogleLoading(false);
    }
  };

  const showToast = (title, message, type = "success") => {
    const toastContainer =
      document.querySelector(".toast-container") || createToastContainer();
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon =
      type === "success" ? "fas fa-check" : "fas fa-exclamation-triangle";

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="${icon}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "toastSlide 0.3s ease reverse";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const createToastContainer = () => {
    const container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
    return container;
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>
          <i className="fas fa-comments"></i>
        </div>
        <h1 className={styles.loginTitle}>Welcome to ChatApp</h1>
        <p className={styles.loginSubtitle}>Connect with your team instantly</p>

        {error && (
          <div className={styles.errorMessage}>
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input
              type="email"
              className={styles.formInput}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailLoading || googleLoading}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password</label>
            <input
              type="password"
              className={styles.formInput}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={emailLoading || googleLoading}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={emailLoading || googleLoading}
          >
            {emailLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Signing In...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button
          className={styles.btnGoogle}
          onClick={handleGoogleLogin}
          disabled={emailLoading || googleLoading}
        >
          {googleLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Connecting...
            </>
          ) : (
            <>
              <i className="fab fa-google"></i>
              Continue with Google
            </>
          )}
        </button>

        <div className={styles.switchAuth}>
          <p>Don't have an account?</p>
          <button
            type="button"
            className={styles.switchBtn}
            onClick={switchToSignup}
            disabled={emailLoading || googleLoading}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
