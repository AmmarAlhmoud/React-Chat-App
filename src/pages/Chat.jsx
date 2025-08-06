import React, { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatWindow from "../components/ChatWindow/ChatWindow";
import SettingsModal from "../components/SettingsModal/SettingsModal";
import styles from "./Chat.module.css";

const Chat = ({ onLogout, theme, onToggleTheme }) => {
  const [currentChat, setCurrentChat] = useState("Sarah Wilson");
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chats = [
    {
      id: 1,
      name: "Sarah Wilson",
      avatar: "SW",
      lastMessage: "Hey! How's the project going?",
      time: "2:30 PM",
      unread: 2,
      online: true,
      active: true,
    },
    {
      id: 2,
      name: "Team Alpha",
      avatar: "TA",
      lastMessage: "Mike: Let's schedule the meeting",
      time: "1:45 PM",
      unread: 0,
      online: false,
      active: false,
    },
    {
      id: 3,
      name: "Alex Chen",
      avatar: "AC",
      lastMessage: "Thanks for the code review!",
      time: "12:20 PM",
      unread: 0,
      online: true,
      active: false,
    },
    {
      id: 4,
      name: "Design Team",
      avatar: "DT",
      lastMessage: "New mockups are ready",
      time: "11:30 AM",
      unread: 0,
      online: false,
      active: false,
    },
  ];

  const handleChatSelect = (chatName) => {
    setCurrentChat(chatName);
    setSidebarOpen(false);
  };

  const handleSettingsOpen = () => {
    setShowSettings(true);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.chatApp}>
      <Sidebar
        chats={chats}
        currentChat={currentChat}
        onChatSelect={handleChatSelect}
        onSettingsOpen={handleSettingsOpen}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <ChatWindow currentChat={currentChat} onToggleSidebar={toggleSidebar} />

      {showSettings && <SettingsModal onClose={handleSettingsClose} />}
    </div>
  );
};

export default Chat;
