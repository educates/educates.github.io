import React, { useState, useRef, useEffect } from 'react';
import DiagramModal from '../DiagramModal';
import './styles.css';

interface ClickableDiagramProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function ClickableDiagram({ children, title, className = '' }: ClickableDiagramProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`clickable-diagram-wrapper ${className}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="Click to expand diagram"
      >
        {children}
      </div>
      <DiagramModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
      >
        {children}
      </DiagramModal>
    </>
  );
}

