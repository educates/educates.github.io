import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

interface DiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function DiagramModal({ isOpen, onClose, children, title }: DiagramModalProps) {
  const [scale, setScale] = useState(1);
  const [baseScale, setBaseScale] = useState(1); // The "fit to width" scale (100%)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);

  // Calculate fit-to-width scale when modal opens
  useEffect(() => {
    if (isOpen && containerRef.current && diagramRef.current) {
      // Wait a bit for the diagram to render
      const calculateFitScale = () => {
        const container = containerRef.current;
        const diagram = diagramRef.current;

        if (!container || !diagram) return;

        // Find the actual diagram element (could be SVG, pre, or div)
        let diagramElement = diagram.querySelector('svg') as unknown as HTMLElement;
        if (!diagramElement) {
          diagramElement = diagram.querySelector('pre, .mermaid') as HTMLElement;
        }
        if (!diagramElement) {
          // Fallback: use the first child element
          diagramElement = diagram.firstElementChild as HTMLElement;
        }
        if (!diagramElement) return;

        // Get natural dimensions
        let naturalWidth = 0;
        let naturalHeight = 0;

        if (diagramElement.tagName === 'SVG') {
          const svg = diagramElement as unknown as SVGSVGElement;
          // Try viewBox first (most accurate for Mermaid)
          if (svg.viewBox && svg.viewBox.baseVal) {
            naturalWidth = svg.viewBox.baseVal.width;
            naturalHeight = svg.viewBox.baseVal.height;
          } else {
            // Fallback to actual dimensions
            const rect = svg.getBoundingClientRect();
            naturalWidth = rect.width || svg.clientWidth || 800;
            naturalHeight = rect.height || svg.clientHeight || 600;
          }
        } else {
          // For other elements, get their actual size
          const rect = diagramElement.getBoundingClientRect();
          naturalWidth = rect.width || diagramElement.scrollWidth || diagramElement.clientWidth || 800;
          naturalHeight = rect.height || diagramElement.scrollHeight || diagramElement.clientHeight || 600;
        }

        // Get container dimensions (accounting for padding)
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width - 40; // 20px padding on each side
        const containerHeight = containerRect.height - 40;

        if (naturalWidth > 0 && containerWidth > 0) {
          // Calculate scale to fit width (this becomes 100%)
          const fitToWidthScale = Math.min(containerWidth / naturalWidth, (containerHeight / naturalHeight) || containerWidth / naturalWidth);
          setBaseScale(fitToWidthScale);
          setScale(fitToWidthScale);
          setPosition({ x: 0, y: 0 });
        }
      };

      // Try multiple times to catch rendered content
      setTimeout(calculateFitScale, 50);
      setTimeout(calculateFitScale, 200);
      setTimeout(() => {
        calculateFitScale();
        setIsReady(true);
      }, 500);

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      setIsReady(false);
    };
  }, [isOpen]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + baseScale * 0.25, baseScale * 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - baseScale * 0.25, baseScale * 0.5));
  };

  const handleReset = () => {
    setScale(baseScale);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left mouse button
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -baseScale * 0.1 : baseScale * 0.1;
    setScale((prev) => Math.max(baseScale * 0.5, Math.min(baseScale * 3, prev + delta)));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="diagram-modal-overlay" onClick={onClose}>

      {!isReady && (
        <div className="diagram-modal-loading" style={{ position: 'absolute', zIndex: 10 }}>
          <div className="diagram-modal-spinner"></div>
          <p>Loading diagram...</p>
        </div>
      )}

      <div
        className="diagram-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ visibility: isReady ? 'visible' : 'hidden' }}
      >
        <div className="diagram-modal-header">
          {title && <h3 className="diagram-modal-title">{title}</h3>}
          <div className="diagram-modal-controls">
            <button
              className="diagram-modal-button"
              onClick={handleZoomOut}
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <span className="diagram-modal-zoom-level">{Math.round((scale / baseScale) * 100)}%</span>
            <button
              className="diagram-modal-button"
              onClick={handleZoomIn}
              title="Zoom In"
              aria-label="Zoom In"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <button
              className="diagram-modal-button"
              onClick={handleReset}
              title="Reset View"
              aria-label="Reset View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
              </svg>
            </button>
            <button
              className="diagram-modal-button diagram-modal-close"
              onClick={onClose}
              title="Close"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div
          className="diagram-modal-content"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div
            ref={contentRef}
            className="diagram-modal-diagram"
          >
            <div
              ref={diagramRef}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                display: 'inline-block',
              }}
            >
              {children}
            </div>
          </div>
        </div>
        <div className="diagram-modal-footer">
          <p className="diagram-modal-hint">
            Click and drag to pan • Scroll to zoom • Press ESC to close
          </p>
        </div>
      </div>
    </div>
  );
}

