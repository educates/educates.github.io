import React from 'react';
import Layout from '@theme/Layout';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { FaDownload } from "react-icons/fa6";
import { downloads } from '../data/downloads';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const Downloads: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();
  const educatesProject = siteConfig.customFields.educatesProject;

  return (
    <Layout title="Download Educates" description="Get Educates for Mac and Linux.">
      <Box className="section-box" id="downloads">
        <Box className="section-container">
        <Box className="section-content">
          <Container maxWidth={false} sx={{ mx: 'auto', p: 0 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
                Download Educates
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Choose your platform to get started with Educates Training Platform.
              </Typography>
            </Box>
            <Grid container spacing={4} justifyContent="center">
              {downloads.map((dlPerOS) => (
                <Grid item xs={12} md={6} key={dlPerOS.label} sx={{ display: 'flex' }}>
                  <Box
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 3,
                      boxShadow: 2,
                      p: 4,
                      textAlign: 'center',
                      width: '100%',
                      height: '100%',
                      minHeight: 320,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {dlPerOS.icon}
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      {dlPerOS.label}
                    </Typography>
                    {dlPerOS.amd64 && (
                      <Button
                        variant="contained"
                        color="primary"
                        href={dlPerOS.amd64.url}
                        size="large"
                        sx={{
                          mt: 2,
                          borderRadius: 2,
                          fontWeight: 600,
                          maxWidth: 600,
                          width: '100%',
                          height: 48,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FaDownload style={{ marginRight: 8 }} /> {dlPerOS.amd64.label}
                      </Button>
                    )}
                    {dlPerOS.arm64 && (
                      <Button
                        variant="contained"
                        color="primary"
                        href={dlPerOS.arm64.url}
                        size="large"
                        sx={{
                          mt: 2,
                          borderRadius: 2,
                          fontWeight: 600,
                          maxWidth: 600,
                          width: '100%',
                          height: 48,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FaDownload style={{ marginRight: 8 }} /> {dlPerOS.arm64.label}
                      </Button>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: 'center', mb: 6, mt: 6 }}>
              <Typography variant="h6" color="text.secondary">
                {/* @ts-ignore */}
                Go to <a href={educatesProject.downloadsUrl}>GitHub Releases</a> to find a specific version of the Educates Training Platform.
              </Typography>
            </Box>

          </Container>
        </Box>
      </Box>
    </Box>
  </Layout>
);

export default Downloads; 