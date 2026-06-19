import React from 'react';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  { tier: 'Basic', price: '$9.99', period: '/month', features: ['Access to basic features', 'Email support', '10 job applications per month'], cta: 'Choose plan', to: '/dashboard/billing', state: { plan: 'basic' } },
  { tier: 'Pro', price: '$19.99', period: '/month', featured: true, features: ['Access to all features', 'Priority email support', 'Unlimited job applications', 'Personalized job recommendations'], cta: 'Choose plan', to: '/dashboard/billing', state: { plan: 'pro' } },
  { tier: 'Enterprise', price: 'Custom', period: '', features: ['All Pro features', 'Dedicated account manager', 'Custom integrations', 'On-site training'], cta: 'Contact us', to: '/dashboard/email' },
];

function Plan() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="page-head">
        <h2>Plans &amp; pricing</h2>
        <p>Choose the plan that best fits your job search.</p>
      </div>
      <div className="plan-grid">
        {PLANS.map((p, i) => (
          <div key={i} className={`plan-card ui-card ${p.featured ? 'featured' : ''}`}>
            {p.featured && <span className="plan-badge">Popular</span>}
            <span className="tier">{p.tier}</span>
            <div className="plan-price">{p.price}<small>{p.period}</small></div>
            <ul className="plan-features">
              {p.features.map((f, j) => <li key={j}><i className="fas fa-check"></i> {f}</li>)}
            </ul>
            <button className={`btn ${p.featured ? 'btn-primary' : 'btn-ghost'}`} onClick={() => navigate(p.to, { state: p.state })}>
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Plan;