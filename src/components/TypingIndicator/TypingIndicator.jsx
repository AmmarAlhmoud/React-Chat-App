import React from 'react';
import styles from './TypingIndicator.module.css';

const TypingIndicator = () => {
  return (
    <div className={styles.typingIndicator}>
      <div className={styles.messageAvatar}>SW</div>
      <div className={styles.typingDots}>
        <div className={styles.typingDot}></div>
        <div className={styles.typingDot}></div>
        <div className={styles.typingDot}></div>
      </div>
    </div>
  );
};

export default TypingIndicator;