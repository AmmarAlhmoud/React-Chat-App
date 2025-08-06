import React from 'react';
import styles from './ChatList.module.css';

const ChatList = ({ chats, currentChat, onChatSelect }) => {
  const handleChatClick = (chat) => {
    onChatSelect(chat.name);
  };

  return (
    <div className={styles.chatList}>
      {chats.map((chat) => (
        <div 
          key={chat.id}
          className={`${styles.chatItem} ${currentChat === chat.name ? styles.active : ''}`}
          onClick={() => handleChatClick(chat)}
        >
          <div className={styles.chatAvatar}>
            {chat.avatar}
            {chat.online && <div className={styles.onlineIndicator}></div>}
          </div>
          <div className={styles.chatInfo}>
            <div className={styles.chatHeaderInfo}>
              <div className={styles.chatName}>{chat.name}</div>
              <div className={styles.chatTime}>{chat.time}</div>
            </div>
            <div className={styles.chatMessage}>{chat.lastMessage}</div>
          </div>
          {chat.unread > 0 && (
            <div className={styles.unreadBadge}>{chat.unread}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatList;