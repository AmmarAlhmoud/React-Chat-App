import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserChatsWithDetails } from "../firebase/chatService";
import { generateInitials } from "../utils/helpers";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatWindow from "../components/ChatWindow/ChatWindow";
import SettingsModal from "../components/SettingsModal/SettingsModal";
import ContactsModal from "../components/ContactsModal/ContactsModal";
import styles from "./Chat.module.css";

const Chat = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddContact, setshowAddContact] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load user's chats with real-time updates
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = getUserChatsWithDetails(user.uid, (chatsList) => {
      setChats(chatsList);

      // If current chat is set, update it with the latest data from Firebase
      if (currentChat) {
        const updatedCurrentChat = chatsList.find(
          (chat) => chat.chatId === currentChat.chatId
        );
        if (updatedCurrentChat) {
          if (
            JSON.stringify(updatedCurrentChat) !== JSON.stringify(currentChat)
          ) {
            setCurrentChat(updatedCurrentChat);
          }
        }
      }
    });

    return unsubscribe;
  }, [user?.uid]);

  const handleChatSelect = (chatData) => {
    setCurrentChat(chatData);
    setSidebarOpen(false);
  };

  // Handle contact renamed
  const handleContactRenamed = (renameData) => {
    console.log("Contact renamed:", renameData);

    if (currentChat && renameData.chatId === currentChat.chatId) {
      setCurrentChat((prevChat) => ({
        ...prevChat,
        contactName: renameData.newContactName,
        avatar:
          renameData.newAvatar || generateInitials(renameData.newContactName),
      }));
    }

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.chatId === renameData.chatId
          ? {
              ...chat,
              contactName: renameData.newContactName,
              avatar:
                renameData.newAvatar ||
                generateInitials(renameData.newContactName),
            }
          : chat
      )
    );
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

  // Handle new contact added - refresh the chat list
  const handleContactAdded = (result) => {
    if (result.type === "success") {
      if (result.chatId) {
        setTimeout(() => {
          const newChat = chats.find((chat) => chat.chatId === result.chatId);
          if (newChat) {
            setCurrentChat(newChat);
          }
        }, 500);
      }
    }
  };

  return (
    <div className={styles.chatApp}>
      <Sidebar
        chats={chats}
        currentChat={currentChat}
        onChatSelect={handleChatSelect}
        onSettingsOpen={handleSettingsOpen}
        onAddContactOpen={handleAddContactsOpen}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <ChatWindow
        currentChat={currentChat}
        onToggleSidebar={toggleSidebar}
        onContactRenamed={handleContactRenamed}
      />

      {showSettings && <SettingsModal onClose={handleSettingsClose} />}
      {showAddContact && (
        <ContactsModal
          onClose={handleAddContactClose}
          onContactAdded={handleContactAdded}
        />
      )}
    </div>
  );
};

export default Chat;
