import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import Typography from '@mui/material/Typography';

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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!paused) {
      intervalRef.current = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
      }, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, images.length]);

  const goToPrev = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };
  const goToNext = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };
  const goToIndex = (idx: number) => setCurrentImage(idx);

  const { image, title, description } = images[currentImage];

  return (
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
        style={{ width: '100%' }}
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
        <Typography color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
};

export default Carrousel; 