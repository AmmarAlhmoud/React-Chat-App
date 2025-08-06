import React, { useState, useEffect } from "react";
import ChatList from "../ChatList/ChatList";
import { useAuth } from "../../context/AuthContext";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase/config";
import styles from "./Sidebar.module.css";

const Sidebar = ({
  chats,
  currentChat,
  onChatSelect,
  onSettingsOpen,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [dbUser, setDbUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?.uid) {
      const userRef = ref(database, `users/${user.uid}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        setDbUser(snapshot.val());
      });
      return () => unsubscribe();
    }
  }, [user?.uid]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth <= 768 && isOpen) {
        const sidebar = document.querySelector(`.${styles.sidebar}`);
        const menuBtn = document.querySelector(".mobile-menu-btn");

        if (
          sidebar &&
          !sidebar.contains(e.target) &&
          menuBtn &&
          !menuBtn.contains(e.target)
        ) {
          onClose();
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen, onClose]);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get initials from dbUser
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  // Prefer dbUser's firstName + lastName, fallback to displayName
  const displayName =
    dbUser?.firstName && dbUser?.lastName
      ? `${dbUser.firstName} ${dbUser.lastName}`
      : user?.displayName && user.displayName.trim()
      ? user.displayName
      : "";

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.mobileOpen : ""}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>{getInitials(displayName)}</div>
          <div className={styles.userInfo}>
            <h3>{displayName}</h3>
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
