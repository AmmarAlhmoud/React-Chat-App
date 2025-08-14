import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  setUserOnline,
  updateLastSeen,
} from "../../firebase/chatService";
import Header from "../Header/Header";
import Message from "../Message/Message";
import MessageInput from "../MessageInput/MessageInput";
import TypingIndicator from "../TypingIndicator/TypingIndicator";
import styles from "./ChatWindow.module.css";

const ChatWindow = ({ currentChat, onToggleSidebar, onContactRenamed }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Ref for the messages container to control scrolling
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check if user is near bottom of messages - FIXED VERSION
  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 150; // Increased threshold for better detection
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    return distanceFromBottom <= threshold;
  };

  // Handle scroll events to show/hide scroll button - IMPROVED VERSION
  const handleScroll = () => {
    if (!messagesContainerRef.current || messages.length === 0) {
      setShowScrollButton(false);
      return;
    }

    const isAtBottom = isNearBottom();
    setShowScrollButton(!isAtBottom);
  };

  // Smart auto-scroll - only scroll if user is near bottom
  const smartScrollToBottom = () => {
    if (isNearBottom()) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };

  // Auto-scroll when messages change (smart scrolling)
  useEffect(() => {
    if (messages.length > 0) {
      smartScrollToBottom();
    }
  }, [messages]);

  // Initialize user presence when component mounts
  useEffect(() => {
    if (!user?.uid) return;

    // Set user as online
    const presenceRef = setUserOnline(user.uid);

    // Update presence on user activity
    const updateActivity = () => {
      updateLastSeen(user.uid);
    };

    // Listen for user activity events
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Update presence every 2 minutes to show user is still active
    const presenceInterval = setInterval(() => {
      updateLastSeen(user.uid);
    }, 120000); // 2 minutes

    // Cleanup function
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(presenceInterval);
    };
  }, [user?.uid]);

  // Load messages when currentChat changes
  useEffect(() => {
    if (!user || !currentChat?.chatId) {
      setMessages([]);
      setLoading(false);
      setShowScrollButton(false);
      return;
    }

    setLoading(true);
    setError(null);
    setShowScrollButton(false);

    // Subscribe to messages
    const unsubscribe = getChatMessages(currentChat.chatId, (messagesList) => {
      setMessages(messagesList);
      setLoading(false);

      // TODO: make sure to add lazy loading for large chats & start from the bottom not scroll to the bottom.
      // Scroll to bottom when loading a new chat
      setTimeout(() => {
        scrollToBottom();
        setShowScrollButton(false);
      }, 200);
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

  // Update user's last seen when they view messages
  useEffect(() => {
    if (user?.uid && currentChat?.chatId && messages.length > 0) {
      updateLastSeen(user.uid);
    }
  }, [user?.uid, currentChat?.chatId, messages.length]);

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
      } else {
        // Update user's presence after sending message
        updateLastSeen(user.uid);
        setError(null); // Clear any previous errors
        // Always scroll to bottom after sending message
        setTimeout(() => {
          scrollToBottom();
          setShowScrollButton(false);
        }, 100);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    }
  };

  // Handle typing events
  const handleTyping = () => {
    // Update user presence while typing
    updateLastSeen(user.uid);
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

  // Handle focus events to update presence
  const handleFocus = () => {
    if (user?.uid) {
      updateLastSeen(user.uid);
    }
  };

  // Handle manual scroll to bottom button click
  const handleScrollToBottomClick = () => {
    scrollToBottom();
    setShowScrollButton(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.chatMain}>
        <Header
          currentChat={currentChat}
          onToggleSidebar={onToggleSidebar}
          onContactRenamed={onContactRenamed}
        />
        <div
          className={styles.messagesContainer}
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          <div className={styles.loading}>Loading messages...</div>
        </div>
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          onFocus={handleFocus}
          disabled
        />
      </div>
    );
  }

  const displayMessages = getDisplayMessages();
  const stats = getMessageCounts();

  // No chat selected state
  if (!currentChat) {
    return (
      <div className={styles.chatMain}>
        <Header
          currentChat={null}
          onToggleSidebar={onToggleSidebar}
          onContactRenamed={onContactRenamed}
        />
        <div
          className={styles.messagesContainer}
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          <div className={styles.noChatSelected}>
            Select a contact to start chatting
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatMain}>
      <Header
        currentChat={currentChat}
        onToggleSidebar={onToggleSidebar}
        onContactRenamed={onContactRenamed}
      />

      <div
        className={styles.messagesContainer}
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {displayMessages.length === 0 ? (
          <div className={styles.noMessages}>
            <p>No messages yet.</p>
            <p>Send a message to start the conversation!</p>
          </div>
        ) : (
          <>
            {displayMessages.map((message) => (
              <Message
                key={message.id}
                message={message}
                showReadStatus={message.type === "sent"}
                showAvatar={message.type === "received"}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {showScrollButton && (
        <button
          className={styles.scrollToBottomButton}
          onClick={handleScrollToBottomClick}
          title="Scroll to bottom"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}

      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onFocus={handleFocus}
      />

      {/* TODO: DEBUG: Remove this in production */}
      {import.meta.env.VITE_ENV === "development" && (
        <div
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "12px",
            zIndex: 1000,
          }}
        >
          Show Button: {showScrollButton ? "YES" : "NO"} | Messages:{" "}
          {messages.length} | Near Bottom: {isNearBottom() ? "YES" : "NO"}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
