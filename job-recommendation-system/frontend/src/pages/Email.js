import React from 'react';

const PLANS = [
  { tier: 'Basic Plan', items: ['Email support', 'Access to basic features', '10 job applications / month'] },
  { tier: 'Pro Plan', items: ['Priority email support', 'Access to all features', 'Unlimited applications', 'Personalized recommendations'] },
  { tier: 'Enterprise Plan', items: ['Dedicated account manager', 'Custom integrations', 'On-site training'] },
];

function Email() {
  return (
    <div>
      <div className="page-head">
        <h2>Contact us</h2>
        <p>Questions or need support? Reach out based on your plan.</p>
      </div>
      <div className="contact-grid">
        {PLANS.map((p, i) => (
          <div key={i} className="contact-card ui-card">
            <h3>{p.tier}</h3>
            <ul>
              <li><i className="fas fa-envelope"></i> <a href="mailto:Blackapple805@gmail.com">Blackapple805@gmail.com</a></li>
              {p.items.map((it, j) => (
                <li key={j}><i className="fas fa-check"></i> {it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Email;
