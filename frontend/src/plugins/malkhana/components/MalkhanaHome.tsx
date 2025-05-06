import React from 'react';

const MalkhanaHome: React.FC = () => {
  return (
    <div className="malkhana-home">
      <h1>Malkhana Management</h1>
      <p>This is the main page for the Malkhana module.</p>
      <div className="malkhana-dashboard">
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Items</h3>
            <p className="stat-value">0</p>
          </div>
          <div className="stat-card">
            <h3>Pending Review</h3>
            <p className="stat-value">0</p>
          </div>
          <div className="stat-card">
            <h3>Recently Added</h3>
            <p className="stat-value">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MalkhanaHome; 