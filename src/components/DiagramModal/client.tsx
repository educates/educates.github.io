'use client';

import { useEffect } from 'react';
import DiagramModal from './index';

// This component will automatically wrap Mermaid diagrams
export default function AutoWrapMermaidDiagrams() {
  useEffect(() => {
    // Wait for Mermaid to render
    const wrapDiagrams = () => {
      // Find all rendered Mermaid diagrams
      const mermaidElements = document.querySelectorAll('.mermaid');
      
      mermaidElements.forEach((element) => {
        // Skip if already wrapped
        if (element.closest('.clickable-diagram-wrapper')) {
          return;
        }

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'clickable-diagram-wrapper';
        wrapper.setAttribute('role', 'button');
        wrapper.setAttribute('tabindex', '0');
        wrapper.setAttribute('aria-label', 'Click to expand diagram');
        
        // Get the parent (usually a pre or div)
        const parent = element.parentElement;
        if (parent && (parent.tagName === 'PRE' || parent.classList.contains('mermaid'))) {
          // Wrap the parent element
          parent.parentNode?.insertBefore(wrapper, parent);
          wrapper.appendChild(parent);
        } else {
          // Wrap the element itself
          element.parentNode?.insertBefore(wrapper, element);
          wrapper.appendChild(element);
        }

        // Add click handler
        wrapper.addEventListener('click', () => {
          // Create modal dynamically
          const modal = document.createElement('div');
          modal.className = 'diagram-modal-overlay';
          modal.innerHTML = `
            <div class="diagram-modal-container">
              <div class="diagram-modal-header">
                <h3 class="diagram-modal-title">Diagram</h3>
                <div class="diagram-modal-controls">
                  <button class="diagram-modal-button" onclick="window.diagramZoomOut()" title="Zoom Out">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                  </button>
                  <span class="diagram-modal-zoom-level" id="zoom-level">100%</span>
                  <button class="diagram-modal-button" onclick="window.diagramZoomIn()" title="Zoom In">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                  </button>
                  <button class="diagram-modal-button" onclick="window.diagramReset()" title="Reset View">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                      <path d="M21 3v5h-5"></path>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                      <path d="M3 21v-5h5"></path>
                    </svg>
                  </button>
                  <button class="diagram-modal-button diagram-modal-close" onclick="window.closeDiagramModal()" title="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="diagram-modal-content" id="diagram-content">
                <div class="diagram-modal-diagram" id="diagram-diagram">
                  ${parent ? parent.outerHTML : element.outerHTML}
                </div>
              </div>
              <div class="diagram-modal-footer">
                <p class="diagram-modal-hint">Click and drag to pan • Scroll to zoom • Press ESC to close</p>
              </div>
            </div>
          `;
          
          document.body.appendChild(modal);
          document.body.style.overflow = 'hidden';

          // Initialize zoom and pan
          let scale = 1;
          let position = { x: 0, y: 0 };
          let isDragging = false;
          let dragStart = { x: 0, y: 0 };
          const diagramEl = modal.querySelector('#diagram-diagram') as HTMLElement;
          const contentEl = modal.querySelector('#diagram-content') as HTMLElement;
          const zoomLevelEl = modal.querySelector('#zoom-level') as HTMLElement;

          const updateTransform = () => {
            if (diagramEl) {
              diagramEl.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;
            }
            if (zoomLevelEl) {
              zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
            }
          };

          // Zoom functions
          (window as any).diagramZoomIn = () => {
            scale = Math.min(scale + 0.25, 3);
            updateTransform();
          };

          (window as any).diagramZoomOut = () => {
            scale = Math.max(scale - 0.25, 0.5);
            updateTransform();
          };

          (window as any).diagramReset = () => {
            scale = 1;
            position = { x: 0, y: 0 };
            updateTransform();
          };

          (window as any).closeDiagramModal = () => {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
            delete (window as any).diagramZoomIn;
            delete (window as any).diagramZoomOut;
            delete (window as any).diagramReset;
            delete (window as any).closeDiagramModal;
          };

          // Pan functionality
          if (contentEl) {
            contentEl.addEventListener('mousedown', (e) => {
              if (e.button === 0) {
                isDragging = true;
                dragStart = {
                  x: e.clientX - position.x,
                  y: e.clientY - position.y,
                };
                contentEl.style.cursor = 'grabbing';
              }
            });

            contentEl.addEventListener('mousemove', (e) => {
              if (isDragging) {
                position = {
                  x: e.clientX - dragStart.x,
                  y: e.clientY - dragStart.y,
                };
                updateTransform();
              }
            });

            contentEl.addEventListener('mouseup', () => {
              isDragging = false;
              if (contentEl) contentEl.style.cursor = 'grab';
            });

            contentEl.addEventListener('mouseleave', () => {
              isDragging = false;
              if (contentEl) contentEl.style.cursor = 'grab';
            });

            contentEl.addEventListener('wheel', (e) => {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -0.1 : 0.1;
              scale = Math.max(0.5, Math.min(3, scale + delta));
              updateTransform();
            });
          }

          // Close on overlay click
          modal.addEventListener('click', (e) => {
            if (e.target === modal) {
              (window as any).closeDiagramModal();
            }
          });

          // Close on ESC
          const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              (window as any).closeDiagramModal();
              window.removeEventListener('keydown', handleEsc);
            }
          };
          window.addEventListener('keydown', handleEsc);
        });

        // Add keyboard support
        wrapper.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            wrapper.click();
          }
        });
      });
    };

    // Try multiple times to catch all rendered diagrams
    const interval = setInterval(() => {
      wrapDiagrams();
    }, 500);

    // Also run immediately and after a delay
    setTimeout(wrapDiagrams, 100);
    setTimeout(wrapDiagrams, 1000);
    setTimeout(() => clearInterval(interval), 5000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

