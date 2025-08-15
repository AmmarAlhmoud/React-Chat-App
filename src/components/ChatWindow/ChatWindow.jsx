import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getChatMessages,
  fetchOlderMessages,
  sendMessage,
  markMessagesAsRead,
  setUserOnline,
  updateLastSeen,
} from "../../firebase/chatService";
import Header from "../Header/Header";
import Message from "../Message/Message";
import MessageInput from "../MessageInput/MessageInput";
import styles from "./ChatWindow.module.css";

const ChatWindow = ({
  currentChat,
  onToggleSidebar,
  sidebarOpen,
  isMobile,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom <= 150;
  };

  const smartScrollToBottom = () => {
    if (isNearBottom()) scrollToBottom();
  };

  const loadOlderMessages = async () => {
    if (!currentChat?.chatId || isLoadingOlder || messages.length === 0) return;

    setIsLoadingOlder(true);
    try {
      const oldestMessageTimestamp = messages[0]?.timestamp;
      const olderMessages = await fetchOlderMessages(
        currentChat.chatId,
        oldestMessageTimestamp
      );
      if (olderMessages.length > 0) {
        setMessages((prev) => [...olderMessages, ...prev]);
        const container = messagesContainerRef.current;
        if (container) {
          const scrollHeightBefore = container.scrollHeight;
          setTimeout(() => {
            container.scrollTop =
              container.scrollHeight - scrollHeightBefore + container.scrollTop;
          }, 50);
        }
      }
    } catch (err) {
      console.error("Error loading older messages:", err);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (container.scrollTop < 150) loadOlderMessages();

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollButton(distanceFromBottom > 150);
  };

  useEffect(() => {
    if (!user?.uid) return;
    setUserOnline(user.uid);
    const updateActivity = () => updateLastSeen(user.uid);
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((e) =>
      document.addEventListener(e, updateActivity, { passive: true })
    );
    const interval = setInterval(() => updateLastSeen(user.uid), 120000);
    return () => {
      events.forEach((e) => document.removeEventListener(e, updateActivity));
      clearInterval(interval);
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user || !currentChat?.chatId) {
      setMessages([]);
      setLoading(false);
      setShowScrollButton(false);
      return;
    }

    setLoading(true);
    setShowScrollButton(false);

    const unsubscribe = getChatMessages(currentChat.chatId, (messagesList) => {
      const recentMessages = messagesList.slice(-50);
      setMessages(recentMessages);
      setLoading(false);
      setTimeout(() => scrollToBottom("auto"), 100);
    });

    markMessagesAsRead(currentChat.chatId, user.uid).catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [user, currentChat?.chatId]);

  useEffect(() => {
    if (messages.length > 0) smartScrollToBottom();
  }, [messages]);

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
      if (!result.success) console.error("Failed to send message");
      updateLastSeen(user.uid);
      setTimeout(() => scrollToBottom(), 50);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const getDisplayMessages = () => {
    return messages.map((message) => {
      const isFromCurrentUser = message.senderId === user.uid;
      const messageType = isFromCurrentUser ? "sent" : "received";
      const isRead = message.readBy && message.readBy[user.uid];
      const readStatus = isRead ? "read" : "unread";
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

  const displayMessages = getDisplayMessages();

  return (
    <div className={styles.chatMain}>
      {(isMobile || (!isMobile && currentChat)) && (
        <Header currentChat={currentChat} onToggleSidebar={onToggleSidebar} />
      )}

      <div
        className={styles.messagesContainer}
        ref={messagesContainerRef}
        onScroll={handleScroll}
        onClick={() => {
          if (isMobile && sidebarOpen) onToggleSidebar(false);
        }}
      >
        {!currentChat ? (
          <div className={styles.noChatSelected}>
            Select a contact to start chatting
          </div>
        ) : loading ? (
          <div className={styles.loading}>Loading messages...</div>
        ) : displayMessages.length === 0 ? (
          <div className={styles.noMessages}>
            <p>No messages yet.</p>
            <p>Send a message to start the conversation!</p>
          </div>
        ) : (
          <>
            {isLoadingOlder && (
              <div className={styles.loading}>Loading older messages...</div>
            )}
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

      {currentChat && (
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={() => updateLastSeen(user.uid)}
          onFocus={() => updateLastSeen(user.uid)}
        />
      )}

      {showScrollButton && (
        <button
          className={styles.scrollToBottomButton}
          onClick={() => scrollToBottom("smooth")}
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
    </div>
  );
};

export default ChatWindow;
