import React, { useState, useRef, useEffect } from "react";
import { generateInitials } from "./../../utils/helpers";
import {
  useContactsPresence,
  getPresenceStatus,
  formatLastSeenTime,
} from "./../../hooks/useUserPresence";
import RenameContactModal from "./RenameContactModal";
import styles from "./Header.module.css";

const Header = ({
  currentChat,
  onToggleSidebar,
  onContactRenamed,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get contact IDs for presence tracking
  const contactIds =
    currentChat && !currentChat.isSelfChat && currentChat.contactUserId
      ? [currentChat.contactUserId]
      : [];

  // Use the custom hook to get presence status
  const presenceStatuses = useContactsPresence(contactIds);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Get contact name or fallback
  const getContactName = () => {
    return currentChat?.contactName || "Unknown Contact";
  };

  // Get online status
  const getOnlineStatus = () => {
    if (!currentChat) return "Offline";

    // For self chats, always show as online
    if (currentChat.isSelfChat) return "Online";

    // Get presence status using the helper function
    const presenceStatus = getPresenceStatus(
      currentChat.contactUserId,
      presenceStatuses
    );
    return presenceStatus.status;
  };

  // Get last seen text
  const getLastSeenText = () => {
    if (!currentChat) return "";

    // For self chats
    if (currentChat.isSelfChat) {
      return "Messages to yourself";
    }

    // Get presence status using the helper function
    const presenceStatus = getPresenceStatus(
      currentChat.contactUserId,
      presenceStatuses
    );

    if (presenceStatus.isOnline) {
      return "Online";
    } else {
      const lastSeenText = formatLastSeenTime(presenceStatus.lastSeen);
      return `Last seen ${lastSeenText}`;
    }
  };

  // TODO: add typing indicator
  const getTypingStatus = () => {
    return null;
  };

  // Handle dropdown toggle
  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle rename contact
  const handleRenameContact = () => {
    if (!currentChat || currentChat.isSelfChat) return;

    setIsRenameModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleModalClose = () => {
    setIsRenameModalOpen(false);
  };

  // Handle contact renamed
  const handleContactRenamed = (renameData) => {
    // Pass the rename data to parent component if callback is provided
    if (onContactRenamed) {
      onContactRenamed(renameData);
    }
    setIsRenameModalOpen(false);
  };

  // Show nothing if no chat is selected
  if (!currentChat) {
    return <></>;
  }

  const contactName = getContactName();
  const avatarInitials = generateInitials(currentChat?.contactName);
  const lastSeenText = getLastSeenText();
  const isOnline = getOnlineStatus() === "Online";
  const typingStatus = getTypingStatus();

  return (
    <>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <button className={styles.mobileMenuBtn} onClick={onToggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <div className={styles.chatAvatar}>
          {currentChat.avatar || avatarInitials}
          {isOnline && <div className={styles.onlineIndicator}></div>}
        </div>
        <div className={styles.chatHeaderInfo}>
          <h3>{contactName}</h3>
          <div
            className={`${styles.chatHeaderStatus} ${
              isOnline ? styles.onlineStatus : styles.offlineStatus
            }`}
          >
            {typingStatus || lastSeenText}
          </div>
        </div>
        <div className={styles.mobileActions}>
          <button className={`${styles.iconBtn} icon-btn`} title="Call">
            <i className="fas fa-phone"></i>
          </button>
          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
              className={`${styles.iconBtn} icon-btn ${
                isDropdownOpen ? styles.active : ""
              }`}
              title="More options"
              onClick={handleDropdownToggle}
            >
              <i className="fas fa-ellipsis-v"></i>
            </button>
            {isDropdownOpen && (
              <div className={styles.dropdown}>
                <button
                  className={styles.dropdownItem}
                  onClick={handleRenameContact}
                  disabled={currentChat.isSelfChat}
                >
                  <i className="fas fa-edit"></i>
                  Rename Contact
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderLeft}>
          <div className={styles.chatAvatar}>
            {currentChat.avatar || avatarInitials}
            {isOnline && <div className={styles.onlineIndicator}></div>}
          </div>
          <div className={styles.chatHeaderInfo}>
            <h3>{contactName}</h3>
            <div
              className={`${styles.chatHeaderStatus} ${
                isOnline ? styles.onlineStatus : styles.offlineStatus
              }`}
            >
              {typingStatus || lastSeenText}
            </div>
          </div>
        </div>

        <div className={styles.chatHeaderActions}>
          {/* TODO: add new feature in the future */}
          {/* <button className={`${styles.iconBtn} icon-btn`} title="Voice call">
            <i className="fas fa-phone"></i>
          </button>
          <button className={`${styles.iconBtn} icon-btn`} title="Video call">
            <i className="fas fa-video"></i>
          </button>
          <button className={`${styles.iconBtn} icon-btn`} title="Chat info">
            <i className="fas fa-info-circle"></i>
          </button> */}
          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
              className={`${styles.iconBtn} icon-btn ${
                isDropdownOpen ? styles.active : ""
              }`}
              title="More options"
              onClick={handleDropdownToggle}
            >
              <i className="fas fa-ellipsis-v"></i>
            </button>
            {isDropdownOpen && (
              <div className={styles.dropdown}>
                <button
                  className={styles.dropdownItem}
                  onClick={handleRenameContact}
                  disabled={currentChat.isSelfChat}
                >
                  <i className="fas fa-edit"></i>
                  Rename Contact
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isRenameModalOpen && (
        <RenameContactModal
          currentChat={currentChat}
          onClose={handleModalClose}
          onContactRenamed={handleContactRenamed}
        />
      )}
    </>
  );
};

export default Header;
