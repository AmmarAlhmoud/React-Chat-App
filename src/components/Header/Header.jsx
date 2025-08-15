import React, { useState, useRef, useEffect } from "react";
import { generateInitials } from "../../utils/helpers";
import {
  useContactsPresence,
  getPresenceStatus,
  formatLastSeenTime,
} from "../../hooks/usePresence";
import ConfirmationModal from "./ConfirmationModal";
import styles from "./Header.module.css";

const Header = ({
  currentChat,
  onToggleSidebar,
  onContactRenamed,
  onChatCleared,
  onContactDeleted,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [localContactName, setLocalContactName] = useState(
    currentChat?.contactName || ""
  );

  const contactIds =
    currentChat && !currentChat.isSelfChat && currentChat.contactUserId
      ? [currentChat.contactUserId]
      : [];
  const presenceStatuses = useContactsPresence(contactIds);

  const dropdownRef = useRef(null);

  useEffect(() => {
    setLocalContactName(currentChat?.contactName || "");
  }, [currentChat?.contactName]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
    };
    const handleEsc = (e) => e.key === "Escape" && setIsDropdownOpen(false);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const getOnlineStatus = () => {
    if (!currentChat) return "Offline";
    if (currentChat.isSelfChat) return "Online";
    return getPresenceStatus(currentChat.contactUserId, presenceStatuses)
      .status;
  };

  const getLastSeenText = () => {
    if (!currentChat) return "";
    if (currentChat.isSelfChat) return "Messages to yourself";
    const presence = getPresenceStatus(
      currentChat.contactUserId,
      presenceStatuses
    );
    return presence.isOnline
      ? "Online"
      : `Last seen ${formatLastSeenTime(presence.lastSeen)}`;
  };

  const avatarInitials = generateInitials(localContactName);
  const isOnline = getOnlineStatus() === "Online";

  const openModal = (type) => {
    if (!currentChat) return;
    if (currentChat.isSelfChat && type === "delete") return;
    setModalType(type);
    setIsDropdownOpen(false);
  };

  const closeModal = () => setModalType(null);

  const handleModalAction = (data) => {
    if (modalType === "rename" && data?.newContactName) {
      setLocalContactName(data.newContactName);
      onContactRenamed?.({ ...data, chatId: currentChat.chatId });
    }
    if (modalType === "clear") onChatCleared?.(currentChat.chatId);
    if (modalType === "delete") onContactDeleted?.(currentChat.contactUserId);
  };

  return (
    <>
      <div className={styles.chatHeader}>
        <button
          className={styles.mobileMenuBtn}
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <i className="fas fa-bars"></i>
        </button>
        <div className={styles.chatHeaderLeft}>
          <div className={styles.chatAvatar}>
            {currentChat?.avatar || avatarInitials}
            {currentChat && isOnline && (
              <div className={styles.onlineIndicator}></div>
            )}
          </div>
          <div className={styles.chatHeaderInfo}>
            <h3>{currentChat ? localContactName : "Select a contact"}</h3>
            <div
              className={`${styles.chatHeaderStatus} ${
                isOnline ? styles.onlineStatus : styles.offlineStatus
              }`}
            >
              {currentChat ? getLastSeenText() : "Start chatting"}
            </div>
          </div>
        </div>

        {currentChat && (
          <div className={styles.chatHeaderActions}>
            <div className={styles.dropdownContainer} ref={dropdownRef}>
              <button
                className={`${styles.iconBtn} ${
                  isDropdownOpen ? styles.active : ""
                }`}
                title="More options"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <i className="fas fa-ellipsis-v"></i>
              </button>
              {isDropdownOpen && (
                <div className={styles.dropdown}>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => openModal("rename")}
                  >
                    <i className="fas fa-edit"></i> Rename Contact
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => openModal("clear")}
                  >
                    <i className="fas fa-broom"></i> Clear Chat History
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => openModal("delete")}
                    disabled={currentChat.isSelfChat}
                  >
                    <i className="fas fa-trash"></i> Delete Contact
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {modalType && currentChat && (
        <ConfirmationModal
          currentChat={currentChat}
          onClose={closeModal}
          onAction={handleModalAction}
          type={modalType}
        />
      )}
    </>
  );
};

export default Header;
