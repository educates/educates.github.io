import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
// import { educatesProject } from '@site/src/data/project';

const Description: React.FC<{ sectionType: 'even' | 'odd' }> = ({ sectionType }) => {
  const { siteConfig } = useDocusaurusContext();
  const educatesProject = siteConfig.customFields.educatesProject;

  return (
    <Box className="section-box" id="description">
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
              <Grid container alignItems="center" spacing={5} sx={{ height: '100%' }}>
                {/* @ts-ignore */}
                <Grid item xs={12} md={6}>
                  <Typography
                    component="h1"
                    variant="h2"
                    sx={{ mb: 3, lineHeight: 1.1, textAlign: 'center', fontWeight: 700 }}
                  >
                    {/* @ts-ignore */}
                    {educatesProject.descriptionTitle}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7, textAlign: 'center' }}
                  >
                    {/* @ts-ignore */}
                    {educatesProject.description}
                  </Typography>
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} md={6} sx={{ display: 'flex' , justifyContent: 'center', alignItems: 'center' }}>
                  <Box sx={{ width: '80%' }}>
                    <img
                      // @ts-ignore
                      src={educatesProject.screenshot}
                      alt="Educates Platform"
                      style={{ width: '100%', objectFit: 'contain', borderRadius: 16 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Description; 