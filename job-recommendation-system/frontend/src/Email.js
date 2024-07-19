import React from 'react';
import './Email.css';

function Email() {
  return (
    <div className="email-container">
      <h2>Contact Us</h2>
      <p>If you have any questions or need support, please reach out to us based on your plan:</p>
      <div className="email-content">
        <div className="email-plan">
          <h3 className="email-plan-title">Basic Plan</h3>
          <p className="email-plan-body">Email support: <a href="mailto:Blackapple805@gmail.com">Blackapple805@gmail.com</a></p>
          <p className="email-plan-body">Access to basic features</p>
          <p className="email-plan-body">10 job applications per month</p>
        </div>
        <div className="email-plan">
          <h3 className="email-plan-title">Pro Plan</h3>
          <p className="email-plan-body">Priority email support: <a href="mailto:Blackapple805@gmail.com">Blackapple805@gmail.com</a></p>
          <p className="email-plan-body">Access to all features</p>
          <p className="email-plan-body">Unlimited job applications</p>
          <p className="email-plan-body">Personalized job recommendations</p>
        </div>
        <div className="email-plan">
          <h3 className="email-plan-title">Enterprise Plan</h3>
          <p className="email-plan-body">Dedicated account manager: <a href="mailto:Blackapple805@gmail.com">Blackapple805@gmail.com</a></p>
          <p className="email-plan-body">Custom integrations</p>
          <p className="email-plan-body">On-site training</p>
        </div>
      </div>
    </div>
  );
}

export default Email;
