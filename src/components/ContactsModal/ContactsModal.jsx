import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { addNewContact } from "../../firebase/contacts";
import showToast from "../../utils/toast";
import styles from "./ContactsModal.module.css";

const ContactsModal = ({ onClose }) => {
  const { user } = useAuth();
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
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


  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setError("");

    const result = await addNewContact(user.uid, contactName, email);

    if (result.type === "success") {
      showToast("Success", result.message, "success");
      onClose();
    } else if (result.type === "warning") {
      setError(result.message);
      showToast("Warning", result.message, "warning");
    } else {
      setError(result.message);
      showToast("Error", result.message, "error");
    }

    setEmailLoading(false);
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
