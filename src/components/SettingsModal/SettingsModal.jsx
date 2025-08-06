import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./SettingsModal.module.css";

const SettingsModal = ({ onClose }) => {
  const { theme, toggleTheme, handleLogout, user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.classList.contains(styles.modalOverlay)) {
        onClose();
      }
    };

    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  const handleThemeToggle = () => {
    toggleTheme();
    showToast(
      "Theme",
      theme === "light" ? "Switched to dark mode" : "Switched to light mode",
      "success"
    );
  };

  const handleLogoutClick = () => {
    handleLogout();
    showToast("Success", "Logged out successfully!", "success");
  };

  const showToast = (title, message, type = "success") => {
    const toastContainer =
      document.querySelector(".toast-container") || createToastContainer();
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas fa-check"></i>
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
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Settings</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className={styles.settingsSection}>
          <h3>Appearance</h3>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h4>Dark Mode</h4>
              <div className={styles.settingDescription}>
                Switch between light and dark themes
              </div>
            </div>
            <div
              className={`${styles.toggleSwitch} ${
                theme === "dark" ? styles.active : ""
              }`}
              onClick={handleThemeToggle}
            ></div>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <h3>Account</h3>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h4>Profile</h4>
              <div className={styles.settingDescription}>
                {user?.email || "No email"}
              </div>
            </div>
          </div>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h4>Status</h4>
              <div className={styles.settingDescription}>Online</div>
            </div>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <button
            className={`btn btn-primary ${styles.logoutBtn}`}
            onClick={handleLogoutClick}
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
