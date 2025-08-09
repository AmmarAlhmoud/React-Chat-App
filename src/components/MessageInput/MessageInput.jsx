import React, { useState, useRef, useEffect } from "react";
import styles from "./MessageInput.module.css";

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Common emojis organized by categories
  const emojiCategories = {
    "Smileys & People": [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "😂",
      "🤣",
      "😊",
      "😇",
      "🙂",
      "🙃",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😗",
      "😙",
      "😚",
      "😋",
      "😛",
      "😝",
      "😜",
      "🤪",
      "🤨",
      "🧐",
      "🤓",
      "😎",
      "🤩",
      "🥳",
      "😏",
      "😒",
      "😞",
      "😔",
      "😟",
      "😕",
      "🙁",
      "☹️",
      "😣",
      "😖",
      "😫",
      "😩",
      "🥺",
      "😢",
      "😭",
      "😤",
      "😠",
      "😡",
      "🤬",
    ],
    "Hearts & Symbols": [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "☮️",
      "✝️",
      "☪️",
      "🕉️",
      "☸️",
      "✡️",
      "🔯",
      "🕎",
      "☯️",
      "☦️",
      "🛐",
    ],
    Nature: [
      "🌱",
      "🌿",
      "☘️",
      "🍀",
      "🎋",
      "🎍",
      "🌳",
      "🌲",
      "🌴",
      "🌵",
      "🌾",
      "🌻",
      "🌸",
      "🌼",
      "🌺",
      "🌷",
      "🌹",
      "🥀",
      "🌊",
      "🌈",
    ],
    "Food & Drink": [
      "🍎",
      "🍊",
      "🍋",
      "🍌",
      "🍉",
      "🍇",
      "🍓",
      "🍈",
      "🍒",
      "🍑",
      "🥭",
      "🍍",
      "🥥",
      "🥝",
      "🍅",
      "🍆",
      "🥑",
      "🥦",
      "🥬",
      "🥒",
      "🌶️",
      "🫑",
      "🌽",
      "🥕",
      "🫒",
      "🧄",
      "🧅",
      "🥔",
      "🍠",
      "🥐",
    ],
    Activities: [
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🥎",
      "🎾",
      "🏐",
      "🏉",
      "🥏",
      "🎱",
      "🪀",
      "🏓",
      "🏸",
      "🏒",
      "🏑",
      "🥍",
      "🏏",
      "🪃",
      "🥅",
      "⛳",
    ],
  };

  // Handle emoji picker outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const autoResize = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage =
        message.substring(0, start) + emoji + message.substring(end);

      setMessage(newMessage);

      // Set cursor position after emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    if (!showEmojiPicker) {
      // Store current cursor position when opening emoji picker
      if (textareaRef.current) {
        setCursorPosition(textareaRef.current.selectionStart);
      }
    }
  };

  return (
    <div className={styles.messageInputContainer}>
      <div className={styles.messageInputWrapper} onSubmit={handleSubmit}>
        {/* TODO: Support file uploads */}
        {/* <button type="button" className="icon-btn" title="Attach file">
          <i className="fas fa-paperclip"></i>
        </button> */}

        <textarea
          ref={textareaRef}
          className={styles.messageInput}
          placeholder="Type a message..."
          rows="1"
          value={message}
          onChange={handleTextareaChange}
          onKeyPress={handleKeyPress}
          onInput={autoResize}
        />

        <div className={styles.inputActions}>
          <div className={styles.emojiContainer}>
            <button
              type="button"
              className={`icon-btn ${showEmojiPicker ? styles.active : ""}`}
              onClick={toggleEmojiPicker}
              title="Add emoji"
            >
              <i className="fas fa-smile"></i>
            </button>

            {showEmojiPicker && (
              <div ref={emojiPickerRef} className={styles.emojiPicker}>
                <div className={styles.emojiHeader}>
                  <span>Choose an emoji</span>
                  <button
                    type="button"
                    className={styles.closeEmoji}
                    onClick={() => setShowEmojiPicker(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.emojiContent}>
                  {Object.entries(emojiCategories).map(([category, emojis]) => (
                    <div key={category} className={styles.emojiCategory}>
                      <div className={styles.categoryTitle}>{category}</div>
                      <div className={styles.emojiGrid}>
                        {emojis.map((emoji, index) => (
                          <button
                            key={`${category}-${index}`}
                            type="button"
                            className={styles.emojiButton}
                            onClick={() => insertEmoji(emoji)}
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!message.trim()}
            title="Send message"
            onClick={handleSubmit}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
