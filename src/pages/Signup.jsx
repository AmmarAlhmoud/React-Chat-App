import React, { useState, useEffect } from "react";
import { signUpWithEmail, signInWithGoogle } from "../firebase/auth";
import { useAuth } from "../context/AuthContext";
import { getAuth } from "firebase/auth";
import { ref, set } from "firebase/database";
import { database } from "../firebase/config";
import styles from "./Signup.module.css";

const Signup = () => {
  const { handleLogin, switchToLogin } = useAuth();

  // Separate loading states for signup and Google signup
  const [signupLoading, setSignupLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  // Debug auth state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Auth state changed - displayName:", user.displayName);
      }
    });

    return unsubscribe;
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName.trim() || !lastName.trim()) {
      return "First name and last name are required.";
    }

    if (!email.trim()) {
      return "Email is required.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSignupLoading(true);
    setError("");

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      showToast("Error", validationError, "error");
      setSignupLoading(false);
      return;
    }

    try {
      const result = await signUpWithEmail(formData.email, formData.password);

      if (result.user) {
        const displayName = `${formData.firstName} ${formData.lastName}`;
        try {
          // Save user data in Realtime Database under /users/{uid}
          await set(ref(database, `users/${result.user.uid}`), {
            uid: result.user.uid,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: result.user.email,
            displayName: displayName,
            createdAt: new Date().toISOString(),
          });

          // Optionally update displayName in Firebase Auth profile
          if (typeof result.user.updateProfile === "function") {
            await result.user.updateProfile({ displayName });
            await result.user.reload();
          }

          const auth = getAuth();
          const updatedUser = auth.currentUser;

          showToast("Success", "Account created successfully!", "success");
          handleLogin(updatedUser);
        } catch (updateError) {
          console.error("Error updating profile or saving user:", updateError);
          showToast(
            "Warning",
            "Account created but profile may not be saved",
            "warning"
          );
          handleLogin(result.user);
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      let errorMessage = "Account creation failed. Please try again.";

      // Handle specific Firebase auth errors
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/weak-password":
          errorMessage =
            "Password is too weak. Please choose a stronger password.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email signup is not enabled. Please contact support.";
          break;
        default:
          errorMessage =
            error.message || "Account creation failed. Please try again.";
      }

      setError(errorMessage);
      showToast("Error", errorMessage, "error");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const result = await signInWithGoogle();
      if (
        result.user &&
        !result.user.displayName &&
        result.additionalUserInfo?.profile?.name
      ) {
        try {
          await result.user.updateProfile({
            displayName: result.additionalUserInfo.profile.name,
          });
          await result.user.reload();
          console.log(
            "Google user displayName set to:",
            result.user.displayName
          );
        } catch (updateError) {
          console.error("Error updating Google user profile:", updateError);
        }
      }

      showToast("Success", "Account created with Google!", "success");
      handleLogin(result.user);
    } catch (error) {
      console.error("Google signup error:", error);
      let errorMessage = "Google signup failed. Please try again.";

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Signup cancelled.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup blocked. Please allow popups and try again.";
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        errorMessage =
          "An account already exists with the same email address but different sign-in credentials.";
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

    let icon;
    switch (type) {
      case "success":
        icon = "fas fa-check";
        break;
      case "warning":
        icon = "fas fa-exclamation-triangle";
        break;
      case "error":
        icon = "fas fa-exclamation-circle";
        break;
      default:
        icon = "fas fa-info";
    }

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
    <div className={styles.signupContainer}>
      <div className={styles.signupCard}>
        <div className={styles.signupLogo}>
          <i className="fas fa-user-plus"></i>
        </div>
        <h1 className={styles.signupTitle}>Join ChatApp</h1>
        <p className={styles.signupSubtitle}>
          Create your account and start connecting
        </p>

        {error && (
          <div className={styles.errorMessage}>
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>First Name</label>
              <input
                type="text"
                name="firstName"
                className={styles.formInput}
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={signupLoading}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Last Name</label>
              <input
                type="text"
                name="lastName"
                className={styles.formInput}
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={signupLoading}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input
              type="email"
              name="email"
              className={styles.formInput}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={signupLoading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password</label>
            <input
              type="password"
              name="password"
              className={styles.formInput}
              placeholder="Create a password (min 6 characters)"
              value={formData.password}
              onChange={handleInputChange}
              disabled={signupLoading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className={styles.formInput}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={signupLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={signupLoading || googleLoading}
          >
            {signupLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                Create Account
              </>
            )}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button
          className={styles.btnGoogle}
          onClick={handleGoogleSignup}
          disabled={signupLoading || googleLoading}
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
          <p>Already have an account?</p>
          <button
            type="button"
            className={styles.switchBtn}
            onClick={switchToLogin}
            disabled={signupLoading || googleLoading}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
