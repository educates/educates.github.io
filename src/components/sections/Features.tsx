import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { FeatureProps, features } from '@site/src/data/features';

const Feature: React.FC<FeatureProps> = ({ title, description, icon: Icon }) => (
  <Stack
    alignItems="flex-start"
    spacing={2}
    sx={{
      p: 3,
      bgcolor: 'white',
      borderRadius: 3,
      boxShadow: 1,
      transition: 'all 0.3s',
      width: { xs: '100%' },
      maxWidth: 900,
      m: 0,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 3,
      },
    }}
  >
    <Box sx={{ color: 'primary.main' }}>
      <Icon size={32} />
    </Box>
    <Typography variant="h6" component="h3">
      {title}
    </Typography>
    <Typography color="text.secondary">{description}</Typography>
  </Stack>
);

const Features: React.FC<{ sectionType: 'even' | 'odd' }> = ({ sectionType }) => {

  return (
    <Box className="section-box" id="features">
      <Box className={`section-container section-${sectionType}`}>
        <Box className="section-content">
          <Container maxWidth={false} sx={{ maxWidth: '2200px', height: '100%', mx: 'auto', p: 0 }}>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Stack spacing={6} alignItems="center" width="100%">
                <Box textAlign="center">
                  <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
                    Platform Features
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
                    Educates Training Platform provides a comprehensive set of features designed to make your training and workshop experiences seamless and effective.
                  </Typography>
                </Box>
                <Grid container spacing={4} justifyContent="center" sx={{ width: '100%', px: { xs: 0, md: 0 } }}>
                  {features.map((feature, index) => (
                    // @ts-ignore
                    <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }} key={index} display="flex" justifyContent="center" >
                      <Feature {...feature} />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Features; 