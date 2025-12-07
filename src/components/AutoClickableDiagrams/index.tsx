import React, { useEffect, useState, useRef } from 'react';
import DiagramModal from '../DiagramModal';
import '../ClickableDiagram/styles.css';

interface DiagramData {
  id: string;
  html: string;
  title: string;
}

export default function AutoClickableDiagrams() {
  const [diagrams, setDiagrams] = useState<Map<string, DiagramData>>(new Map());
  const [openDiagramId, setOpenDiagramId] = useState<string | null>(null);
  const processedRef = useRef<Set<HTMLElement>>(new Set());

  // Debug: log component mount
  useEffect(() => {
    console.log('[AutoClickableDiagrams] Component mounted');
  }, []);

  useEffect(() => {
    const wrapDiagrams = () => {
      // Find all Mermaid containers - Docusaurus renders them in different ways
      // Try multiple selectors to catch all cases
      const selectors = [
        '.mermaid',
        'pre code.language-mermaid',
        'code.language-mermaid',
        '[class*="mermaid"]',
      ];
      
      let mermaidContainers: NodeListOf<Element> = document.querySelectorAll('.mermaid');
      
      // If no .mermaid found, try other selectors
      if (mermaidContainers.length === 0) {
        for (const selector of selectors) {
          mermaidContainers = document.querySelectorAll(selector);
          if (mermaidContainers.length > 0) break;
        }
      }
      
      // Debug: log found diagrams
      if (mermaidContainers.length > 0) {
        console.log(`[AutoClickableDiagrams] Found ${mermaidContainers.length} Mermaid diagram(s)`);
      }
      
      const newDiagrams = new Map<string, DiagramData>();

      mermaidContainers.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        
        // Skip if already processed
        if (processedRef.current.has(htmlElement) || htmlElement.closest('.clickable-diagram-wrapper')) {
          return;
        }

        // Find the actual container - could be the element itself or its parent
        let diagramContainer = htmlElement;
        
        // If it's a code element, get the pre parent
        if (htmlElement.tagName === 'CODE') {
          const preParent = htmlElement.closest('pre');
          if (preParent) {
            diagramContainer = preParent;
          }
        } else {
          // For .mermaid divs, check if there's a parent container we should wrap
          const parent = htmlElement.parentElement;
          if (parent && (parent.classList.contains('mermaid') || parent.tagName === 'P')) {
            diagramContainer = parent;
          }
        }

        // Skip if already wrapped
        if (diagramContainer.closest('.clickable-diagram-wrapper')) {
          return;
        }

        const id = `diagram-${index}-${Date.now()}`;
        
        // Get title from previous heading
        let title = 'Diagram';
        let prevElement = diagramContainer.previousElementSibling;
        let searchCount = 0;
        while (prevElement && searchCount < 10) {
          if (prevElement.tagName?.match(/^H[1-6]$/)) {
            title = prevElement.textContent?.trim() || 'Diagram';
            break;
          }
          prevElement = prevElement.previousElementSibling;
          searchCount++;
        }

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'clickable-diagram-wrapper';
        wrapper.setAttribute('role', 'button');
        wrapper.setAttribute('tabindex', '0');
        wrapper.setAttribute('data-diagram-id', id);
        wrapper.setAttribute('aria-label', 'Click to expand diagram');

        // Wrap the container
        diagramContainer.parentNode?.insertBefore(wrapper, diagramContainer);
        wrapper.appendChild(diagramContainer);

        // Store the HTML content for the modal
        const htmlContent = diagramContainer.outerHTML;
        
        newDiagrams.set(id, {
          id,
          html: htmlContent,
          title,
        });

        processedRef.current.add(htmlElement);

        // Add click handler
        const handleClick = () => {
          setOpenDiagramId(id);
        };

        wrapper.addEventListener('click', handleClick);

        // Add keyboard support
        wrapper.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        });
      });

      if (newDiagrams.size > 0) {
        setDiagrams((prev) => {
          const updated = new Map(prev);
          newDiagrams.forEach((value, key) => {
            updated.set(key, value);
          });
          return updated;
        });
      }
    };

    // Run after Mermaid renders - Mermaid might take time to initialize
    const checkInterval = setInterval(() => {
      wrapDiagrams();
    }, 500);

    // Initial attempts with delays to catch rendered diagrams
    // Mermaid typically renders after page load
    const timeouts = [
      setTimeout(wrapDiagrams, 100),
      setTimeout(wrapDiagrams, 500),
      setTimeout(wrapDiagrams, 1000),
      setTimeout(wrapDiagrams, 2000),
      setTimeout(wrapDiagrams, 3000),
      setTimeout(wrapDiagrams, 5000),
    ];

    // Also listen for Mermaid initialization events
    const handleMermaidInit = () => {
      setTimeout(wrapDiagrams, 100);
    };
    
    window.addEventListener('mermaid-ready', handleMermaidInit);
    document.addEventListener('DOMContentLoaded', wrapDiagrams);

    // Cleanup after 20 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      timeouts.forEach(clearTimeout);
      window.removeEventListener('mermaid-ready', handleMermaidInit);
    }, 20000);

    return () => {
      clearInterval(checkInterval);
      timeouts.forEach(clearTimeout);
      window.removeEventListener('mermaid-ready', handleMermaidInit);
    };
  }, []);

  const currentDiagram = openDiagramId ? diagrams.get(openDiagramId) : null;

  return (
    <>
      {currentDiagram && (
        <DiagramModal
          isOpen={openDiagramId !== null}
          onClose={() => setOpenDiagramId(null)}
          title={currentDiagram.title}
        >
          <div dangerouslySetInnerHTML={{ __html: currentDiagram.html }} />
        </DiagramModal>
      )}
    </>
  );
}

