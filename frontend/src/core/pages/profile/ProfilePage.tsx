import React, { useState } from 'react';
import { useData } from '../../data';
import './ProfilePage.css';

interface UserProfile {
  username: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  badgeNumber: string;
}

const ProfilePage: React.FC = () => {
  const { auth } = useData();
  
  // In a real app, you would fetch this from your API
  // For now, we're using mock data
  const [profile, setProfile] = useState<UserProfile>({
    username: 'demo_user',
    fullName: 'Demo User',
    email: 'demo@example.com',
    role: 'Officer',
    department: 'Investigation',
    badgeNumber: 'B1234'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<UserProfile>(profile);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your API
    setProfile(formValues);
    setIsEditing(false);
  };
  
  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>User Profile</h1>
      </div>
      
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="profile-info">
            <h2>{profile.fullName}</h2>
            <p className="profile-role">{profile.role}</p>
            <p className="profile-department">{profile.department}</p>
          </div>
        </div>
        
        <div className="profile-content">
          {isEditing ? (
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formValues.fullName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formValues.department}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="badgeNumber">Badge Number</label>
                <input
                  type="text"
                  id="badgeNumber"
                  name="badgeNumber"
                  value={formValues.badgeNumber}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="profile-actions">
                <button type="submit" className="save-button">Save Changes</button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormValues(profile);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-details">
                <div className="profile-field">
                  <div className="field-label">Username</div>
                  <div className="field-value">{profile.username}</div>
                </div>
                
                <div className="profile-field">
                  <div className="field-label">Email</div>
                  <div className="field-value">{profile.email}</div>
                </div>
                
                <div className="profile-field">
                  <div className="field-label">Department</div>
                  <div className="field-value">{profile.department}</div>
                </div>
                
                <div className="profile-field">
                  <div className="field-label">Badge Number</div>
                  <div className="field-value">{profile.badgeNumber}</div>
                </div>
              </div>
              
              <div className="profile-actions">
                <button 
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
                
                <button 
                  className="password-button"
                  onClick={() => {/* Would open change password modal */}}
                >
                  Change Password
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 