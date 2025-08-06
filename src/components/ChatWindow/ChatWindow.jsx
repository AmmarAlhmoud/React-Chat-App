import React, { useState, useEffect } from 'react';
import Header from '../Header/Header';
import Message from '../Message/Message';
import MessageInput from '../MessageInput/MessageInput';
import TypingIndicator from '../TypingIndicator/TypingIndicator';
import styles from './ChatWindow.module.css';

const ChatWindow = ({ currentChat, onToggleSidebar }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey John! How's the new chat app coming along?",
      type: 'received',
      time: '2:25 PM',
      avatar: 'SW'
    },
    {
      id: 2,
      text: "It's going great! Just finished the UI design. Want to take a look?",
      type: 'sent',
      time: '2:26 PM'
    },
    {
      id: 3,
      text: "Absolutely! I'd love to see what you've built.",
      type: 'received',
      time: '2:28 PM',
      avatar: 'SW'
    },
    {
      id: 4,
      text: "Here's the demo. It has dark mode, responsive design, and all the features we discussed! 🚀",
      type: 'sent',
      time: '2:29 PM'
    },
    {
      id: 5,
      text: "This looks amazing! The design is so clean and professional.",
      type: 'received',
      time: '2:30 PM',
      avatar: 'SW'
    }
  ]);
  
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (messageText) => {
    const newMessage = {
      id: messages.length + 1,
      text: messageText,
      type: 'sent',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate typing indicator
    setIsTyping(true);

    // Simulate response after 2 seconds
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "That sounds great!",
        "I agree with that approach.",
        "Let me check and get back to you.",
        "Perfect! Thanks for the update.",
        "Looks good to me! 👍"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const responseMessage = {
        id: messages.length + 2,
        text: randomResponse,
        type: 'received',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        avatar: 'SW'
      };
      
      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  };

  return (
    <div className={styles.chatMain}>
      <Header 
        currentChat={currentChat}
        onToggleSidebar={onToggleSidebar}
      />
      
      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        
        {isTyping && <TypingIndicator />}
      </div>
      
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;