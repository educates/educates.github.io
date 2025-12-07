import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useCases, UseCase } from '@site/src/data/usecases';

const UseCaseCard: React.FC<UseCase & { onClick: () => void; isSelected: boolean }> = ({ title, description, icon: Icon, onClick, isSelected }) => (
  <Box
    onClick={onClick}
    sx={{
      bgcolor: isSelected ? 'primary.light' : 'white',
      color: isSelected ? 'primary.contrastText' : 'text.primary',
      p: 4,
      borderRadius: 3,
      boxShadow: 2,
      textAlign: 'center',
      transition: 'all 0.3s',
      width: { xs: '100%', sm: 400 },
      maxWidth: 400,
      minWidth: 280,
      m: 0,
      cursor: 'pointer',
      transform: isSelected ? 'translateY(-5px)' : 'none',
      border: isSelected ? '2px solid' : '2px solid transparent',
      borderColor: 'primary.main',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 4,
      },
    }}
  >
    <Box sx={{ color: isSelected ? 'inherit' : 'primary.main', mb: 2, display: 'flex', justifyContent: 'center' }}>
      <Icon size={40} />
    </Box>
    <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
      {title}
    </Typography>
    <Typography color={isSelected ? 'inherit' : 'text.secondary'}>{description}</Typography>
  </Box>
);

const UseCases: React.FC<{ sectionType: 'even' | 'odd' }> = ({ sectionType }) => {
  const [selectedUseCase, setSelectedUseCase] = React.useState<number | null>(null);
  const theme = useTheme();

  // Determine number of columns based on breakpoints matching the Grid item sizes
  // xs={12} -> 1 col
  // md={6}  -> 2 cols
  // lg={3}  -> 4 cols
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));

  const columns = isLg ? 4 : isMd ? 2 : 1;

  // Calculate where to insert the details box
  // It should be after the last item in the current row
  let insertionIndex = -1;
  if (selectedUseCase !== null) {
    const currentRow = Math.floor(selectedUseCase / columns);
    const itemsInRow = columns;
    // The index of the last item in this row
    let lastItemInRow = (currentRow + 1) * itemsInRow - 1;
    // Cap at the last actual item
    insertionIndex = Math.min(lastItemInRow, useCases.length - 1);
  }

  return (
    <Box className="section-box" id="use-cases">
      <Box className={`section-container section-${sectionType}`}>
        <Box className="section-content">
          <Container maxWidth={false} sx={{ height: '100%', mx: 'auto', p: 0 }}>
            <Box
              sx={{
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                pt: { xs: 8, md: 12 },
                pb: 8,
              }}
            >
              <Typography variant="h4" component="h2" textAlign="center" sx={{ mb: 6 }}>
                Use Cases
              </Typography>
              <Grid container spacing={4} justifyContent="center" sx={{ width: '100%', px: { xs: 0, md: 0 } }}>
                {useCases.map((useCase, index) => {
                  const isInsertionPoint = index === insertionIndex;
                  return (
                    <React.Fragment key={index}>
                      {/* @ts-ignore */}
                      <Grid item xs={12} md={6} lg={3} xl={3} display="flex" justifyContent="center">
                        <UseCaseCard
                          {...useCase}
                          onClick={() => setSelectedUseCase(selectedUseCase === index ? null : index)}
                          isSelected={selectedUseCase === index}
                        />
                      </Grid>
                      {isInsertionPoint && selectedUseCase !== null && (
                        <Grid item xs={12} key="details">
                          <Box
                            sx={{
                              width: '100%',
                              maxWidth: '1200px',
                              height: { md: '290px', lg: '220px' },
                              bgcolor: 'background.paper',
                              p: 4,
                              borderRadius: 4,
                              boxShadow: 3,
                              position: 'relative',
                              mx: 'auto',
                              overflowY: 'auto',
                              animation: 'fadeIn 0.3s ease-in-out',
                              '@keyframes fadeIn': {
                                '0%': { opacity: 0, transform: 'translateY(10px)' },
                                '100%': { opacity: 1, transform: 'translateY(0)' },
                              },
                            }}
                          >
                            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                              <Typography
                                component="button"
                                onClick={() => setSelectedUseCase(null)}
                                sx={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '1.5rem',
                                  lineHeight: 1,
                                  p: 1,
                                  borderRadius: '50%',
                                  '&:hover': { bgcolor: 'action.hover' }
                                }}
                              >
                                ×
                              </Typography>
                            </Box>
                            <Typography variant="h5" component="h3" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                              {useCases[selectedUseCase].title}
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                              {useCases[selectedUseCase].details}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </React.Fragment>
                  );
                })}
              </Grid>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default UseCases;