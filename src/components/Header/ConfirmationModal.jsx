import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  updateContactName,
  clearChatHistory,
  deleteContact,
} from "../../firebase/chatService";
import { useAuth } from "../../context/AuthContext";
import { generateInitials } from "../../utils/helpers";
import showToast from "../../utils/toast";
import styles from "./ConfirmationModal.module.css";

const ConfirmationModal = ({ currentChat, onClose, onAction, type }) => {
  const { user } = useAuth();
  const [contactName, setContactName] = useState(
    currentChat?.contactName || ""
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e) => {
    setContactName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (type === "rename") {
        const inputStripped = contactName.replace(/\s*\(You\)$/, "").trim();
        const originalStripped = currentChat.contactName
          .replace(/\s*\(You\)$/, "")
          .trim();

        if (!inputStripped) {
          showToast("Error", "Contact name is required", "error");
          setIsProcessing(false);
          return;
        }

        if (inputStripped === originalStripped) {
          showToast("Warning", "Please enter a different name", "warning");
          setIsProcessing(false);
          return;
        }

        const finalName = currentChat.isSelfChat
          ? `${inputStripped} (You)`
          : inputStripped;

        await updateContactName(user.uid, currentChat.contactUserId, finalName);
        showToast("Success", "Contact renamed successfully", "success");
        onAction?.({ newContactName: finalName });
      }

      if (type === "clear") {
        // Optimistically update chat state
        onAction?.({ cleared: true });

        await clearChatHistory(currentChat.chatId, user.uid);
        showToast("Success", "Chat history cleared", "success");
      }

      if (type === "delete") {
        await deleteContact(
          user.uid,
          currentChat.contactUserId,
          currentChat.chatId
        );
        showToast("Success", "Contact deleted successfully", "success");
        onAction?.({ deleted: true });
      }

      onClose();
    } catch (err) {
      console.error(err);
      showToast("Error", err.message || "An error occurred", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const displayName = contactName.replace(/\s*\(You\)$/, "");
  const initials = generateInitials(contactName);

  const modalContent = (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {type === "rename" && (
              <>
                <i className="fas fa-edit"></i> Rename Contact
              </>
            )}
            {type === "clear" && (
              <>
                <i className="fas fa-broom"></i> Clear Chat History
              </>
            )}
            {type === "delete" && (
              <>
                <i className="fas fa-user-times"></i> Delete Contact
              </>
            )}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className={styles.modalForm}>
          {type === "rename" && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <i className="fas fa-user"></i> Contact Name
              </label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Enter new contact name"
                value={displayName}
                onChange={handleInputChange}
                disabled={isProcessing}
                maxLength={50}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit(e);
                }}
              />
              {displayName && (
                <div className={styles.avatarPreview}>
                  <span className={styles.avatarCircle}>{initials}</span>
                  <small>New avatar preview</small>
                </div>
              )}
            </div>
          )}

          {(type === "clear" || type === "delete") && (
            <div className={styles.formGroup}>
              <p>
                {type === "clear"
                  ? "Clearing all messages will remove the chat history for both users and cannot be undone. Do you want to continue?"
                  : "Are you sure you want to delete this contact? This will also remove the chat history."}
              </p>
            </div>
          )}

          <div className={styles.modalActions}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Processing...
                </>
              ) : type === "rename" ? (
                <>
                  <i className="fas fa-save"></i> Save Changes
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i> Confirm
                </>
              )}
            </button>
          </div>
        </div>

        {type === "rename" && (
          <div className={styles.modalFooter}>
            <small className={styles.helpText}>
              <i className="fas fa-info-circle"></i> This will only change how
              the contact appears to you. Their actual name won't be affected.
            </small>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.getElementById("modal-root"));
};

export default ConfirmationModal;
