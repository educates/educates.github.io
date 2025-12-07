import React, { useEffect, useState, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

export interface CarrouselItem {
  image: string;
  title: string;
  description: string;
}

interface CarrouselProps {
  images: CarrouselItem[];
  altPrefix?: string;
  imageClassName?: string;
  boxSx?: object;
}

const Carrousel: React.FC<CarrouselProps> = ({ images, altPrefix = 'Carousel image', imageClassName, boxSx }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const interval = 3000;

  useEffect(() => {
    if (!paused && !modalOpen) {
      intervalRef.current = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
      }, interval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, modalOpen, images.length]);

  const goToPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };
  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };
  const goToIndex = (idx: number) => setCurrentImage(idx);

  const handleOpen = () => {
    setModalOpen(true);
    setPaused(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setPaused(false);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!modalOpen) return;
    if (e.key === 'ArrowLeft') {
      setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    } else if (e.key === 'ArrowRight') {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }
  }, [modalOpen, images.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const { image, title, description } = images[currentImage];

  return (
    <>
      <Box
        sx={{ width: '80%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', ...boxSx }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left Arrow */}
        <IconButton
          aria-label="Previous image"
          onClick={goToPrev}
          sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'rgba(255,255,255,0.7)' }}
        >
          <ArrowBackIos />
        </IconButton>
        {/* Image */}
        <img
          src={image}
          alt={`${altPrefix} ${currentImage + 1}`}
          className={imageClassName}
          style={{ width: '100%', cursor: 'pointer' }}
          onClick={handleOpen}
        />
        {/* Right Arrow */}
        <IconButton
          aria-label="Next image"
          onClick={goToNext}
          sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'rgba(255,255,255,0.7)' }}
        >
          <ArrowForwardIos />
        </IconButton>
        {/* Dots - below the image */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1, position: 'static' }}>
          {images.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => goToIndex(idx)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: idx === currentImage ? '#1976d2' : '#ccc',
                cursor: 'pointer',
                border: idx === currentImage ? '2px solid #1976d2' : '2px solid #ccc',
                transition: 'background 0.2s, border 0.2s',
              }}
            />
          ))}
        </Box>
        {/* Title and Description below indicators */}
        <Box sx={{ mt: 2, textAlign: 'center', width: '100%' }}>
          <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 800,
              mx: 'auto',
              height: '6rem', // Fixed height for 3 lines (1.5rem per line)
              minHeight: '6rem',
              lineHeight: '1.5rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 4, // Limit to 3 lines
              WebkitBoxOrient: 'vertical',
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>

      {/* Full Screen Modal */}
      <Modal
        open={modalOpen}
        onClose={handleClose}
        aria-labelledby="carousel-modal-title"
        aria-describedby="carousel-modal-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.9)',
        }}
      >
        <Box sx={{ position: 'relative', width: '90vw', height: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', outline: 'none' }}>

          {/* Close Button */}
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              color: 'white',
              zIndex: 10,
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
            }}
          >
            <CloseIcon fontSize="large" />
          </IconButton>

          {/* Modal Left Arrow */}
          <IconButton
            onClick={goToPrev}
            sx={{
              position: 'absolute',
              left: { xs: 0, md: 20 },
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              zIndex: 10,
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
            }}
          >
            <ArrowBackIos fontSize="large" />
          </IconButton>

          {/* Modal Right Arrow */}
          <IconButton
            onClick={goToNext}
            sx={{
              position: 'absolute',
              right: { xs: 0, md: 20 },
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              zIndex: 10,
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
            }}
          >
            <ArrowForwardIos fontSize="large" />
          </IconButton>

          {/* Main Content Container */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <img
              src={image}
              alt={`${altPrefix} ${currentImage + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}
            />
          </Box>

          {/* Modal Footer (Title/Desc) */}
          <Box sx={{
            width: '100%',
            p: 2,
            color: 'white',
            textAlign: 'center',
            bgcolor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            borderRadius: 2,
            mt: 2
          }}>
            <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
              {title}
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 800, mx: 'auto' }}>
              {description}
            </Typography>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default Carrousel;