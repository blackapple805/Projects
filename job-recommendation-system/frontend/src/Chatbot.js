import React, { useState } from 'react';
import './Chatbot.css';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { text: inputValue, isBot: false }]);
      setInputValue('');

      setTimeout(() => {
        const response = getBotResponse(inputValue);
        setMessages(prevMessages => [
          ...prevMessages,
          { text: response, isBot: true }
        ]);
      }, 1000);
    }
  };

  const getBotResponse = (input) => {
    input = input.toLowerCase();
    if (input.includes('help')) {
      return 'Sure, what do you need help with?';
    } else if (input.includes('contact support')) {
      return 'You can contact our support team at support@jobfinder.com';
    } else if (input.includes('pricing')) {
      return 'Our plans are:\n1. Basic Plan - $9.99/month\n2. Pro Plan - $19.99/month\n3. Enterprise Plan - Contact us';
    } else if (input.includes('features')) {
      return 'Our platform offers job recommendations, project management, task tracking, and more!';
    } else if (input.includes('account')) {
      return 'Sure, what do you need help with regarding your account?';
    } else if (input.includes('job applications')) {
      return 'Yes, I can assist you with job applications. What specifically would you like to know?';
    } else if (input.includes('upgrade')) {
      return 'To upgrade your plan, go to the "Plan" section in your dashboard and select the desired plan.';
    } else if (input.includes('difference between')) {
      return 'The Basic Plan includes access to basic features and email support with 10 job applications per month. The Pro Plan includes all features, priority email support, unlimited job applications, and personalized job recommendations.';
    } else if (input.includes('reset my password')) {
      return 'To reset your password, go to the "Password" section in your dashboard and follow the instructions.';
    } else if (input.includes('integrations')) {
      return 'In the "Integrations" section of your dashboard, you can find all available integrations. If you need specific information, let me know.';
    } else {
      return 'Sorry, I did not understand that. Can you please rephrase?';
    }
  };

  const handleExampleClick = (example) => {
    setInputValue(example);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>Chatbot</h3>
        <button onClick={onClose} className="chatbox-close-button">&times;</button>
      </div>
      <div className="chatbot-body">
        {messages.map((msg, index) => (
          <p key={index} className={msg.isBot ? 'bot-message message-bubble' : 'user-message message-bubble'}>
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
      <div className="example-questions">
        <h4>Example Questions:</h4>
        <ul>
          <li onClick={() => handleExampleClick('How can I contact support?')}>How can I contact support?</li>
          <li onClick={() => handleExampleClick('Tell me about your pricing')}>Tell me about your pricing</li>
          <li onClick={() => handleExampleClick('What features do you offer?')}>What features do you offer?</li>
          <li onClick={() => handleExampleClick('I need assistance with my account')}>I need assistance with my account</li>
          <li onClick={() => handleExampleClick('Can you help me with job applications?')}>Can you help me with job applications?</li>
          <li onClick={() => handleExampleClick('How do I upgrade my plan?')}>How do I upgrade my plan?</li>
          <li onClick={() => handleExampleClick('What is the difference between the Basic and Pro plans?')}>What is the difference between the Basic and Pro plans?</li>
          <li onClick={() => handleExampleClick('How do I reset my password?')}>How do I reset my password?</li>
          <li onClick={() => handleExampleClick('I want to learn more about integrations')}>I want to learn more about integrations</li>
        </ul>
      </div>
    </div>
  );
};

export default Chatbot;
