import React, { useState } from 'react';
import './Integrations.css';

function Integrations() {
  const [setupStatus, setSetupStatus] = useState({});

  const integrations = [
    {
      name: 'Google Analytics',
      description: 'Track your website traffic and user interactions.',
      link: '#'
    },
    {
      name: 'Slack',
      description: 'Receive notifications and communicate with your team.',
      link: '#'
    },
    {
      name: 'Salesforce',
      description: 'Manage your customer relationships and sales pipeline.',
      link: '#'
    },
    {
      name: 'Zapier',
      description: 'Automate your workflows by connecting your apps.',
      link: '#'
    },
    // Add more integrations as needed
  ];

  const handleSetup = (integrationName) => {
    // Simulate a setup process
    setSetupStatus(prevState => ({
      ...prevState,
      [integrationName]: 'Setting up...'
    }));

    // Simulate a delay for setup
    setTimeout(() => {
      setSetupStatus(prevState => ({
        ...prevState,
        [integrationName]: 'Setup complete'
      }));
    }, 2000);
  };

  return (
    <div className="integrations-container">
      <h2>Integrations</h2>
      <p>Integrate your app with the following services:</p>
      <div className="integrations-list">
        {integrations.map((integration, index) => (
          <div key={index} className="integration-card">
            <h3>{integration.name}</h3>
            <p>{integration.description}</p>
            <button 
              className="integration-link" 
              onClick={() => handleSetup(integration.name)}
              disabled={setupStatus[integration.name] === 'Setup complete'}
            >
              {setupStatus[integration.name] ? setupStatus[integration.name] : 'Set Up'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Integrations;
