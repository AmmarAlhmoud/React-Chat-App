import React, { useState } from 'react';
import styles from './MessageInput.module.css';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const autoResize = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <div className={styles.messageInputContainer}>
      <form onSubmit={handleSubmit} className={styles.messageInputWrapper}>
        <button type="button" className="icon-btn">
          <i className="fas fa-paperclip"></i>
        </button>
        <textarea
          className={styles.messageInput}
          placeholder="Type a message..."
          rows="1"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          onInput={autoResize}
        />
        <div className={styles.inputActions}>
          <button type="button" className="icon-btn">
            <i className="fas fa-smile"></i>
          </button>
          <button 
            type="submit" 
            className={styles.sendBtn}
            disabled={!message.trim()}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;