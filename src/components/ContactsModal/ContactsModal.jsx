import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { addNewContact } from "../../firebase/contacts";
import { generateInitials } from "../../utils/helpers";
import showToast from "../../utils/toast";
import styles from "./ContactsModal.module.css";

const ContactsModal = ({ onClose, onContactAdded }) => {
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

    // Validate inputs
    if (!contactName.trim()) {
      setError("Contact name is required");
      setEmailLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      setEmailLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      setEmailLoading(false);
      return;
    }

    const avatar = generateInitials(contactName);

    try {
      const result = await addNewContact(
        user.uid,
        contactName.trim(),
        email.trim().toLowerCase(),
        avatar
      );

      if (result.type === "success") {
        showToast("Success", result.message, "success");

        // Clear form
        setContactName("");
        setEmail("");

        // Notify parent component about the new contact
        if (onContactAdded) {
          onContactAdded({
            chatId: result.chatId,
            contactUserId: result.contactUserId,
            contactName: contactName.trim(),
            contactEmail: email.trim().toLowerCase(),
            avatar: avatar,
          });
        }

        onClose();
      } else if (result.type === "warning") {
        setError(result.message);
        showToast("Warning", result.message, "warning");
      } else {
        setError(result.message);
        showToast("Error", result.message, "error");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      showToast("Error", errorMessage, "error");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <i className="fas fa-user-plus"></i> Add New Contact
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <i className="fas fa-user"></i>
              Contact Name
            </label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Enter contact name"
              value={contactName}
              onChange={handleInputChange(setContactName)}
              disabled={emailLoading}
              required
              maxLength={50}
            />
            {contactName && (
              <div className={styles.avatarPreview}>
                <span className={styles.avatarCircle}>
                  {generateInitials(contactName)}
                </span>
                <small>Avatar preview</small>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <i className="fas fa-envelope"></i>
              Email Address
            </label>
            <input
              type="email"
              className={styles.formInput}
              placeholder="Enter contact email"
              value={email}
              onChange={handleInputChange(setEmail)}
              disabled={emailLoading}
              required
            />
          </div>

          <div className={styles.modalActions}>
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
                  Add Contact
                </>
              )}
            </button>
          </div>
        </form>

        <div className={styles.modalFooter}>
          <small className={styles.helpText}>
            <i className="fas fa-info-circle"></i>
            The contact must have an account with this email address.
          </small>
        </div>
      </div>
    </div>
  );
};

export default ContactsModal;
