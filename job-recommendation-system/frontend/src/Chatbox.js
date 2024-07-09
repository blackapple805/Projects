import React, { useState } from 'react';
import './Chatbox.css';

const Chatbox = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const userMessage = { text: inputValue, isBot: false };
      setMessages([...messages, userMessage]);
      setInputValue('');

      const botResponse = getBotResponse(inputValue);
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, { text: botResponse, isBot: true }]);
      }, 1000);
    }
  };

  const getBotResponse = (message) => {
    message = message.toLowerCase();
    if (message.includes('help')) {
      return 'Sure, what do you need help with?';
    } else if (message.includes('contact')) {
      return 'You can contact our support team at support@jobfinder.com';
    } else if (message.includes('pricing')) {
      return 'Our plans are:\n1. Basic Plan - $9.99/month\n2. Pro Plan - $19.99/month\n3. Enterprise Plan - Contact us';
    } else if (message.includes('features')) {
      return 'Our platform offers job recommendations, project management, task tracking, and more!';
    } else {
      return 'Sorry, I did not understand that. Can you please rephrase?';
    }
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-header">
        <h3>Chatbot</h3>
        <button onClick={onClose} className="chatbox-close-button">&times;</button>
      </div>
      <div className="chatbox-body">
        {messages.map((msg, index) => (
          <p key={index} className={msg.isBot ? 'bot-message' : 'user-message'}>
            {msg.text}
          </p>
        ))}
      </div>
      <div className="chatbox-footer">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbox;
