import React from 'react';
import styles from './Header.module.css';

const Header = ({ currentChat, onToggleSidebar }) => {
  const getAvatarInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <button className={styles.mobileMenuBtn} onClick={onToggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <div className={styles.chatAvatar}>{getAvatarInitials(currentChat)}</div>
         <div className={styles.chatHeaderInfo}>
            <h3>{currentChat}</h3>
            <div className={styles.chatHeaderStatus}>Online • Last seen now</div>
          </div>
        {/* <div className={styles.chatInfo}>
          <div className={styles.chatName}>{currentChat}</div>
        </div> */}
      </div>

      {/* Desktop Header */}
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderLeft}>
          <div className={styles.chatAvatar}>
            {getAvatarInitials(currentChat)}
            <div className={styles.onlineIndicator}></div>
          </div>
          <div className={styles.chatHeaderInfo}>
            <h3>{currentChat}</h3>
            <div className={styles.chatHeaderStatus}>Online • Last seen now</div>
          </div>
        </div>
        <div className={styles.chatHeaderActions}>
          <button className="icon-btn">
            <i className="fas fa-phone"></i>
          </button>
          <button className="icon-btn">
            <i className="fas fa-video"></i>
          </button>
          <button className="icon-btn">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;