import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { IconType } from 'react-icons';
import { useCases } from '@site/src/data/usecases';
interface UseCase {
  title: string;
  description: string;
  icon: IconType;
}

const UseCaseCard: React.FC<UseCase> = ({ title, description, icon: Icon }) => (
  <Box
    sx={{
      bgcolor: 'white',
      p: 4,
      borderRadius: 3,
      boxShadow: 2,
      textAlign: 'center',
      transition: 'all 0.3s',
      width: { xs: '100%', sm: 400 },
      maxWidth: 400,
      minWidth: 280,
      m: 0,
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 4,
      },
    }}
  >
    <Box sx={{ color: 'primary.main', mb: 2, display: 'flex', justifyContent: 'center' }}>
      <Icon size={40} />
    </Box>
    <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
      {title}
    </Typography>
    <Typography color="text.secondary">{description}</Typography>
  </Box>
);


const UseCases: React.FC<{ sectionType: 'even' | 'odd' }> = ({ sectionType }) => {
  return (
    <Box className="section-box" id="use-cases">
      <Box className={`section-container section-${sectionType}`}>
        <Box className="section-content">
          <Container maxWidth={false} sx={{ height: '100%', mx: 'auto', p: 0 }}>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="h4" component="h2" textAlign="center" sx={{ mb: 6 }}>
                Use Cases
              </Typography>
              <Grid container spacing={4} justifyContent="center" sx={{ width: '100%', px: { xs: 0, md: 0 } }}>
                {useCases.map((useCase, index) => (
                  // @ts-ignore
                  <Grid item xs={12} md={6} lg={3} xl={3} key={index} display="flex" justifyContent="center">
                    <UseCaseCard {...useCase} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default UseCases; 