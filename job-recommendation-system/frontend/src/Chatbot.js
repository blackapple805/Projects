import React, { useState } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { text: inputValue, isBot: false }]);
      setInputValue('');

      setTimeout(() => {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: `You said: ${inputValue}`, isBot: true }
        ]);
      }, 1000);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>Chatbot</h3>
        <button onClick={() => toggleChatbot()}>Close</button>
      </div>
      <div className="chatbot-body">
        {messages.map((msg, index) => (
          <p key={index} className={msg.isBot ? 'bot-message' : 'user-message'}>
            {msg.text}
          </p>
        ))}
      </div>
      <div className="chatbot-footer">
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

const toggleChatbot = () => {
  const chatbot = document.querySelector('.chatbot-container');
  if (chatbot.style.display === 'none' || chatbot.style.display === '') {
    chatbot.style.display = 'flex';
  } else {
    chatbot.style.display = 'none';
  }
};

export default Chatbot;
