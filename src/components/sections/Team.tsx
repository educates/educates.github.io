import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { TeamMember, teamMembers } from '@site/src/data/team';



const TeamMemberCard: React.FC<TeamMember> = ({ name, role, image, github, twitter, linkedin }) => (
  <Stack
    alignItems="center"
    spacing={2}
    sx={{
      bgcolor: 'white',
      p: 3,
      borderRadius: 3,
      boxShadow: 2,
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
    <Avatar
      src={image}
      alt={name}
      sx={{ width: 120, height: 120, mb: 1 }}
    />
    <Stack spacing={0.5} alignItems="center">
      <Typography variant="h6">{name}</Typography>
      <Typography color="text.secondary">{role}</Typography>
    </Stack>
    <Stack direction="row" spacing={2}>
      {github && (
        <IconButton component={Link} href={github} target="_blank" rel="noopener noreferrer" color="inherit">
          <FaGithub size={24} />
        </IconButton>
      )}
      {twitter && (
        <IconButton component={Link} href={twitter} target="_blank" rel="noopener noreferrer" sx={{ color: '#1DA1F2' }}>
          <FaTwitter size={24} />
        </IconButton>
      )}
      {linkedin && (
        <IconButton component={Link} href={linkedin} target="_blank" rel="noopener noreferrer" sx={{ color: '#0077b5' }}>
          <FaLinkedin size={24} />
        </IconButton>
      )}
    </Stack>
  </Stack>
);



const Team: React.FC<{ sectionType: 'even' | 'odd' }> = ({ sectionType }) => {
  return (
    <Box className="section-box" id="team">
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
                    Meet Our Team
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
                    We are a dedicated team of professionals working together to make Educates the best platform for interactive learning.
                  </Typography>
                </Box>
                <Grid container spacing={4} justifyContent="center" sx={{ width: '100%', px: { xs: 0, md: 0 } }}>
                  {teamMembers.map((member, index) => (
                    // @ts-ignore
                    <Grid item xs={12} md={6} lg={3} xl={3} key={index} display="flex" justifyContent="center">
                      <TeamMemberCard {...member} />
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

export default Team; 