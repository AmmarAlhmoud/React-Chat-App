import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
} from "../../firebase/contacts";
import Header from "../Header/Header";
import Message from "../Message/Message";
import MessageInput from "../MessageInput/MessageInput";
import TypingIndicator from "../TypingIndicator/TypingIndicator";
import styles from "./ChatWindow.module.css";

const ChatWindow = ({ currentChat, onToggleSidebar }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load messages when currentChat changes
  useEffect(() => {
    if (!user || !currentChat?.chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to messages
    const unsubscribe = getChatMessages(currentChat.chatId, (messagesList) => {
      setMessages(messagesList);
      setLoading(false);
    });

    // Mark messages as read when viewing the chat
    markMessagesAsRead(currentChat.chatId, user.uid).catch((err) => {
      console.error("Error marking messages as read:", err);
    });

    // Cleanup subscription
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, currentChat?.chatId]);

  // Send message function
  const handleSendMessage = async (messageText) => {
    if (!user || !currentChat?.chatId || !messageText.trim()) return;

    const senderName =
      user.displayName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "Unknown User";

    try {
      const result = await sendMessage(
        currentChat.chatId,
        user.uid,
        senderName,
        messageText.trim(),
        "text"
      );

      if (!result.success) {
        setError("Failed to send message. Please try again.");
      }
    } catch (error) {
      setError("Failed to send message. Please try again.");
    } finally {
      // Hide typing indicator after a brief delay
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  // Transform messages for display with proper type detection
  const getDisplayMessages = () => {
    return messages.map((message) => {
      const isFromCurrentUser = message.senderId === user.uid;
      const messageType = isFromCurrentUser ? "sent" : "received";

      // Determine read status based on readBy field
      const isRead = message.readBy && message.readBy[user.uid];
      const readStatus = isRead ? "read" : "unread";

      // Generate avatar for received messages using current chat info
      const avatar =
        !isFromCurrentUser && currentChat?.avatar ? currentChat.avatar : null;

      return {
        ...message,
        type: messageType,
        readStatus,
        avatar,
        time: new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });
  };

  // Filter messages by type and read status
  const filterMessages = (filterType = "all", readStatus = "all") => {
    const displayMessages = getDisplayMessages();

    return displayMessages.filter((message) => {
      const typeMatch = filterType === "all" || message.type === filterType;
      const readMatch =
        readStatus === "all" || message.readStatus === readStatus;
      return typeMatch && readMatch;
    });
  };

  // Get message statistics
  const getMessageCounts = () => {
    const displayMessages = getDisplayMessages();
    return {
      total: displayMessages.length,
      sent: displayMessages.filter((m) => m.type === "sent").length,
      received: displayMessages.filter((m) => m.type === "received").length,
      unread: displayMessages.filter((m) => m.readStatus === "unread").length,
      read: displayMessages.filter((m) => m.readStatus === "read").length,
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.chatMain}>
        <Header currentChat={currentChat} onToggleSidebar={onToggleSidebar} />
        <div className={styles.messagesContainer}>
          <div className={styles.loading}>Loading messages...</div>
        </div>
        <MessageInput onSendMessage={handleSendMessage} disabled />
      </div>
    );
  }

  const displayMessages = getDisplayMessages();
  const stats = getMessageCounts();

  // No chat selected state
  if (!currentChat) {
    return (
      <div className={styles.chatMain}>
        <div className={styles.messagesContainer}>
          <div className={styles.noChatSelected}>
            Select a contact to start chatting
          </div>
        </div>
      </div>
    );
  }

  if (currentChat) {
    return (
      <div className={styles.chatMain}>
        <Header currentChat={currentChat} onToggleSidebar={onToggleSidebar} />
        <div className={styles.messagesContainer}>
          {displayMessages.length === 0 ? (
            <div className={styles.noMessages}>
              <p>No messages yet.</p>
              <p>Send a message to start the conversation!</p>
            </div>
          ) : (
            displayMessages.map((message) => (
              <Message
                key={message.id}
                message={message}
                showReadStatus={message.type === "sent"}
                showAvatar={message.type === "received"}
              />
            ))
          )}
        </div>
        <MessageInput onSendMessage={handleSendMessage} />

        {/* TODO: info - remove in production
        {process.env.NODE_ENV === "development" && (
          <div className={styles.debugInfo}>
            <p>
              Chat ID: {currentChat.chatId} | Total: {stats.total} | Sent:{" "}
              {stats.sent} | Received: {stats.received} | Unread: {stats.unread}
            </p>
            <div className={styles.filterButtons}>
              <button onClick={() => console.log("All:", filterMessages())}>
                All
              </button>
              <button
                onClick={() => console.log("Sent:", filterMessages("sent"))}
              >
                Sent Only
              </button>
              <button
                onClick={() =>
                  console.log("Received:", filterMessages("received"))
                }
              >
                Received Only
              </button>
              <button
                onClick={() =>
                  console.log("Unread:", filterMessages("all", "unread"))
                }
              >
                Unread Only
              </button>
            </div>
          </div>
        )} */}
      </div>
    );
  }
};

export default ChatWindow;
