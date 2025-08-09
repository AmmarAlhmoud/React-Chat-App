import React from "react";
import styles from "./Message.module.css";

const Message = ({ message, showReadStatus = false, showAvatar = false }) => {
  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    if (!timestamp) return message.time || "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Show time if message is from today
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      // Show "Yesterday" if message is from yesterday
      return "Yesterday";
    } else if (diffInHours < 168) {
      // 7 days
      // Show day name if message is from this week
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      // Show date if message is older
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Get read status icon
  const getReadStatusIcon = () => {
    if (!showReadStatus || message.type !== "sent") return null;

    // Check if message has readBy field (new structure)
    if (message.readBy) {
      const readByUsers = Object.values(message.readBy).filter(
        (readTime) => readTime !== null
      );
      const allRead =
        Object.keys(message.readBy).length > 1 &&
        readByUsers.length === Object.keys(message.readBy).length;

      return (
        <span
          className={`${styles.readStatus} ${
            allRead ? styles.read : styles.sent
          }`}
        >
          {allRead ? (
            <i className="fas fa-check-double" title="Read"></i>
          ) : (
            <i className="fas fa-check" title="Sent"></i>
          )}
        </span>
      );
    }

    // Fallback to old readStatus field
    const isRead = message.readStatus === "read";
    return (
      <span
        className={`${styles.readStatus} ${isRead ? styles.read : styles.sent}`}
      >
        {isRead ? (
          <i className="fas fa-check-double" title="Read"></i>
        ) : (
          <i className="fas fa-check" title="Sent"></i>
        )}
      </span>
    );
  };

  // Get message status text for screen readers
  const getStatusText = () => {
    if (message.type === "sent" && message.readBy) {
      const readByUsers = Object.values(message.readBy).filter(
        (readTime) => readTime !== null
      );
      const allRead =
        Object.keys(message.readBy).length > 1 &&
        readByUsers.length === Object.keys(message.readBy).length;
      return allRead ? "Read" : "Sent";
    }
    return message.readStatus === "read" ? "Read" : "Sent";
  };

  const displayTime = formatTime(message.timestamp);

  return (
    <div className={`${styles.message} ${styles[message.type]}`}>
      {showAvatar && message.type === "received" && (
        <div
          className={styles.messageAvatar}
          title={message.senderName || "Contact"}
        >
          {message.avatar || "?"}
        </div>
      )}

      <div className={styles.messageBubble}>
        <div className={styles.messageContent}>
          <div className={styles.messageText}>{message.text}</div>
          <div className={styles.messageMetadata}>
            <span className={styles.messageTime}>{displayTime}</span>
            {getReadStatusIcon()}
            <span className={styles.srOnly}>
              Message {message.type} at {displayTime}
              {showReadStatus &&
                message.type === "sent" &&
                `, ${getStatusText()}`}
            </span>
          </div>
        </div>
      </div>

      {message.timestamp && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipContent}>
            {new Date(message.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
