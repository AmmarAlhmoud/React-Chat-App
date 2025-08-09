import React from "react";
import { formatTime } from "../../utils/helpers";
import styles from "./ChatList.module.css";

const ChatList = ({ chats, currentChat, onChatSelect }) => {
  const handleChatClick = (chat) => {
    onChatSelect(chat);
  };

  return (
    <div className={styles.chatList}>
      {chats.map((chat) => {
        const lastMessageText = chat.lastMessage?.text || "No messages yet";
        const lastMessageTime = chat.lastMessage?.timestamp || chat.updatedAt;
        const unreadCount = chat.unreadCount || 0;

        return (
          <div
            key={chat.chatId}
            className={`${styles.chatItem} ${
              currentChat?.chatId === chat.chatId ? styles.active : ""
            }`}
            onClick={() => handleChatClick(chat)}
          >
            <div className={styles.chatAvatar}>
              {chat.avatar}
              {chat.online && <div className={styles.onlineIndicator}></div>}
            </div>
            <div className={styles.chatInfo}>
              <div className={styles.chatHeaderInfo}>
                <div className={styles.chatName}>
                  {chat.contactName || "Unknown Contact"}
                </div>
                <div className={styles.chatTime}>
                  {formatTime(lastMessageTime)}
                </div>
              </div>
              <div className={styles.chatMessage}>{lastMessageText}</div>
            </div>
            {unreadCount > 0 && (
              <div className={styles.unreadBadge}>{unreadCount}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
