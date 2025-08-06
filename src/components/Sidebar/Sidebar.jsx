import React, { useState, useEffect } from 'react';
import ChatList from '../ChatList/ChatList';
import styles from './Sidebar.module.css';

const Sidebar = ({ chats, currentChat, onChatSelect, onSettingsOpen, isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth <= 768 && isOpen) {
        const sidebar = document.querySelector(`.${styles.sidebar}`);
        const menuBtn = document.querySelector('.mobile-menu-btn');
        
        if (sidebar && !sidebar.contains(e.target) && menuBtn && !menuBtn.contains(e.target)) {
          onClose();
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.mobileOpen : ''}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>JD</div>
          <div className={styles.userInfo}>
            <h3>John Doe</h3>
            <div className={styles.userStatus}>Online</div>
          </div>
        </div>
        <div className={styles.sidebarActions}>
          <button className="icon-btn" onClick={onSettingsOpen}>
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </div>
      
      <div className={styles.searchBar}>
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <ChatList 
        chats={filteredChats}
        currentChat={currentChat}
        onChatSelect={onChatSelect}
      />
    </div>
  );
};

export default Sidebar;