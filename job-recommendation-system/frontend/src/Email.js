import React from 'react';
import './Email.css';

function Email() {
  return (
    <div className="email-container">
      <h2>Contact Us</h2>
      <p>If you have any questions or need support, please reach out to us based on your plan:</p>
      <div className="email-content">
        <div className="plan">
          <h3>Basic Plan</h3>
          <p>Email support: <a href="mailto:Blackapple805@gmail.com">Blackapple805@gmail.com</a></p>
          <p>Access to basic features</p>
          <p>10 job applications per month</p>
        </div>
        <div className="plan">
          <h3>Pro Plan</h3>
          <p>Priority email support: <a href="mailto:Blackapple805@gmail.com">Blackapple805@gmail.com</a></p>
          <p>Access to all features</p>
          <p>Unlimited job applications</p>
          <p>Personalized job recommendations</p>
        </div>
        <div className="plan">
          <h3>Enterprise Plan</h3>
          <p>Dedicated account manager: <a href="mailto:Blackapple805@gmail.com">Blackapple805@gmail.com</a></p>
          <p>Custom integrations</p>
          <p>On-site training</p>
        </div>
      </div>
    </div>
  );
}

export default Email;
