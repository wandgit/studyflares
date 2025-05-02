import React from 'react';
import { ConceptMapProps } from './types';

interface Branch {
  title: string;
  items: string[];
  color: string;
}

const ForceDirectedMap: React.FC<ConceptMapProps> = ({
  data,
  onNodeClick,
  height = '600px',
  width = '100%',
}) => {
  // Find the central node (level 0)
  const centralNode = data.nodes.find(node => node.level === 0);
  
  // Group nodes into branches based on their connections
  const branches: Branch[] = [
    { title: 'WHAT IS TESTED', items: [], color: '#FFF8DC' },
    { title: 'IMPORTANT CONCEPTS', items: [], color: '#FFE4E1' },
    { title: 'MAIN GOALS', items: [], color: '#E0FFF0' },
    { title: 'KEY TAKEAWAYS', items: [], color: '#FFF8DC' }
  ];

  // Group connected nodes into branches
  data.nodes.forEach(node => {
    if (node.level === 1) {
      const branchIndex = Math.floor(Math.random() * branches.length);
      branches[branchIndex].items.push(node.label);
    }
  });

  const centerX = 400;
  const centerY = 300;
  const radius = 200;

  const handleNodeClick = (title: string) => {
    if (onNodeClick) {
      const node = data.nodes.find(n => n.label === title);
      if (node) {
        onNodeClick(node.id);
      }
    }
  };

  return (
    <div style={{ height, width, overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 800 600">
        {/* Central Node */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          <circle
            r="80"
            fill="#E6F3FF"
            stroke="#A0C4FF"
            strokeWidth="2"
            onClick={() => centralNode && handleNodeClick(centralNode.label)}
            style={{ cursor: 'pointer' }}
          />
          <text
            textAnchor="middle"
            dy="-10"
            fontSize="16"
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
          >
            {centralNode?.label.split(' ').map((word, i) => (
              <tspan key={i} x="0" dy={i === 0 ? 0 : '20'}>
                {word}
              </tspan>
            ))}
          </text>
        </g>

        {/* Branches */}
        {branches.map((branch, index) => {
          const angle = (index * 2 * Math.PI) / branches.length;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          return (
            <g key={index}>
              {/* Branch connection line */}
              <path
                d={`M ${centerX + Math.cos(angle) * 80} ${centerY + Math.sin(angle) * 80} 
                   Q ${centerX + Math.cos(angle) * 140} ${centerY + Math.sin(angle) * 140}
                   ${x} ${y}`}
                fill="none"
                stroke="#999"
                strokeWidth="2"
              />

              {/* Branch container */}
              <g transform={`translate(${x}, ${y})`}>
                <rect
                  x="-100"
                  y="-30"
                  width="200"
                  height={40 + branch.items.length * 25}
                  rx="10"
                  fill={branch.color}
                  stroke="#999"
                  strokeWidth="1"
                />
                
                {/* Branch title */}
                <text
                  textAnchor="middle"
                  y="-10"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {branch.title}
                </text>

                {/* Branch items */}
                {branch.items.map((item, i) => (
                  <text
                    key={i}
                    textAnchor="middle"
                    y={20 + i * 20}
                    fontSize="12"
                    onClick={() => handleNodeClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    {item}
                  </text>
                ))}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default ForceDirectedMap;
