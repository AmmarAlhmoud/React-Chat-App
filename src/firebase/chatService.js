import {
  ref,
  get,
  child,
  onValue,
  update,
  serverTimestamp,
  onDisconnect,
  query,
  orderByChild,
  limitToLast,
  endBefore,
  set,
} from "firebase/database";
import { generateInitials } from "../utils/helpers";
import { database } from "./config";

// Generate consistent chat ID for two users
export const generateChatId = (userId1, userId2) => {
  const sortedIds = [userId1, userId2].sort();
  return `chat_${sortedIds[0]}_${sortedIds[1]}`;
};

// Generate unique message ID
export const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Set user online and handle offline detection
export const setUserOnline = (userId) => {
  const userPresenceRef = ref(database, `presence/${userId}`);

  // Set user as online
  const presenceData = {
    isOnline: true,
    lastSeen: serverTimestamp(),
    connectedAt: serverTimestamp(),
  };

  set(userPresenceRef, presenceData);

  // Set up disconnect handler to mark user offline
  onDisconnect(userPresenceRef).set({
    isOnline: false,
    lastSeen: serverTimestamp(),
  });

  return userPresenceRef;
};

// Update user's last seen timestamp
export const updateLastSeen = (userId) => {
  const userPresenceRef = ref(database, `presence/${userId}`);
  update(userPresenceRef, {
    lastSeen: serverTimestamp(),
  });
};

// Listen to a user's presence status
export const listenToUserPresence = (userId, callback) => {
  const presenceRef = ref(database, `presence/${userId}`);

  const unsubscribe = onValue(presenceRef, (snapshot) => {
    const presenceData = snapshot.val();
    if (presenceData) {
      callback({
        isOnline: presenceData.isOnline || false,
        lastSeen: presenceData.lastSeen,
        connectedAt: presenceData.connectedAt,
      });
    } else {
      // User has never been online or data doesn't exist
      callback({
        isOnline: false,
        lastSeen: null,
        connectedAt: null,
      });
    }
  });

  return unsubscribe;
};

// Get multiple users' presence status
export const listenToMultipleUsersPresence = (userIds, callback) => {
  const unsubscribers = [];
  const presenceStatuses = {};

  const updateCallback = () => {
    callback({ ...presenceStatuses });
  };

  userIds.forEach((userId) => {
    const unsubscribe = listenToUserPresence(userId, (presenceData) => {
      presenceStatuses[userId] = presenceData;
      updateCallback();
    });
    unsubscribers.push(unsubscribe);
  });

  // Return cleanup function
  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
};

