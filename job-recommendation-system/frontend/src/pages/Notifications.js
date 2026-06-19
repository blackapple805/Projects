import React, { useState } from 'react';

const ICONS = { success: 'fa-circle-check', info: 'fa-circle-info', warning: 'fa-triangle-exclamation', error: 'fa-circle-xmark' };

function Notifications() {
  const [items, setItems] = useState([
    { id: 1, text: 'Your profile has been updated successfully.', type: 'success', time: '2 hours ago' },
    { id: 2, text: 'You have a new message from the support team.', type: 'info', time: '1 hour ago' },
    { id: 3, text: 'Your subscription is about to expire.', type: 'warning', time: '30 minutes ago' },
    { id: 4, text: 'Failed to fetch job recommendations.', type: 'error', time: '2 hours ago' },
  ]);

  const dismiss = (id) => setItems(prev => prev.filter(n => n.id !== id));

  return (
    <div>
      <div className="page-head">
        <h2>Notifications</h2>
        <p>Updates and alerts from across your account.</p>
      </div>
      {items.length === 0 ? (
        <div className="notif-empty">
          <i className="fas fa-bell-slash"></i>
          <p>You're all caught up.</p>
        </div>
      ) : (
        <div className="notif-list">
          {items.map(n => (
            <div key={n.id} className={`notif ${n.type}`}>
              <i className={`n-icon fas ${ICONS[n.type]}`}></i>
              <div className="n-body">
                <p>{n.text}</p>
                <span className="n-time">{n.time}</span>
              </div>
              <button className="btn btn-ghost" onClick={() => dismiss(n.id)}>Mark as read</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;