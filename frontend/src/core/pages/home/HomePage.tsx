import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useData } from '../../data';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import { StatCard } from '../../components/shared/Card';

// Icon components (we would use actual MUI icons in a real implementation)
const DashboardIcon = () => <span role="img" aria-label="dashboard">📊</span>;
const CaseIcon = () => <span role="img" aria-label="case">🔍</span>;
const EvidenceIcon = () => <span role="img" aria-label="evidence">🏛️</span>;
const PersonnelIcon = () => <span role="img" aria-label="personnel">👮</span>;
const SecurityIcon = () => <span role="img" aria-label="security">🔒</span>;
const SpeedIcon = () => <span role="img" aria-label="speed">⚡</span>;

const HomePage: React.FC = () => {
  const { auth } = useData();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.up('sm'));
  const isLoggedIn = !!auth.getToken();
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 0,
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 6, md: 8 },
          px: 0,
          mb: 0
        }}
      >
        {/* Background design elements - keeping but with adjusted opacity */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: -50,
            right: -50,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'primary.light',
            opacity: 0.1,
            zIndex: 0
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            bgcolor: 'primary.dark',
            opacity: 0.05,
            zIndex: 0
          }} 
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 4, 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ flex: '1 1 auto', maxWidth: { xs: '100%', md: '50%' } }}>
              <Typography 
                variant="h1" 
                component="h1"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  fontWeight: 800,
                  mb: 2,
                  letterSpacing: '-0.5px',
                  lineHeight: 1.1
                }}
              >
                SURA Police<br />
                Management System
              </Typography>
              
              <Typography 
                variant="body1" 
                component="p"
                sx={{ 
                  mb: 3,
                  maxWidth: '650px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.6,
                  fontSize: '1rem'
                }}
              >
                A comprehensive solution for police departments to manage cases, 
                evidence, personnel, and resources efficiently.
              </Typography>
              
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                {isLoggedIn ? (
                  <Button
                    component={RouterLink}
                    to="/dashboard"
                    variant="contained"
                    color="secondary"
                    sx={{ 
                      py: 1,
                      px: 3,
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      component={RouterLink}
                      to="/login"
                      variant="contained"
                      color="secondary"
                      sx={{ 
                        py: 1,
                        px: 3,
                        fontSize: '1rem',
                        fontWeight: 600
                      }}
                    >
                      Login to System
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="outlined"
                      sx={{ 
                        py: 1,
                        px: 3,
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.08)'
                        }
                      }}
                    >
                      Request Demo
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
            
            {isLargeScreen && (
              <Box sx={{ 
                flex: '0 0 auto',
                width: { md: '45%' },
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center'
              }}>
                <Paper
                  elevation={4}
                  sx={{
                    width: '100%',
                    maxWidth: 320,
                    borderRadius: 1,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box
                    component="img"
                    src="/dashboard-preview.png"  // Replace with actual image
                    alt="SURA Dashboard Preview"
                    sx={{
                      width: '100%',
                      height: 'auto'
                    }}
                  />
                </Paper>
              </Box>
            )}
          </Box>
          
          {isLargeScreen && (
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
              <Box sx={{ 
                pt: 3, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}>
                <Typography sx={{ opacity: 0.7, fontSize: '0.9rem' }}>
                  Trusted by law enforcement agencies nationwide
                </Typography>
                <Stack direction="row" spacing={4} sx={{ opacity: 0.8 }}>
                  <Box>Dept. Logo</Box>
                  <Box>Dept. Logo</Box>
                  <Box>Dept. Logo</Box>
                </Stack>
              </Box>
            </Box>
          )}
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h2" 
            component="h2"
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              color: 'text.primary'
            }}
          >
            Comprehensive Features
          </Typography>
          <Typography 
            variant="body1"
            color="text.secondary"
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              mb: 5
            }}
          >
            Everything you need to manage your department efficiently in one integrated platform
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3,
            justifyContent: 'center'
          }}>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(25% - 16px)' } }}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ fontSize: '2.5rem', mb: 2, color: 'primary.main' }}>
                    <DashboardIcon />
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                    Dashboard & Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get a comprehensive overview of department activities with intuitive 
                    analytics dashboards.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(25% - 16px)' } }}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ fontSize: '2.5rem', mb: 2, color: 'primary.main' }}>
                    <CaseIcon />
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                    Case Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track and manage active investigations, witness statements, and case files.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(25% - 16px)' } }}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ fontSize: '2.5rem', mb: 2, color: 'primary.main' }}>
                    <EvidenceIcon />
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                    Malkhana Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track, label, and manage evidence with our comprehensive Malkhana system.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(25% - 16px)' } }}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ fontSize: '2.5rem', mb: 2, color: 'primary.main' }}>
                    <PersonnelIcon />
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                    Personnel Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage officer assignments, duty rosters, and performance tracking.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Container>
      
      {/* Why SURA Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 4,
            alignItems: 'center'
          }}>
            <Box sx={{ flex: '1 1 auto', maxWidth: { xs: '100%', md: '55%' } }}>
              <Typography 
                variant="h2" 
                component="h2" 
                fontWeight={700} 
                gutterBottom
                sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}
              >
                Why Choose SURA?
              </Typography>
              <Typography variant="body1" paragraph>
                SURA is a next-generation police management system designed to streamline 
                operations for law enforcement agencies. Our modular architecture allows 
                departments to customize the system to their specific needs.
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 3 }}>
                <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ 
                      color: 'success.main', 
                      fontSize: '1.25rem', 
                      mr: 1.5,
                      mt: 0.5 
                    }}>
                      <SecurityIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5, fontSize: '1.1rem' }}>
                        Enhanced Security
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Military-grade encryption and compliance with regulations.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ 
                      color: 'success.main', 
                      fontSize: '1.25rem', 
                      mr: 1.5,
                      mt: 0.5 
                    }}>
                      <SpeedIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5, fontSize: '1.1rem' }}>
                        Fast Performance
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Optimized for speed even with large datasets.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              <Button 
                variant="contained" 
                color="primary" 
                size="medium"
                sx={{ mt: 3 }}
                component={RouterLink}
                to="/about"
              >
                Learn More
              </Button>
            </Box>
            
            <Box sx={{ flex: '1 1 auto', maxWidth: { xs: '100%', md: '40%' } }}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2
                }}>
                  <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 8px)' } }}>
                    <StatCard
                      value="100+"
                      label="Departments"
                      icon={<Box sx={{ fontSize: '1.75rem' }}>🏢</Box>}
                      color="primary.main"
                    />
                  </Box>
                  
                  <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 8px)' } }}>
                    <StatCard
                      value="10k+"
                      label="Cases Managed"
                      icon={<Box sx={{ fontSize: '1.75rem' }}>📁</Box>}
                      color="secondary.main"
                    />
                  </Box>
                  
                  <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 8px)' } }}>
                    <StatCard
                      value="99.9%"
                      label="Uptime"
                      icon={<Box sx={{ fontSize: '1.75rem' }}>⏱️</Box>}
                      color="success.main"
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: { xs: 6, md: 8 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h3" 
            fontWeight={700} 
            gutterBottom
            sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}
          >
            Ready to Transform Your Department?
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4, 
              maxWidth: '650px',
              mx: 'auto',
              opacity: 0.9 
            }}
          >
            Join other law enforcement agencies who have increased productivity and improved case management with SURA.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            sx={{ maxWidth: '450px', mx: 'auto' }}
          >
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              sx={{ py: 1.5, px: 3, fontWeight: 600, width: '100%' }}
            >
              Request Demo
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              sx={{ 
                py: 1.5, 
                px: 3,
                fontWeight: 600, 
                color: 'white', 
                borderColor: 'rgba(255, 255, 255, 0.5)',
                width: '100%',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              Contact Us
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 