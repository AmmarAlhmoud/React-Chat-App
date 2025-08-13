import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { updateContactName } from "../../firebase/chatService";
import { generateInitials } from "../../utils/helpers";
import showToast from "../../utils/toast";
import styles from "./RenameContactModal.module.css";

const RenameContactModal = ({ onClose, currentChat, onContactRenamed }) => {
  const { user } = useAuth();
  const [contactName, setContactName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState("");

  // Initialize with current contact name
  useEffect(() => {
    if (currentChat?.contactName) {
      setContactName(currentChat.contactName);
    }
  }, [currentChat]);

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
    setIsRenaming(true);
    setError("");

    // Validate inputs
    if (!contactName.trim()) {
      setError("Contact name is required");
      setIsRenaming(false);
      return;
    }

    // Check if name actually changed
    if (contactName.trim() === currentChat?.contactName) {
      setError("Please enter a different name");
      setIsRenaming(false);
      return;
    }

    try {
      const result = await updateContactName(
        user.uid,
        currentChat.contactUserId,
        contactName.trim()
      );

      if (result.type === "success") {
        showToast("Success", result.message, "success");

        // Notify parent component about the name change
        if (onContactRenamed) {
          onContactRenamed({
            contactUserId: currentChat.contactUserId,
            newContactName: contactName.trim(),
            newAvatar: generateInitials(contactName.trim()),
          });
        }

        onClose();
      } else {
        setError(result.message);
        showToast("Error", result.message, "error");
      }
    } catch (error) {
      console.error("Error renaming contact:", error);
      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      showToast("Error", errorMessage, "error");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleInputChange = (e) => {
    setContactName(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  // Don't render if no current chat or it's a self chat
  if (!currentChat || currentChat.isSelfChat) {
    return null;
  }

  const modalContent = (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <i className="fas fa-edit"></i> Rename Contact
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <i className="fas fa-user"></i>
              Contact Name
            </label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Enter new contact name"
              value={contactName}
              onChange={handleInputChange}
              disabled={isRenaming}
              maxLength={50}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(e);
                }
              }}
            />
            {contactName && (
              <div className={styles.avatarPreview}>
                <span className={styles.avatarCircle}>
                  {generateInitials(contactName)}
                </span>
                <small>New avatar preview</small>
              </div>
            )}
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={
                isRenaming ||
                !contactName.trim() ||
                contactName.trim() === currentChat?.contactName
              }
            >
              {isRenaming ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Renaming...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <small className={styles.helpText}>
            <i className="fas fa-info-circle"></i>
            This will only change how the contact appears to you. Their actual
            name won't be affected.
          </small>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.getElementById("modal-root"));
};

export default RenameContactModal;
