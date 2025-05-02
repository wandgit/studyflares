import React, { useEffect, useState } from 'react';

interface TooltipProps {
  x: number;
  y: number;
  content: React.ReactNode;
  visible: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ x, y, content, visible }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (visible) {
      // Add padding from viewport edges
      const PADDING = 10;
      const tooltipElement = document.getElementById('concept-tooltip');
      
      if (tooltipElement) {
        const bounds = tooltipElement.getBoundingClientRect();
        const newLeft = Math.min(
          Math.max(PADDING, x), 
          window.innerWidth - bounds.width - PADDING
        );
        const newTop = Math.min(
          Math.max(PADDING, y - bounds.height - 10),
          window.innerHeight - bounds.height - PADDING
        );

        setPosition({ top: newTop, left: newLeft });
      }
    }
  }, [x, y, visible]);

  if (!visible) return null;

  return (
    <div
      id="concept-tooltip"
      className="fixed bg-white shadow-lg rounded-lg p-3 z-50 max-w-xs transition-all duration-150 ease-out"
      style={{
        left: position.left,
        top: position.top,
        pointerEvents: 'none'
      }}
    >
      {content}
    </div>
  );
};

export default Tooltip;
