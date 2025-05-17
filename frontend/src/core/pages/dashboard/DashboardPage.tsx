import React, { useEffect, useState } from 'react';
import { useData } from '../../data';

interface UserInfo {
  username: string;
  role: string;
}

const DashboardPage: React.FC = () => {
  const { auth } = useData();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  // In a real app, you would fetch this from your API
  // For now, we're mocking this data
  useEffect(() => {
    // Simulate fetching user info
    setTimeout(() => {
      setUserInfo({
        username: 'demo_user',
        role: 'Officer'
      });
    }, 500);
  }, []);
  
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="welcome-message">
          Welcome, {userInfo ? userInfo.username : 'User'}!
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Cases</div>
          <div className="stat-value">24</div>
          <div className="stat-subtitle">Active cases</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Evidence</div>
          <div className="stat-value">128</div>
          <div className="stat-subtitle">Items in Malkhana</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Tasks</div>
          <div className="stat-value">12</div>
          <div className="stat-subtitle">Pending tasks</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Reports</div>
          <div className="stat-value">8</div>
          <div className="stat-subtitle">Needs review</div>
        </div>
      </div>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h2>Recent Activity</h2>
          <ul className="activity-list">
            <li>
              <span className="activity-time">9:45 AM</span>
              <span className="activity-description">New evidence item added to case #4872</span>
            </li>
            <li>
              <span className="activity-time">Yesterday</span>
              <span className="activity-description">You were assigned to case #4983</span>
            </li>
            <li>
              <span className="activity-time">3 days ago</span>
              <span className="activity-description">Report #38 was approved</span>
            </li>
          </ul>
        </div>
        
        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-button">New Case</button>
            <button className="action-button">Add Evidence</button>
            <button className="action-button">Create Report</button>
            <button className="action-button">Assign Task</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 