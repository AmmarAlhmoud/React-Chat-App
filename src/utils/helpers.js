export const generateInitials = (name) => {
  if (!name) return "";
  const words = name
    .trim()
    .split(" ")
    .filter((word) => word.length > 0);

  if (words.length === 1) {
    return words[0][0].toUpperCase();
  } else if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return "";
};

export const formatTime = (timestamp) => {
  if (!timestamp) return "";

  const messageDate = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDay = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );

  if (messageDay.getTime() === today.getTime()) {
    // Today - show time
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (messageDay.getTime() === today.getTime() - 86400000) {
    // Yesterday
    return "Yesterday";
  } else {
    // Older - show date
    return messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  }
};
