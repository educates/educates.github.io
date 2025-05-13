import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { companies, Company } from '@site/src/data/references';


const References: React.FC<{ sectionType: 'even' | 'odd' }> = ({ sectionType }) => {
  return (
    <Box className="section-box" id="references">
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
              <Stack spacing={8} alignItems="center" width="100%">
                <Box textAlign="center">
                  <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
                    Trusted By Industry Leaders
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
                    Join the growing list of organizations that trust Educates Training Platform for their training needs.
                  </Typography>
                </Box>
                {/* Company Logos */}
                <Grid container spacing={4} justifyContent="center" sx={{ width: '100%', px: { xs: 2, md: 0 } }}>
                  {companies.map((company, index) => (
                    // @ts-ignore
                    <Grid item xs={6} sm={6} md={Math.min(companies.length, 4)} key={index} display="flex" justifyContent="center">
                      <Box
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          filter: 'grayscale(1)',
                          transition: 'all 0.3s',
                          '&:hover': { filter: 'grayscale(0)' },
                        }}
                      >
                        <img
                          src={company.logo}
                          alt={company.name}
                          style={{ margin: '0 auto', marginBottom: 16, maxHeight: 50, objectFit: 'contain' }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                {/* Testimonials */}
                <Grid container spacing={4} justifyContent="center" sx={{ width: '100%', px: { xs: 0, md: 0 } }}>
                  {companies.map((company, index) => (
                    // @ts-ignore
                    <Grid item xs={12} md={6} key={index} display="flex" justifyContent="center">
                      <Box
                        sx={{
                          bgcolor: 'grey.50',
                          p: 4,
                          borderRadius: 3,
                          position: 'relative',
                          width: { xs: '100%', sm: 600 },
                          maxWidth: 600,
                          minWidth: 280,
                        }}
                      >
                        <Typography variant="body1" fontStyle="italic" color="text.secondary">
                          "{company.testimonial}"
                        </Typography>
                        <Box mt={2} textAlign="center">
                          <img
                            src={company.logo}
                            alt={company.name}
                            style={{ height: 30, objectFit: 'contain' }}
                          />
                        </Box>
                      </Box>
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

export default References; 