// Add a new contact
export const addNewContact = async (
  userId,
  contactName,
  contactEmail,
  avatar
) => {
  try {
    const dbRef = ref(database);
    const usersSnapshot = await get(child(dbRef, "users"));

    if (!usersSnapshot.exists()) {
      return { type: "error", message: "No users found in the database" };
    }

    const users = usersSnapshot.val();
    let contactUserId = null;

    // Find contact ID by email
    for (const [uid, user] of Object.entries(users)) {
      if (user.email.toLowerCase() === contactEmail.toLowerCase()) {
        contactUserId = uid;
        break;
      }
    }

    if (!contactUserId) {
      return { type: "error", message: "Contact not found" };
    }

    const isSelfContact = contactUserId === userId;

    // Check if contact already exists
    const existingContactSnap = await get(
      child(dbRef, `contacts/${userId}/${contactUserId}`)
    );
    if (existingContactSnap.exists()) {
      const existingContact = existingContactSnap.val();

      if (existingContact.deleted) {
        // Reactivate the deleted contact
        const finalName = isSelfContact ? `${contactName} (You)` : contactName;
        const updates = {
          [`contacts/${userId}/${contactUserId}/deleted`]: false,
          [`contacts/${userId}/${contactUserId}/contactName`]: finalName,
          [`contacts/${userId}/${contactUserId}/avatar`]: avatar,
          [`contacts/${userId}/${contactUserId}/addedAt`]:
            new Date().toISOString(),
        };
        await update(ref(database), updates);

        return {
          type: "success",
          message: "Contact re-added successfully",
          chatId: existingContact.chatId,
          contactUserId,
          isSelfContact,
        };
      }

      const contactType = isSelfContact ? "yourself" : "this contact";
      return {
        type: "warning",
        message: `You have already added ${contactType} to your chat list`,
      };
    }

    // For non-self contacts, check reverse relationship
    if (!isSelfContact) {
      const reverseContactSnap = await get(
        child(dbRef, `contacts/${contactUserId}/${userId}`)
      );
      if (reverseContactSnap.exists() && !reverseContactSnap.val().deleted) {
        return {
          type: "warning",
          message: "A chat between you and this contact already exists",
        };
      }
    }

    const chatId = generateChatId(userId, contactUserId);
    const timestamp = new Date().toISOString();

    const currentUserData = users[userId];

    const updates = {};

    // User-A's contact entry
    const userAContactName = isSelfContact
      ? `${contactName} (You)`
      : contactName;
    updates[`contacts/${userId}/${contactUserId}`] = {
      contactId: contactUserId,
      contactName: userAContactName,
      contactEmail: contactEmail,
      avatar: avatar,
      chatId: chatId,
      isSelfContact: isSelfContact,
      deleted: false,
      addedAt: timestamp,
    };

    // User-B's view (for non-self contacts)
    if (!isSelfContact) {
      const currentUserDisplayName =
        currentUserData.displayName ||
        `${currentUserData.firstName || ""} ${
          currentUserData.lastName || ""
        }`.trim();
      const currentUserAvatar = generateInitials(currentUserDisplayName);

      updates[`contacts/${contactUserId}/${userId}`] = {
        contactId: userId,
        contactName: currentUserDisplayName,
        contactEmail: currentUserData.email,
        avatar: currentUserAvatar,
        chatId: chatId,
        isSelfContact: false,
        deleted: false,
        addedAt: timestamp,
      };
    }

    // Create or update chat
    updates[`chats/${chatId}`] = {
      participants: {
        [userId]: true,
        [contactUserId]: true,
      },
      isSelfChat: isSelfContact,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Initialize userChats
    updates[`userChats/${userId}/${chatId}`] = {
      lastSeen: timestamp,
      unreadCount: 0,
      archived: false,
    };
    if (!isSelfContact) {
      updates[`userChats/${contactUserId}/${chatId}`] = {
        lastSeen: timestamp,
        unreadCount: 0,
        archived: false,
      };
    }

    await update(ref(database), updates);

    const successMessage = isSelfContact
      ? "Personal chat created successfully"
      : "Contact added successfully";

    return {
      type: "success",
      message: successMessage,
      chatId: chatId,
      contactUserId,
      isSelfContact,
    };
  } catch (error) {
    return { type: "error", message: error.message || "Failed to add contact" };
  }
};

// Get user's contacts with real-time updates
export const getUserContacts = (userId, callback) => {
  const contactsRef = ref(database, `contacts/${userId}`);

  const unsubscribe = onValue(contactsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const contactsList = Object.entries(data).map(([contactId, contact]) => ({
        id: contactId, // This is the contact's user ID
        ...contact,
      }));
      callback(contactsList);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
};

// Get user's chats with last message info and contact details.
export const getUserChatsWithDetails = (userId, callback) => {
  const userChatsRef = ref(database, `userChats/${userId}`);

  const unsubscribe = onValue(userChatsRef, async (snapshot) => {
    const userChatsData = snapshot.val();
    if (!userChatsData) {
      callback([]);
      return;
    }

    const chatIds = Object.keys(userChatsData);
    const chatsPromises = chatIds.map(async (chatId) => {
      try {
        // Get chat data
        const chatSnapshot = await get(ref(database, `chats/${chatId}`));
        const chatData = chatSnapshot.val();

        if (!chatData) return null;

        // Get contact info
        const participants = Object.keys(chatData.participants);
        const otherUserId = participants.find((id) => id !== userId);
        const isSelfChat = !otherUserId || otherUserId === userId;
        const contactUserId = isSelfChat ? userId : otherUserId;

        const contactSnapshot = await get(
          ref(database, `contacts/${userId}/${contactUserId}`)
        );
        const contactData = contactSnapshot.val();

        // Get user data if contact data is missing
        let contactInfo = contactData;
        if (!contactData) {
          const userSnapshot = await get(
            ref(database, `users/${contactUserId}`)
          );
          const userData = userSnapshot.val();
          if (userData) {
            const displayName =
              userData.displayName ||
              `${userData.firstName || ""} ${userData.lastName || ""}`.trim();

            contactInfo = {
              contactName: isSelfChat ? `${displayName} (You)` : displayName,
              contactEmail: userData.email,
              avatar: generateInitials(displayName),
              contactId: contactUserId,
              isSelfContact: isSelfChat,
            };
          }
        }

        return {
          ...chatData,
          chatId,
          ...userChatsData[chatId],
          ...contactInfo,
          id: chatId, // For backward compatibility
          contactUserId: contactUserId,
          isSelfChat: isSelfChat,
        };
      } catch (error) {
        console.error(`Error fetching chat ${chatId}:`, error);
        return null;
      }
    });

    const chats = (await Promise.all(chatsPromises)).filter(Boolean);

    // Sort by last message timestamp or creation time
    chats.sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || a.updatedAt || a.createdAt;
      const bTime = b.lastMessage?.timestamp || b.updatedAt || b.createdAt;
      return new Date(bTime) - new Date(aTime);
    });

    callback(chats);
  });

  return unsubscribe;
};

