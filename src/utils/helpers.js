export const generateInitials = (name) => {
  if (!name) return "";

  // Remove (You) if present
  const cleaned = name.replace(/\s*\(You\)$/, "").trim();
  const words = cleaned.split(/\s+/);

  // Take only first two words
  const initials = words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return initials;
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
