import React, { useState, useEffect } from 'react';
import { useData } from '../../data';
import { OfficerInfo } from '../../data/auth-service';
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
  CircularProgress,
  alpha,
  useTheme,
  Fade,
  Grow,
  Paper,
  Tooltip,
  Stack
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Person as PersonIcon, 
  Badge as BadgeIcon, 
  Email as EmailIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationCity as LocationIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const ProfilePage: React.FC = () => {
  const { auth, isInitialized } = useData();
  const theme = useTheme();
  
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
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '70vh' 
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ mt: 3, fontWeight: 500 }}>
          Loading profile information...
        </Typography>
      </Box>
    );
  }
  
  // Display error state
  if (error && !profile) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert 
          severity="error"
          variant="filled"
          sx={{ boxShadow: 2 }}
        >
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          sx={{ mt: 3 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
  // Fallback if profile is null
  if (!profile) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert 
          severity="warning"
          variant="filled"
          sx={{ boxShadow: 2 }}
        >
          User profile not available. Please try logging in again.
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Fade in={true}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              boxShadow: 2,
              borderRadius: 1
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Fade>
      )}
      
      <Fade in={true} timeout={800}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 500,
            position: 'relative',
            mb: 4,
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: 60,
              height: 4,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 2
            }
          }}
        >
          User Profile
        </Typography>
      </Fade>
      
      <Grid container spacing={3}>
        {/* User Info Summary Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Grow in={true} timeout={800}>
            <Card elevation={3} sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'all 0.3s',
              background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.6)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    boxShadow: 3,
                    border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                  src={profile.profilePhotoUrl || undefined}
                >
                  {profile.firstName?.charAt(0) || 'U'}
                </Avatar>
                
                <Typography variant="h5" component="h2" gutterBottom fontWeight={600} sx={{ mb: 0.5 }}>
                  {`${profile.firstName} ${profile.lastName}`}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <EmailIcon fontSize="small" sx={{ mr: 1, color: 'primary.main', opacity: 0.8 }} />
                  {profile.email}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={profile.rank?.name || profile.userType || 'Officer'} 
                    color="primary" 
                    sx={{ mr: 1, mb: 1, fontWeight: 500 }}
                  />
                  {profile.department && (
                    <Tooltip title="Department">
                      <Chip 
                        icon={<BusinessIcon />}
                        label={profile.department.name} 
                        variant="outlined" 
                        sx={{ mr: 1, mb: 1 }}
                      />
                    </Tooltip>
                  )}
                  {profile.primaryUnit && (
                    <Tooltip title="Primary Unit">
                      <Chip 
                        icon={<LocationIcon />}
                        label={profile.primaryUnit.name} 
                        variant="outlined" 
                        sx={{ mb: 1 }}
                      />
                    </Tooltip>
                  )}
                </Box>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <BadgeIcon sx={{ mr: 1, fontSize: '1rem' }} />
                  Badge: {profile.badgeNumber}
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        {/* Details/Edit Form Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Fade in={true} timeout={1000}>
            <Card elevation={3} sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              height: '100%',
              position: 'relative',
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: 4
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                {isEditing ? (
                  <Box component="form" onSubmit={handleSubmit}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 3,
                        color: 'primary.main',
                        fontWeight: 600
                      }}
                    >
                      <EditIcon sx={{ mr: 1 }} />
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
                    
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        type="button" 
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                          setIsEditing(false);
                          setFormValues(profile);
                        }}
                        sx={{ mr: 2 }}
                        startIcon={<CancelIcon />}
                      >
                        Cancel
                      </Button>
                      
                      <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ 
                          mb: 0, 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        Profile Details
                      </Typography>
                      
                      <Box>
                        <Tooltip title="Edit Profile">
                          <Button 
                            variant="outlined" 
                            startIcon={<EditIcon />}
                            onClick={() => setIsEditing(true)}
                            sx={{ mr: 2 }}
                          >
                            Edit Profile
                          </Button>
                        </Tooltip>
                        
                        <Tooltip title="Change Password">
                          <Button 
                            variant="outlined"
                            color="secondary" 
                            startIcon={<LockIcon />}
                            onClick={() => setPasswordDialogOpen(true)}
                          >
                            Change Password
                          </Button>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    <Stack spacing={3}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.background.default, 0.7),
                          borderRadius: 2
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                  color: 'primary.main',
                                  mr: 2
                                }}
                              >
                                <PersonIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Full Name
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {`${profile.firstName} ${profile.lastName}`}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                  color: 'primary.main',
                                  mr: 2
                                }}
                              >
                                <EmailIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Email
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {profile.email}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                      
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.background.default, 0.7),
                          borderRadius: 2
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: alpha(theme.palette.info.main, 0.1), 
                                  color: 'info.main',
                                  mr: 2
                                }}
                              >
                                <BadgeIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Badge Number
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {profile.badgeNumber}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: alpha(theme.palette.info.main, 0.1), 
                                  color: 'info.main',
                                  mr: 2
                                }}
                              >
                                <WorkIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Role
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {profile.rank?.name || profile.userType || 'Officer'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                      
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.background.default, 0.7),
                          borderRadius: 2
                        }}
                      >
                        <Grid container spacing={2}>
                          {profile.department && (
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.success.main, 0.1), 
                                    color: 'success.main',
                                    mr: 2
                                  }}
                                >
                                  <BusinessIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Department
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {profile.department.name}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          )}
                          
                          {profile.primaryUnit && (
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.success.main, 0.1), 
                                    color: 'success.main',
                                    mr: 2
                                  }}
                                >
                                  <LocationIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Unit
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {profile.primaryUnit.name}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          )}
                          
                          {profile.organization && (
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.success.main, 0.1), 
                                    color: 'success.main',
                                    mr: 2
                                  }}
                                >
                                  <BusinessIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Organization
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {profile.organization.name}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
      
      {/* Password Change Dialog */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 'sm',
            width: '100%'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          display: 'flex',
          alignItems: 'center'
        }}>
          <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
          Change Password
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {passwordSuccess ? (
            <Alert severity="success" variant="filled" sx={{ my: 2 }}>
              Password changed successfully!
            </Alert>
          ) : (
            <>
              {passwordError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {passwordError}
                </Alert>
              )}
              
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Current Password"
                  type="password"
                  fullWidth
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={passwordLoading}
                  variant="outlined"
                />
                
                <TextField
                  margin="dense"
                  label="New Password"
                  type="password"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordLoading}
                  variant="outlined"
                  helperText="Password must be at least 8 characters"
                />
                
                <TextField
                  margin="dense"
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordLoading}
                  variant="outlined"
                />
              </Stack>
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setPasswordDialogOpen(false)} 
            disabled={passwordLoading}
            variant="outlined"
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          
          <Button 
            onClick={handlePasswordChange} 
            color="primary"
            variant="contained"
            disabled={passwordLoading || passwordSuccess || !currentPassword || !newPassword || !confirmPassword}
            startIcon={passwordLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage; 