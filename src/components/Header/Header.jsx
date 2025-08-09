import React from "react";
import styles from "./Header.module.css";

const Header = ({ currentChat, onToggleSidebar }) => {
  // Generate avatar initials - first and last word only
  const getAvatarInitials = (chat) => {
    if (!chat?.contactName) return "?";

    const words = chat.contactName
      .trim()
      .split(" ")
      .filter((word) => word.length > 0);

    if (words.length === 1) {
      // If only one word, take first letter
      return words[0][0].toUpperCase();
    } else if (words.length >= 2) {
      // If two or more words, take first letter of first word and first letter of last word
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }

    return "?";
  };

  // Get contact name or fallback
  const getContactName = () => {
    return currentChat?.contactName || "Unknown Contact";
  };

  // Get online status (you can make this dynamic later)
  const getOnlineStatus = () => {
    // For now, show static status. You can integrate real presence later
    if (!currentChat) return "Offline";

    // You can check lastSeen from currentChat or implement real-time presence
    return "Online";
  };

  // Get last seen text
  const getLastSeenText = () => {
    if (!currentChat) return "";

    const status = getOnlineStatus();
    if (status === "Online") {
      return "Online • Last seen now";
    }

    // You can implement more sophisticated last seen logic here
    if (currentChat.lastSeen) {
      const lastSeenDate = new Date(currentChat.lastSeen);
      const now = new Date();
      const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

      if (diffInMinutes < 1) return "Last seen just now";
      if (diffInMinutes < 60) return `Last seen ${diffInMinutes} minutes ago`;
      if (diffInMinutes < 1440)
        return `Last seen ${Math.floor(diffInMinutes / 60)} hours ago`;
      return `Last seen ${Math.floor(diffInMinutes / 1440)} days ago`;
    }

    return "Last seen recently";
  };

  // Show placeholder if no chat is selected
  if (!currentChat) {
    return (
      <>
        {/* Mobile Header */}
        <div className={styles.mobileHeader}>
          <button className={styles.mobileMenuBtn} onClick={onToggleSidebar}>
            <i className="fas fa-bars"></i>
          </button>
          <div className={styles.chatInfo}>
            <div className={styles.chatName}>Select a chat</div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderLeft}>
            <div className={styles.placeholderAvatar}>
              <i className="fas fa-comments"></i>
            </div>
            <div className={styles.chatHeaderInfo}>
              <h3>Select a conversation</h3>
              <div className={styles.chatHeaderStatus}>
                Choose a contact to start chatting
              </div>
            </div>
          </div>
          <div className={styles.chatHeaderActions}>
            <button className="icon-btn" disabled>
              <i className="fas fa-phone"></i>
            </button>
            <button className="icon-btn" disabled>
              <i className="fas fa-video"></i>
            </button>
            <button className="icon-btn" disabled>
              <i className="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
      </>
    );
  }

  const contactName = getContactName();
  const avatarInitials = getAvatarInitials(currentChat);
  const lastSeenText = getLastSeenText();
  const isOnline = getOnlineStatus() === "Online";

  return (
    <>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <button className={styles.mobileMenuBtn} onClick={onToggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <div className={styles.chatAvatar}>
          {/* Use provided avatar or generate initials */}
          {currentChat.avatar || avatarInitials}
          {isOnline && <div className={styles.onlineIndicator}></div>}
        </div>
        <div className={styles.chatHeaderInfo}>
          <h3>{contactName}</h3>
          <div className={styles.chatHeaderStatus}>{lastSeenText}</div>
        </div>
        <div className={styles.mobileActions}>
          <button className="icon-btn" title="Call">
            <i className="fas fa-phone"></i>
          </button>
          <button className="icon-btn" title="More options">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderLeft}>
          <div className={styles.chatAvatar}>
            {/* Use provided avatar or generate initials */}
            {currentChat.avatar || avatarInitials}
            {isOnline && <div className={styles.onlineIndicator}></div>}
          </div>
          <div className={styles.chatHeaderInfo}>
            <h3>{contactName}</h3>
            <div className={styles.chatHeaderStatus}>{lastSeenText}</div>
          </div>
        </div>

        {/* TODO: make these buttons functional
        <div className={styles.chatHeaderActions}>
          <button className="icon-btn" title="Voice call">
            <i className="fas fa-phone"></i>
          </button>
          <button className="icon-btn" title="Video call">
            <i className="fas fa-video"></i>
          </button>
          <button className="icon-btn" title="Chat info">
            <i className="fas fa-info-circle"></i>
          </button>
          <button className="icon-btn" title="More options">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div> */}
      </div>
    </>
  );
};

export default Header;
