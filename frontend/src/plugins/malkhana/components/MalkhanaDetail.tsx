import React from 'react';
import { useParams } from 'react-router-dom';

type MalkhanaDetailParams = {
  id: string;
};

const MalkhanaDetail: React.FC = () => {
  const { id } = useParams<MalkhanaDetailParams>();

  return (
    <div className="malkhana-detail">
      <h1>Malkhana Item Details</h1>
      <p>Viewing details for item ID: {id}</p>
      
      <div className="malkhana-item-card">
        <div className="item-header">
          <h2>Item #{id}</h2>
          <span className="status-badge">In Storage</span>
        </div>
        
        <div className="item-details">
          <div className="detail-row">
            <label>Case Number:</label>
            <span>FIR-2023-{id}</span>
          </div>
          <div className="detail-row">
            <label>Date Added:</label>
            <span>January 1, 2023</span>
          </div>
          <div className="detail-row">
            <label>Description:</label>
            <span>Placeholder item description</span>
          </div>
          <div className="detail-row">
            <label>Storage Location:</label>
            <span>Rack A, Shelf 2</span>
          </div>
        </div>
        
        <div className="item-actions">
          <button className="btn primary">Edit Details</button>
          <button className="btn secondary">Transfer</button>
          <button className="btn danger">Dispose</button>
        </div>
      </div>
    </div>
  );
};

export default MalkhanaDetail; 