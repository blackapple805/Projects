import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Plan.css';

function Plan() {
  const navigate = useNavigate();

  const handleBasicPlan = () => {
    navigate('/dashboard/billing', { state: { plan: 'basic' } });
  };

  const handleProPlan = () => {
    navigate('/dashboard/billing', { state: { plan: 'pro' } });
  };

  const handleEnterprisePlan = () => {
    navigate('/dashboard/email');
  };

  return (
    <div className="plan-container">
      <h2>Our Plans</h2>
      <p>Choose the plan that best suits your needs.</p>
      <div className="plans">
        <div className="plan-card">
          <h3>Basic Plan</h3>
          <p className="price">$9.99/month</p>
          <ul>
            <li>Access to basic features</li>
            <li>Email support</li>
            <li>10 job applications per month</li>
          </ul>
          <button onClick={handleBasicPlan}>Choose Plan</button>
        </div>
        <div className="plan-card">
          <h3>Pro Plan</h3>
          <p className="price">$19.99/month</p>
          <ul>
            <li>Access to all features</li>
            <li>Priority email support</li>
            <li>Unlimited job applications</li>
            <li>Personalized job recommendations</li>
          </ul>
          <button onClick={handleProPlan}>Choose Plan</button>
        </div>
        <div className="plan-card">
          <h3>Enterprise Plan</h3>
          <p className="price">Contact us</p>
          <ul>
            <li>All Pro Plan features</li>
            <li>Dedicated account manager</li>
            <li>Custom integrations</li>
            <li>On-site training</li>
          </ul>
          <button onClick={handleEnterprisePlan}>Contact Us</button>
        </div>
      </div>
    </div>
  );
}

export default Plan;