// Send a message (updated to update user presence)
export const sendMessage = async (
  chatId,
  senderId,
  senderName,
  messageText,
  messageType = "text"
) => {
  try {
    const messageId = generateMessageId();
    const timestamp = new Date().toISOString();

    // Get chat participants
    const chatSnapshot = await get(
      ref(database, `chats/${chatId}/participants`)
    );
    const participants = chatSnapshot.val();

    if (!participants) {
      throw new Error("Chat not found");
    }

    const participantIds = Object.keys(participants);
    const receiverId = participantIds.find((id) => id !== senderId);
    const isSelfChat = !receiverId || receiverId === senderId;

    // Create message data
    const messageData = {
      id: messageId,
      text: messageText,
      senderId: senderId,
      senderName: senderName,
      timestamp: timestamp,
      type: messageType,
      readBy: {
        [senderId]: timestamp, // Sender auto-reads
      },
    };

    // For non-self chats, add receiver's read status
    if (!isSelfChat) {
      messageData.readBy[receiverId] = null; // Receiver hasn't read yet
    }

    // Create batch updates
    const updates = {};

    // Save message
    updates[`messages/${chatId}/${messageId}`] = messageData;

    // Update chat's last message
    updates[`chats/${chatId}/lastMessage`] = {
      text: messageText,
      senderId: senderId,
      timestamp: timestamp,
      type: messageType,
    };
    updates[`chats/${chatId}/updatedAt`] = timestamp;

    // Update unread count for receiver (only for non-self chats)
    if (!isSelfChat) {
      const receiverChatSnapshot = await get(
        ref(database, `userChats/${receiverId}/${chatId}`)
      );
      const currentUnreadCount = receiverChatSnapshot.val()?.unreadCount || 0;

      updates[`userChats/${receiverId}/${chatId}/unreadCount`] =
        currentUnreadCount + 1;
    }

    // Update sender's presence
    updates[`presence/${senderId}/lastSeen`] = serverTimestamp();

    // Execute all updates
    await update(ref(database), updates);

    return { success: true, messageId, isSelfChat };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error };
  }
};

