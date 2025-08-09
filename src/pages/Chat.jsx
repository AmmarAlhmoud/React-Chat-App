import React, { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatWindow from "../components/ChatWindow/ChatWindow";
import SettingsModal from "../components/SettingsModal/SettingsModal";
import ContactsModal from "../components/ContactsModal/ContactsModal";
import styles from "./Chat.module.css";

const Chat = () => {
  const [currentChat, setCurrentChat] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddContact, setshowAddContact] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleChatSelect = (chatId) => {
    setCurrentChat(chatId);
    setSidebarOpen(false);
  };

  const handleSettingsOpen = () => {
    setShowSettings(true);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
  };
  const handleAddContactsOpen = () => {
    setshowAddContact(true);
  };
  const handleAddContactClose = () => {
    setshowAddContact(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.chatApp}>
      <Sidebar
        currentChat={currentChat}
        onChatSelect={handleChatSelect}
        onSettingsOpen={handleSettingsOpen}
        onAddContactOpen={handleAddContactsOpen}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <ChatWindow currentChat={currentChat} onToggleSidebar={toggleSidebar} />

      {showSettings && <SettingsModal onClose={handleSettingsClose} />}
      {showAddContact && <ContactsModal onClose={handleAddContactClose} />}
    </div>
  );
};

export default Chat;
