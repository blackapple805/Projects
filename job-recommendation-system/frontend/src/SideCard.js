import React from 'react';
import './SideCard.css';

const SideCard = ({ position, content }) => {
  return (
    <div className={`side-card ${position}`}>
      <div className="box">
        <span></span>
        <div className="content">
          {content}
        </div>
      </div>
    </div>
  );
};

export default SideCard;
