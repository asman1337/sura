import React, { useState, useEffect } from 'react';
import { useData } from '../../data';
import { OfficerInfo } from '../../data/auth-service';
import './ProfilePage.css';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  TextField, 
  Typography, 
  Avatar, 
  Grid, 
  Divider, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Person as PersonIcon, 
  Badge as BadgeIcon, 
  Email as EmailIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationCity as LocationIcon,
  Lock as LockIcon
} from '@mui/icons-material';

const ProfilePage: React.FC = () => {
  const { auth, isInitialized } = useData();
  
  // State for user profile
  const [profile, setProfile] = useState<OfficerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for form
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<Partial<OfficerInfo>>({});
  
  // State for password change dialog
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isInitialized) return;
      
      try {
        setLoading(true);
        // First try to get from memory
        let userData = auth.getCurrentUser();
        
        // If not available, fetch from API
        if (!userData) {
          userData = await auth.fetchUserProfile();
        }
        
        if (userData) {
          setProfile(userData);
          setFormValues(userData);
        } else {
          setError('Unable to load user profile');
        }
      } catch (err) {
        setError('Error loading profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [auth, isInitialized]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const updatedProfile = await auth.updateProfile(formValues);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        setIsEditing(false);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordChange = async () => {
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    try {
      setPasswordLoading(true);
      setPasswordError(null);
      
      const success = await auth.changePassword(currentPassword, newPassword);
      
      if (success) {
        setPasswordSuccess(true);
        // Clear form after successful change
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Close dialog after short delay
        setTimeout(() => {
          setPasswordDialogOpen(false);
          setPasswordSuccess(false);
        }, 2000);
      } else {
        setPasswordError('Failed to change password. Please check your current password.');
      }
    } catch (err) {
      setPasswordError('Error changing password');
      console.error(err);
    } finally {
      setPasswordLoading(false);
    }
  };
  
  // Display loading state
  if (loading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Display error state
  if (error && !profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  // Fallback if profile is null
  if (!profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">User profile not available. Please try logging in again.</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>
      
      <Grid container spacing={3}>
        {/* User Info Summary Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem'
                }}
                src={profile.profilePhotoUrl || undefined}
              >
                {profile.firstName?.charAt(0) || 'U'}
              </Avatar>
              
              <Typography variant="h5" component="h2" gutterBottom>
                {`${profile.firstName} ${profile.lastName}`}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {profile.email}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={profile.rank?.name || profile.userType || 'Officer'} 
                  color="primary" 
                  sx={{ mr: 1, mb: 1 }}
                />
                {profile.department && (
                  <Chip 
                    label={profile.department.name} 
                    variant="outlined" 
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                {profile.primaryUnit && (
                  <Chip 
                    label={profile.primaryUnit.name} 
                    variant="outlined" 
                    sx={{ mb: 1 }}
                  />
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Badge: {profile.badgeNumber}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Details/Edit Form Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              {isEditing ? (
                <Box component="form" onSubmit={handleSubmit}>
                  <Typography variant="h6" gutterBottom>
                    Edit Profile
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formValues.firstName || ''}
                        onChange={handleInputChange}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formValues.lastName || ''}
                        onChange={handleInputChange}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formValues.email || ''}
                        onChange={handleInputChange}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Badge Number"
                        name="badgeNumber"
                        value={formValues.badgeNumber || ''}
                        onChange={handleInputChange}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      type="button" 
                      variant="outlined" 
                      onClick={() => {
                        setIsEditing(false);
                        setFormValues(profile);
                      }}
                      sx={{ mr: 2 }}
                    >
                      Cancel
                    </Button>
                    
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    Profile Details
                  </Typography>
                  
                  <Box sx={{ my: 3 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <PersonIcon color="primary" sx={{ mr: 2 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Full Name
                            </Typography>
                            <Typography variant="body1">
                              {`${profile.firstName} ${profile.lastName}`}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <EmailIcon color="primary" sx={{ mr: 2 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body1">
                              {profile.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <BadgeIcon color="primary" sx={{ mr: 2 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Badge Number
                            </Typography>
                            <Typography variant="body1">
                              {profile.badgeNumber}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <WorkIcon color="primary" sx={{ mr: 2 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Role
                            </Typography>
                            <Typography variant="body1">
                              {profile.rank?.name || profile.userType || 'Officer'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      {profile.department && (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <BusinessIcon color="primary" sx={{ mr: 2 }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Department
                              </Typography>
                              <Typography variant="body1">
                                {profile.department.name}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                      
                      {profile.primaryUnit && (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <LocationIcon color="primary" sx={{ mr: 2 }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Unit
                              </Typography>
                              <Typography variant="body1">
                                {profile.primaryUnit.name}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                      
                      {profile.organization && (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <BusinessIcon color="primary" sx={{ mr: 2 }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Organization
                              </Typography>
                              <Typography variant="body1">
                                {profile.organization.name}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                      sx={{ mr: 2 }}
                    >
                      Edit Profile
                    </Button>
                    
                    <Button 
                      variant="outlined"
                      color="secondary" 
                      startIcon={<LockIcon />}
                      onClick={() => setPasswordDialogOpen(true)}
                    >
                      Change Password
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {passwordSuccess ? (
            <Alert severity="success" sx={{ my: 2 }}>
              Password changed successfully!
            </Alert>
          ) : (
            <>
              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordError}
                </Alert>
              )}
              
              <TextField
                autoFocus
                margin="dense"
                label="Current Password"
                type="password"
                fullWidth
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={passwordLoading}
              />
              
              <TextField
                margin="dense"
                label="New Password"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={passwordLoading}
              />
              
              <TextField
                margin="dense"
                label="Confirm New Password"
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={passwordLoading}
              />
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)} disabled={passwordLoading}>
            Cancel
          </Button>
          
          <Button 
            onClick={handlePasswordChange} 
            color="primary"
            disabled={passwordLoading || passwordSuccess}
          >
            {passwordLoading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage; 