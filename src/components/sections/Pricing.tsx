import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { FaCheck } from 'react-icons/fa';
import { PricingPlan, pricingPlans, pricingTitle, pricingDescription } from '@site/src/data/pricing';
import { educatesProject } from '@site/src/data/project';


const PriceCard: React.FC<PricingPlan> = ({ name, price, features, isPopular, isOSS }) => (
  <Box
    sx={{
      bgcolor: 'white',
      p: 4,
      borderRadius: 3,
      boxShadow: isPopular ? 6 : 2,
      border: isPopular ? '2px solid' : '1px solid',
      borderColor: isPopular ? 'primary.main' : 'grey.200',
      position: 'relative',
      transform: isPopular ? 'scale(1.05)' : 'none',
      zIndex: isPopular ? 1 : 0,
      maxWidth: 600,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {isPopular && (
      <Box
        sx={{
          position: 'absolute',
          top: -12,
          right: '50%',
          transform: 'translateX(50%)',
          bgcolor: 'primary.main',
          color: 'white',
          px: 2,
          py: 0.5,
          borderRadius: 999,
          fontSize: '0.875rem',
          fontWeight: 'bold',
        }}
      >
        Most Popular
      </Box>
    )}
    <Stack spacing={3} alignItems="stretch" flex={1}>
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>{name}</Typography>
        {Number.parseInt(price) >= 0 ? (
          <Typography variant="h4" fontWeight="bold">
            ${price}
            <Typography component="span" variant="subtitle2" fontWeight="normal" color="text.secondary" sx={{ ml: 1 }}>
              /month
            </Typography>
          </Typography>
        ) : (
          <Typography variant="h4" fontWeight="bold">
            {price}
          </Typography>
        )}
      </Box>
      <List sx={{ flex: 1 }}>
        {features.map((feature, index) => (
          <ListItem key={index} sx={{ display: 'flex', alignItems: 'center', pl: 0 }}>
            <ListItemIcon sx={{ minWidth: 32, color: 'success.main' }}>
              <FaCheck />
            </ListItemIcon>
            <Typography variant="body2">{feature}</Typography>
          </ListItem>
        ))}
      </List>
      <Box mt="auto">
        {isOSS ? (
          <Button
            component="a"
            href={educatesProject.projectGitHubUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant={isPopular ? 'contained' : 'outlined'}
            color={isPopular ? 'primary' : 'inherit'}
            size="large"
            fullWidth
          >
            Visit Project
          </Button>
        ) : (
          <Button
            variant={isPopular ? 'contained' : 'outlined'}
            color={isPopular ? 'primary' : 'inherit'}
            size="large"
            fullWidth
          >
            Get Started
          </Button>
        )}
      </Box>
    </Stack>
  </Box>
);


const Pricing: React.FC<{ sectionType: 'even' | 'odd' }> = ({ sectionType }) => {
  return (
    <Box className="section-box" id="pricing">
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
                    {pricingTitle}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
                    {pricingDescription}
                  </Typography>
                </Box>
                <Grid container spacing={4}  justifyContent="center" sx={{ width: '100%', px: { xs: 2, md: 0 } }}>
                  {pricingPlans.map((plan, index) => (
                    // @ts-ignore
                    <Grid item xs={12} lg={Math.min(pricingPlans.length, 5)}  justifyContent="center" key={index}>
                      <PriceCard {...plan} />
                    </Grid>
                  ))}
                </Grid>
                <Box textAlign="center" pt={4}>
                  <Typography variant="body2" color="text.secondary">
                    Need a custom plan?{' '}
                    <Button variant="text" color="primary">
                      Contact us
                    </Button>
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Pricing; 