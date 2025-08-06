import React from 'react';
import styles from './Message.module.css';

const Message = ({ message }) => {
  return (
    <div className={`${styles.message} ${styles[message.type]}`}>
      {message.type === 'received' && (
        <div className={styles.messageAvatar}>{message.avatar}</div>
      )}
      <div className={styles.messageBubble}>
        <div className={styles.messageText}>{message.text}</div>
        <div className={styles.messageTime}>{message.time}</div>
      </div>
    </div>
  );
};

export default Message;