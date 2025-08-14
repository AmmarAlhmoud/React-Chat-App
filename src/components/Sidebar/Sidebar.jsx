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
  onAddContactOpen,
  isOpen,
}) => {
  const { user } = useAuth();

  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Load only user data - remove chat subscription
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Subscribe only to user data
    const userRef = ref(database, `users/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      setDbUser(snapshot.val());
      setLoading(false);
    });

    return unsubscribe;
  }, [user?.uid]);

  // Update loading state based on chats prop
  useEffect(() => {
    if (chats && chats.length >= 0) {
      setLoading(false);
    }
  }, [chats]);

  // Filter chats based on search query
  const filteredChats =
    chats?.filter(
      (chat) =>
        chat.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Generate initials for names
  const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ").filter(Boolean);

    if (words.length === 1) {
      return words[0][0].toUpperCase();
    } else if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return "";
  };

  // Get display name for current user
  const displayName =
    dbUser?.displayName ||
    (dbUser?.firstName && dbUser?.lastName
      ? `${dbUser.firstName} ${dbUser.lastName}`
      : user?.displayName && user.displayName.trim()
      ? user.displayName
      : user?.email || "User");

  // Loading state
  if (loading) {
    return (
      <div className={`${styles.sidebar} ${isOpen ? styles.mobileOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>{getInitials(displayName)}</div>
            <div className={styles.userInfo}>
              <h3>{displayName}</h3>
              <div className={styles.userStatus}>Loading...</div>
            </div>
          </div>
          <div className={styles.sidebarActions}>
            <button className="icon-btn" onClick={onSettingsOpen}>
              <i className="fas fa-cog"></i>
            </button>
          </div>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Loading chats...</div>
        </div>
      </div>
    );
  }

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
      {!chats || chats.length === 0 ? (
        <div className={styles.noContactsMessage}>
          <div className={styles.emptyStateIcon}>
            <i className="fas fa-comments"></i>
          </div>
          <h3>No conversations yet</h3>
          <p>Add a contact to start chatting!</p>
        </div>
      ) : filteredChats.length === 0 ? (
        <div className={styles.noContactsMessage}>
          <div className={styles.emptyStateIcon}>
            <i className="fas fa-search"></i>
          </div>
          <h3>No matches found</h3>
          <p>Try searching with a different term.</p>
        </div>
      ) : (
        <ChatList
          chats={filteredChats}
          currentChat={currentChat}
          onChatSelect={onChatSelect}
        />
      )}
      <div className={`${styles.sidebarActions} ${styles.bottomActions}`}>
        <button
          className="icon-btn"
          onClick={onAddContactOpen}
          title="Add new contact"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {/* TODO: remove in production */}
      {import.meta.env.VITE_ENV === "development" && (
        <div className={styles.debugInfo}>
          <small>
            Chats: {chats?.length || 0} | Filtered: {filteredChats.length} |
            Current: {currentChat?.chatId || "none"}
          </small>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
