import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import showToast from "../../utils/toast";
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

  const modalContent = (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <i className="fas fa-cog"></i> Settings
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className={styles.settingsSection}>
          <h3>
            <i className="fas fa-palette"></i> Appearance
          </h3>
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
            >
              <div className={styles.toggleSlider}></div>
            </div>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <h3>
            <i className="fas fa-user"></i> Account
          </h3>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h4>Profile</h4>
              <div className={styles.settingDescription}>
                <i className="fas fa-envelope"></i> {user?.email || "No email"}
              </div>
            </div>
          </div>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h4>Status</h4>
              <div className={styles.settingDescription}>
                <span className={styles.statusOnline}>
                  <i className="fas fa-circle"></i> Online
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <button
            className={`btn btn-danger ${styles.logoutBtn}`}
            onClick={handleLogoutClick}
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.getElementById("modal-root"));
};

export default SettingsModal;
