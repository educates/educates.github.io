import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

export interface FeaturedCardData {
  image?: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface FeaturedContentProps {
  title?: string;
  seeMoreLabel?: string;
  seeMoreHref?: string;
  cards: FeaturedCardData[];
  sectionType: 'odd' | 'even';
}

const FeaturedContent: React.FC<FeaturedContentProps> = ({
  title = 'Featured content',
  seeMoreLabel = 'See more',
  seeMoreHref = '/blog',
  cards,
  sectionType,
}) => {
  return (
    <Box className="section-box" id="featured-content">
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
                    {title}
                  </Typography>
                  {/* <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
                    {description}
                  </Typography> */}
                  <Button
                    variant="outlined"
                    href={seeMoreHref}
                    sx={{ borderRadius: '2rem', fontWeight: 500, px: 3 }}
                  >
                    {seeMoreLabel}
                  </Button>
                </Box>
                <Grid container spacing={4}>
                  {cards.map((card, idx) => (
                    // @ts-ignore
                    <Grid item xs={12} md={4} key={idx} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Card
                        sx={{
                          width: '100%',
                          maxWidth: 370,
                          bgcolor: 'background.paper',
                          borderRadius: 3,
                          boxShadow: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'stretch',
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="160"
                          image={card.image || 'https://via.placeholder.com/370x160?text=Image'}
                          alt={card.title}
                          sx={{ objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                        />
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                            {card.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {card.description}
                          </Typography>
                          <Button
                            variant="outlined"
                            href={card.ctaHref}
                            sx={{ borderRadius: '2rem', fontWeight: 500, mt: 'auto' }}
                          >
                            {card.ctaLabel}
                          </Button>
                        </CardContent>
                      </Card>
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

export default FeaturedContent; 