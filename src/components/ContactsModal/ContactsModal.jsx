import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./ContactsModal.module.css";

const ContactsModal = ({ onClose }) => {
  const { theme, toggleTheme, handleLogout, user } = useAuth();
  const [email, setEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    showToast("Success", "Contact added successfully");
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Contacts</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Contact Name</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Enter contact name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              disabled={emailLoading}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input
              type="email"
              className={styles.formInput}
              placeholder="Enter contact email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailLoading}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={emailLoading}
          >
            {emailLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Adding...
              </>
            ) : (
              <>
                <i className="fas fa-plus"></i>
                Add
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactsModal;
