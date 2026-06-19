import React, { useState } from 'react';

const INTEGRATIONS = [
  { name: 'Google Analytics', description: 'Track your website traffic and user interactions.', icon: 'fa-chart-line' },
  { name: 'Slack', description: 'Receive notifications and communicate with your team.', icon: 'fa-slack', brand: true },
  { name: 'Salesforce', description: 'Manage your customer relationships and sales pipeline.', icon: 'fa-salesforce', brand: true },
  { name: 'Zapier', description: 'Automate your workflows by connecting your apps.', icon: 'fa-bolt' },
];

function Integrations() {
  const [status, setStatus] = useState({});

  const setup = (name) => {
    setStatus(s => ({ ...s, [name]: 'connecting' }));
    setTimeout(() => setStatus(s => ({ ...s, [name]: 'connected' })), 1500);
  };

  return (
    <div>
      <div className="page-head">
        <h2>Integrations</h2>
        <p>Connect JobFinder with the tools you already use.</p>
      </div>
      <div className="card-grid">
        {INTEGRATIONS.map((it, i) => {
          const st = status[it.name];
          return (
            <div key={i} className="integration-card ui-card">
              <div className="integration-top">
                <span className="integration-logo"><i className={`${it.brand ? 'fab' : 'fas'} ${it.icon}`}></i></span>
                <h3>{it.name}</h3>
              </div>
              <p>{it.description}</p>
              {st === 'connected' ? (
                <span className="badge green">Connected</span>
              ) : (
                <button className="btn btn-primary" onClick={() => setup(it.name)} disabled={st === 'connecting'}>
                  {st === 'connecting' ? 'Connecting…' : 'Set up'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Integrations;