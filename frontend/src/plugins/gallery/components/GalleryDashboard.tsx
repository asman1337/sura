import React, { useState } from 'react';
import {
    Box,
    Card,
    CardMedia,
    Container,
    Grid,
    Typography,
    Chip,
    Dialog,
    DialogContent,
    IconButton,
    Tabs,
    Tab,
    Paper,
    alpha,
    useTheme,
    Fade,
    Zoom
} from '@mui/material';
import {
    PhotoLibrary as PhotoLibraryIcon,
    Close as CloseIcon
} from '@mui/icons-material';

// Sample gallery data (local for now)
const galleryData = {
    featured: [        {
            id: 1,
            title: 'Annual Police Day Celebration',
            description: 'Celebrating excellence in service and dedication to public safety',
            image: '/images/gallery/police-day-ceremony.svg',
            category: 'Events',
            date: '2024-12-15'
        },
        {
            id: 2,
            title: 'Community Outreach Program',
            description: 'Building bridges with the community through various outreach initiatives',
            image: '/images/gallery/community-outreach.svg',
            category: 'Community',
            date: '2024-11-20'
        },
        {
            id: 3,
            title: 'Training Excellence',
            description: 'State-of-the-art training facilities and programs',
            image: '/images/gallery/training-session.svg',
            category: 'Training',
            date: '2024-10-30'
        }
    ],
    categories: {
        'Events': [            {
                id: 4,
                title: 'Independence Day Parade',
                description: 'Proud display of discipline and patriotism',
                image: '/images/gallery/independence-day.svg',
                date: '2024-08-15'
            },
            {
                id: 5,
                title: 'Award Ceremony',
                description: 'Recognizing outstanding service and bravery',
                image: '/images/gallery/award-ceremony.svg',
                date: '2024-07-10'
            },
            {
                id: 6,
                title: 'Sports Day',
                description: 'Promoting fitness and team spirit',
                image: '/images/gallery/sports-day.svg',
                date: '2024-06-25'
            }
        ],
        'Community': [            {
                id: 7,
                title: 'School Safety Program',
                description: 'Educating children about safety and law enforcement',
                image: '/images/gallery/school-program.svg',
                date: '2024-09-12'
            },
            {
                id: 8,
                title: 'Traffic Awareness Campaign',
                description: 'Promoting road safety and traffic rules',
                image: '/images/gallery/traffic-awareness.svg',
                date: '2024-08-20'
            },
            {
                id: 9,
                title: 'Senior Citizens Meet',
                description: 'Special interaction with senior citizens',
                image: '/images/gallery/senior-citizens.svg',
                date: '2024-07-30'
            }
        ],        'Training': [
            {
                id: 10,
                title: 'Tactical Training',
                description: 'Advanced tactical operations and procedures',
                image: '/images/gallery/tactical-training.svg',
                date: '2024-05-15'
            },
            {
                id: 11,
                title: 'Technology Workshop',
                description: 'Training on latest law enforcement technology',
                image: '/images/gallery/tech-workshop.svg',
                date: '2024-04-18'
            },
            {
                id: 12,
                title: 'Leadership Development',
                description: 'Building future leaders in law enforcement',
                image: '/images/gallery/leadership-training.svg',
                date: '2024-03-22'
            }
        ],
        'Achievements': [
            {
                id: 13,
                title: 'Best Station Award',
                description: 'Recognition for outstanding performance',
                image: '/images/gallery/best-station.svg',
                date: '2024-02-14'
            },
            {
                id: 14,
                title: 'Crime Prevention Success',
                description: 'Successful crime prevention initiatives',
                image: '/images/gallery/crime-prevention.svg',
                date: '2024-01-20'
            }
        ]
    }
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`gallery-tabpanel-${index}`}
            aria-labelledby={`gallery-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const GalleryDashboard: React.FC = () => {
    const theme = useTheme();
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const handleImageClick = (image: any) => {
        setSelectedImage(image);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedImage(null);
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const ImageCard = ({ image, featured = false }: { image: any; featured?: boolean }) => (
        <Zoom in timeout={300}>
            <Card
                sx={{
                    height: featured ? 400 : 280,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[8],
                        '& .image-overlay': {
                            opacity: 1,
                        },
                        '& .card-media': {
                            transform: 'scale(1.1)',
                        }
                    }
                }}
                onClick={() => handleImageClick(image)}
            >
                <CardMedia
                    className="card-media"
                    component="img"
                    height={featured ? "300" : "200"}
                    image={image.image}
                    alt={image.title}
                    sx={{
                        transition: 'transform 0.3s ease-in-out',
                        backgroundColor: alpha(theme.palette.grey[300], 0.3)
                    }}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDE4NVYxMzVIMTc1VjEyNVoiIGZpbGw9IiNEOUQ5RDkiLz48L3N2Zz4=';
                    }}
                />

                {/* Overlay */}
                <Box
                    className="image-overlay"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(to top, ${alpha(theme.palette.common.black, 0.8)}, transparent)`,
                        opacity: 0,
                        transition: 'opacity 0.3s ease-in-out',
                        display: 'flex',
                        alignItems: 'flex-end',
                        p: 2
                    }}
                >
                    <Box sx={{ color: 'white' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {image.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {image.description}
                        </Typography>
                    </Box>
                </Box>

                {/* Content */}
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                            {image.title}
                        </Typography>
                        {image.category && (
                            <Chip
                                label={image.category}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        )}
                    </Box>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {image.description}
                    </Typography>
                    {image.date && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {new Date(image.date).toLocaleDateString()}
                        </Typography>
                    )}
                </Box>
            </Card>
        </Zoom>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhotoLibraryIcon sx={{ fontSize: 32, color: theme.palette.primary.main, mr: 2 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Department Gallery
                    </Typography>
                </Box>
                <Typography variant="subtitle1" color="text.secondary">
                    Capturing moments of service, dedication, and community engagement
                </Typography>
            </Box>

            {/* Featured Photos */}
            <Paper
                sx={{
                    p: 3,
                    mb: 4,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                    borderRadius: 2
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.primary.main }}>
                    ✨ Featured Photos
                </Typography>
                <Grid container spacing={3}>
                    {galleryData.featured.map((image) => (
                        <Grid size={{ xs: 12, md: 4 }} key={image.id}>
                            <ImageCard image={image} featured />
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* Category Tabs */}
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        background: alpha(theme.palette.primary.main, 0.05),
                        '& .MuiTab-root': {
                            fontWeight: 600,
                            minHeight: 64
                        }
                    }}
                >
                    {Object.keys(galleryData.categories).map((category, index) => (
                        <Tab
                            key={category}
                            label={`${category} (${galleryData.categories[category as keyof typeof galleryData.categories].length})`}
                            id={`gallery-tab-${index}`}
                            aria-controls={`gallery-tabpanel-${index}`}
                        />
                    ))}
                </Tabs>

                {/* Tab Panels */}
                {Object.entries(galleryData.categories).map(([category, images], index) => (
                    <TabPanel value={tabValue} index={index} key={category}>
                        <Grid container spacing={3}>
                            {images.map((image) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={image.id}>
                                    <ImageCard image={image} />
                                </Grid>
                            ))}
                        </Grid>
                    </TabPanel>
                ))}
            </Paper>

            {/* Image Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: alpha(theme.palette.common.black, 0.9),
                        borderRadius: 2
                    }
                }}
            >
                <DialogContent sx={{ p: 0, position: 'relative' }}>
                    {selectedImage && (
                        <Fade in timeout={300}>
                            <Box>
                                {/* Close Button */}
                                <IconButton
                                    onClick={handleCloseDialog}
                                    sx={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        color: 'white',
                                        backgroundColor: alpha(theme.palette.common.black, 0.5),
                                        zIndex: 1,
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.common.black, 0.7),
                                        }
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>

                                {/* Image */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <img
                                        src={selectedImage.image}
                                        alt={selectedImage.title}
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '80vh',
                                            objectFit: 'contain'
                                        }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDE4NVYxMzVIMTc1VjEyNVoiIGZpbGw9IiNEOUQ5RDkiLz48L3N2Zz4=';
                                        }}
                                    />
                                </Box>

                                {/* Image Info */}
                                <Box sx={{ p: 3, color: 'white' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                        {selectedImage.title}
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                                        {selectedImage.description}
                                    </Typography>
                                    {selectedImage.date && (
                                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                            {new Date(selectedImage.date).toLocaleDateString()}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Fade>
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default GalleryDashboard;
