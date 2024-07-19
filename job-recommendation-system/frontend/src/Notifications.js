import React, { useState } from 'react';
import './Notifications.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faInfoCircle, faExclamationCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

function Notifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Your profile has been updated successfully.', type: 'success' },
    { id: 2, text: 'You have a new message from the support team.', type: 'info' },
    { id: 3, text: 'Your subscription is about to expire.', type: 'warning' },
    { id: 4, text: 'Failed to fetch job recommendations.', type: 'error' },
  ]);

  const markAsRead = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FontAwesomeIcon icon={faCheckCircle} className="notification-icon" />;
      case 'info':
        return <FontAwesomeIcon icon={faInfoCircle} className="notification-icon" />;
      case 'warning':
        return <FontAwesomeIcon icon={faExclamationCircle} className="notification-icon" />;
      case 'error':
        return <FontAwesomeIcon icon={faTimesCircle} className="notification-icon" />;
      default:
        return null;
    }
  };

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          <span>{getIcon(notification.type)}</span>
          {notification.text}
          <button className="mark-read" onClick={() => markAsRead(notification.id)}>
            Mark as read
          </button>
        </div>
      ))}
    </div>
  );
}

export default Notifications;