// Get messages for a specific chat
export const getChatMessages = (
  chatId,
  callback,
  startBefore = null,
  limit = 50
) => {
  let messagesQuery;

  if (startBefore) {
    // Fetch older messages before a certain timestamp
    messagesQuery = query(
      ref(database, `messages/${chatId}`),
      orderByChild("timestamp"),
      endBefore(startBefore),
      limitToLast(limit)
    );
  } else {
    // Fetch the latest messages
    messagesQuery = query(
      ref(database, `messages/${chatId}`),
      orderByChild("timestamp"),
      limitToLast(limit)
    );
  }

  // Real-time listener for the latest messages
  const unsubscribe = onValue(messagesQuery, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const messagesList = Object.values(data);
      messagesList.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      callback(messagesList);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
};

// Fetch older messages once (for lazy loading)
export const fetchOlderMessages = async (chatId, startBefore, limit = 50) => {
  try {
    const messagesQuery = query(
      ref(database, `messages/${chatId}`),
      orderByChild("timestamp"),
      endBefore(startBefore),
      limitToLast(limit)
    );

    const snapshot = await get(messagesQuery);
    const data = snapshot.val();
    if (!data) return [];

    const messagesList = Object.values(data);
    messagesList.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return messagesList;
  } catch (err) {
    console.error("Error fetching older messages:", err);
    return [];
  }
};

// Mark messages as read (updated to update presence)
export const markMessagesAsRead = async (chatId, userId) => {
  try {
    const messagesSnapshot = await get(ref(database, `messages/${chatId}`));
    const messages = messagesSnapshot.val();

    if (!messages) return { success: true };

    const updates = {};
    const readTimestamp = new Date().toISOString();

    Object.keys(messages).forEach((messageId) => {
      const message = messages[messageId];
      if (message.readBy && message.readBy[userId] === null) {
        updates[`messages/${chatId}/${messageId}/readBy/${userId}`] =
          readTimestamp;
      }
    });

    // Reset unread count and update last seen
    updates[`userChats/${userId}/${chatId}/unreadCount`] = 0;
    updates[`userChats/${userId}/${chatId}/lastSeen`] = readTimestamp;

    // Update user's presence
    updates[`presence/${userId}/lastSeen`] = serverTimestamp();

    await update(ref(database), updates);
    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { success: false, error };
  }
};

// Update contact name for User-B to rename User-A
export const updateContactName = async (
  userId,
  contactUserId,
  newContactName
) => {
  try {
    const contactRef = ref(database, `contacts/${userId}/${contactUserId}`);
    const contactSnapshot = await get(contactRef);

    if (!contactSnapshot.exists()) {
      return {
        type: "error",
        message: "Contact not found",
      };
    }

    const newAvatar = generateInitials(newContactName);

    await update(contactRef, {
      contactName: newContactName,
      avatar: newAvatar,
      updatedAt: new Date().toISOString(),
    });

    return {
      type: "success",
      message: "Contact name updated successfully",
    };
  } catch (error) {
    return {
      type: "error",
      message: error.message || "Failed to update contact name",
    };
  }
};

// Clear chat history
export const clearChatHistory = async (chatId) => {
  try {
    // Get participants to reset unread counters, too
    const participantsSnap = await get(
      ref(database, `chats/${chatId}/participants`)
    );
    if (!participantsSnap.exists()) {
      return { type: "error", message: "Chat not found" };
    }
    const participants = Object.keys(participantsSnap.val() || {});
    const timestamp = new Date().toISOString();

    // Multi-path update
    const updates = {
      [`messages/${chatId}`]: null, // delete all messages
      [`chats/${chatId}/lastMessage`]: null, // reset last message
      [`chats/${chatId}/updatedAt`]: timestamp,
    };
    participants.forEach((uid) => {
      updates[`userChats/${uid}/${chatId}/unreadCount`] = 0;
    });

    await update(ref(database), updates);
    return { type: "success", message: "Chat history cleared successfully" };
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return { type: "error", message: error.message };
  }
};

// Delete a contact
export const deleteContact = async (userId, contactUserId, chatId) => {
  try {
    // Soft-delete contact and userChats for current user
    const updates = {
      [`contacts/${userId}/${contactUserId}/deleted`]: true,
      // archive chat visually
      [`userChats/${userId}/${chatId}/archived`]: true,
    };

    // Check if the other user also deleted
    const otherContactSnap = await get(
      ref(database, `contacts/${contactUserId}/${userId}`)
    );
    if (!otherContactSnap.exists() || otherContactSnap.val().deleted) {
      // Both sides deleted remove chat and messages completely
      updates[`messages/${chatId}`] = null;
      updates[`chats/${chatId}`] = null;
      updates[`userChats/${contactUserId}/${chatId}`] = null;
    }

    await update(ref(database), updates);

    return { type: "success", message: "Contact deleted successfully" };
  } catch (error) {
    console.error("Error deleting contact:", error);
    return { type: "error", message: error.message };
  }
};
