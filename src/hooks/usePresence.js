import { useState, useEffect, useRef } from "react";
import {
  setUserOnline,
  updateLastSeen,
  listenToMultipleUsersPresence,
  listenToUserPresence,
} from "../firebase/chatService";

// Custom hook to manage current user's presence
export const useUserPresence = (userId) => {
  const presenceRef = useRef(null);
  const activityTimeoutRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Set user as online when component mounts
    presenceRef.current = setUserOnline(userId);

    // Update last seen on user activity
    const updateActivity = () => {
      updateLastSeen(userId);

      // Clear existing timeout
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }

      // Set new timeout to update presence every 30 seconds of activity
      activityTimeoutRef.current = setTimeout(() => {
        updateLastSeen(userId);
      }, 30000);
    };

    // Listen for user activity events
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Update presence every 2 minutes to show user is still active
    const presenceInterval = setInterval(() => {
      updateLastSeen(userId);
    }, 120000); // 2 minutes

    // Cleanup function
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity);
      });

      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }

      clearInterval(presenceInterval);
    };
  }, [userId]);
};

// Custom hook to listen to multiple contacts' presence
export const useContactsPresence = (contactIds) => {
  const [presenceStatuses, setPresenceStatuses] = useState({});

  useEffect(() => {
    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      setPresenceStatuses({});
      return;
    }

    const validContactIds = contactIds.filter((id) => id != null);
    if (validContactIds.length === 0) {
      setPresenceStatuses({});
      return;
    }

    const unsubscribe = listenToMultipleUsersPresence(
      validContactIds,
      (statuses) => {
        setPresenceStatuses(statuses);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [contactIds.join(",")]); // avoid reruns from new array references

  return presenceStatuses;
};

// Custom hook to listen to a single user's presence
export const useUserPresenceStatus = (userId) => {
  const [presenceData, setPresenceData] = useState({
    isOnline: false,
    lastSeen: null,
    connectedAt: null,
  });

  useEffect(() => {
    if (!userId) {
      setPresenceData({
        isOnline: false,
        lastSeen: null,
        connectedAt: null,
      });
      return;
    }

    const unsubscribe = listenToUserPresence(userId, (data) => {
      setPresenceData(data);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  return presenceData;
};

// Helper function to get presence status for a specific user
export const getPresenceStatus = (userId, presenceStatuses) => {
  const presence = presenceStatuses[userId];
  if (!presence) {
    return {
      isOnline: false,
      lastSeen: null,
      status: "Unknown",
    };
  }

  return {
    isOnline: presence.isOnline,
    lastSeen: presence.lastSeen,
    status: presence.isOnline ? "Online" : "Offline",
  };
};

// Helper function to format last seen time
export const formatLastSeenTime = (timestamp) => {
  if (!timestamp) return "Never";

  const lastSeen = new Date(timestamp);
  const now = new Date();
  const diffInMs = now - lastSeen;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 2) return "a minute ago";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours < 2) return "an hour ago";
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays < 2) return "yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return lastSeen.toLocaleDateString();
};

// Helper function to get formatted status text
export const getFormattedStatusText = (
  userId,
  presenceStatuses,
  isSelfChat = false
) => {
  if (isSelfChat) {
    return "Messages to yourself";
  }

  const presenceStatus = getPresenceStatus(userId, presenceStatuses);

  if (presenceStatus.isOnline) {
    return "Online";
  } else {
    const lastSeenText = formatLastSeenTime(presenceStatus.lastSeen);
    return `Last seen ${lastSeenText}`;
  }
};
