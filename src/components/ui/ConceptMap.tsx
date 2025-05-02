import React, { useState, useEffect } from 'react';
import Card from './Card';
import VisNetworkMap from './VisNetworkMap';
import { LayoutGrid, Network } from 'lucide-react';
import Tooltip from './concept-maps/Tooltip';

interface Branch {
  title: string;
  nodes: ConceptNode[];
  x: number;
  y: number;
  angle: number;
  style: {
    bg: string;
    border: string;
    name: string;
  };
}

interface ConceptNode {
  id: number;
  label: string;
  level: number;
  category: string;
  description: string;
  examples: string[];
}

interface ConceptEdge {
  id: number;
  from: number;
  to: number;
  label: string;
  type: string;
}

interface ConceptMapProps {
  concepts: {
    nodes: ConceptNode[];
    edges: ConceptEdge[];
  };
  onNodeClick?: (nodeId: number) => void;
}

const ConceptMap: React.FC<ConceptMapProps> = ({ 
  concepts,
  onNodeClick,
}): JSX.Element => {
  // State for hover effects and tooltips
  const [hoveredNode, setHoveredNode] = useState<ConceptNode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [mapType, setMapType] = useState<'default' | 'network'>('default');

  // Responsive layout
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Constants for layout
  const centerX = isDesktop ? window.innerWidth / 2 : 450;
  const centerY = isDesktop ? 400 : window.innerHeight / 2;
  const radius = isDesktop ? Math.min(window.innerWidth / 3, 500) : 300; 
  
  // Node styles matching the example design
  const nodeStyles = {
    core: {
      bg: '#E6F0FF',      // Light blue
      border: '#2B6CB0',   // Darker blue
      gradient: {
        from: '#E6F0FF',
        to: '#FFFFFF'
      },
      width: 320,          // Increased size
      height: 100,         // Increased size
      radius: 16,         // Larger corners
      borderWidth: 3      // Thicker border
    },
    branches: [
      { bg: '#FFF8E1', border: '#B45309', name: 'What is Tested' },     // Yellow
      { bg: '#FFE4E6', border: '#9F1239', name: 'Important Concepts' },   // Pink
      { bg: '#E0F4E8', border: '#166534', name: 'Main Goals' },          // Mint
      { bg: '#FFF8E1', border: '#B45309', name: 'Key Takeaways' }        // Yellow
    ],
    connection: {
      stroke: '#94A3B8',
      opacity: 0.8,
      width: 2
    }
  };

  // Handle hover events
  const handleNodeHover = (node: ConceptNode, event: React.MouseEvent) => {
    const rect = (event.target as SVGElement).getBoundingClientRect();
    setHoveredNode(node);
    setTooltipPosition({
      x: rect.left,
      y: rect.top
    });
  };

  const handleNodeLeave = () => {
    setHoveredNode(null);
  };


  
  // Find and process the core concept
  const coreNode = concepts.nodes.find(node => node.level === 0);
  
  // Filter and sort other nodes by category
  const nonCoreNodes = concepts.nodes.filter(node => node.level !== 0);
  const categories = Array.from(new Set(nonCoreNodes.map(node => node.category)));

  // Calculate branch positions
  const branchLayout = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total;
    const radius = isDesktop ? 300 : 250; // Larger radius for desktop
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      angle
    };
  };

  // Create branches with their associated nodes
  const branches: Branch[] = categories.map((category, index) => {
    const categoryNodes = nonCoreNodes.filter(node => node.category === category);
    const { x, y, angle } = branchLayout(index, categories.length);
    return {
      title: category.toUpperCase(),
      nodes: categoryNodes.sort((a, b) => a.level - b.level),
      x,
      y,
      angle,
      style: nodeStyles.branches[index % nodeStyles.branches.length]
    };
  });

  return (
    <Card className="p-4">
      {/* Map Type Toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setMapType('default')}
            className={`inline-flex items-center px-3 py-2 rounded-md text-sm ${mapType === 'default' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Simple
          </button>
          <button
            onClick={() => setMapType('network')}
            className={`inline-flex items-center px-3 py-2 rounded-md text-sm ${mapType === 'network' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Network className="w-4 h-4 mr-2" />
            Advanced
          </button>
        </div>
      </div>

      {mapType === 'default' ? (
        <div className="flex flex-wrap gap-4">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${isDesktop ? 1400 : 1200} ${isDesktop ? 900 : 800}`}
            className="w-full h-full"
          >
            {/* Draw connecting lines */}
            {concepts.edges.map((edge) => {
              const fromNode = concepts.nodes.find((n) => n.id === edge.from);
              const toNode = concepts.nodes.find((n) => n.id === edge.to);
              if (fromNode && toNode) {
                // Calculate positions based on branch angles
                const fromBranch = branches.find(b => b.nodes.some(n => n.id === fromNode.id));
                const toBranch = branches.find(b => b.nodes.some(n => n.id === toNode.id));
                
                if (fromBranch && toBranch) {
                  const fromX = centerX + Math.cos(fromBranch.angle) * (radius * 0.6);
                  const fromY = centerY + Math.sin(fromBranch.angle) * (radius * 0.6);
                  const toX = centerX + Math.cos(toBranch.angle) * (radius * 0.6);
                  const toY = centerY + Math.sin(toBranch.angle) * (radius * 0.6);
                  
                  return (
                    <path
                      key={edge.id}
                      d={`M ${fromX} ${fromY} Q ${centerX} ${centerY} ${toX} ${toY}`}
                      fill="none"
                      stroke={nodeStyles.connection.stroke}
                      strokeOpacity={nodeStyles.connection.opacity}
                      strokeWidth={nodeStyles.connection.width}
                      strokeDasharray="5,5"
                    />
                  );
                }
              }
              return null;
            })}

            {/* Draw branches */}
            {branches.map((branch) => {
              // Branch positions are now pre-calculated
              const boxHeight = branch.nodes.length * 30 + 50;
              const nodeWidth = 200;
              const nodeHeight = 24;
              
              return (
                <g key={branch.title}>
                  {/* Branch title */}
                  <text
                    x={branch.x}
                    y={branch.y - boxHeight/2 + 25}
                    textAnchor="middle"
                    fill={branch.style.border}
                    className="text-sm font-semibold"
                  >
                    {branch.title}
                  </text>

                  {/* Branch nodes */}
                  {branch.nodes.map((node, i: number) => (
                    <g
                      key={node.id}
                      transform={`translate(${branch.x}, ${branch.y - boxHeight/2 + 50 + i * 30})`}
                      onClick={() => onNodeClick?.(node.id)}
                    >
                      <g
                        className="cursor-pointer transition-transform duration-200 ease-out"
                        transform={hoveredNode?.id === node.id ? 'scale(1.05)' : 'scale(1)'}
                        onMouseEnter={(e) => handleNodeHover(node, e)}
                        onMouseLeave={handleNodeLeave}
                      >
                        {/* Node highlight background */}
                        <rect
                          x={-nodeWidth/2 - 10}
                          y={-nodeHeight/2 - 5}
                          width={nodeWidth + 20}
                          height={nodeHeight + 10}
                          rx={12}
                          fill={branch.style.bg}
                          stroke={branch.style.border}
                          opacity={hoveredNode?.id === node.id ? 0.2 : 0}
                          className="transition-opacity duration-200"
                        />
                        {/* Node text */}
                        <text
                          x={0}
                          y={0}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={branch.style.border}
                          className={`text-sm transition-all duration-200 ${hoveredNode?.id === node.id ? 'font-semibold' : ''}`}
                        >
                          {node.label}
                        </text>
                      </g>
                    </g>
                  ))}
                </g>
              );
            })}

            {/* Draw central node */}
            {coreNode && (
              <g>
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="coreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={nodeStyles.core.gradient.from} />
                    <stop offset="100%" stopColor={nodeStyles.core.gradient.to} />
                  </linearGradient>
                </defs>
                
                {/* Core node background with stronger shadow */}
                <rect
                  x={centerX - nodeStyles.core.width / 2}
                  y={centerY - nodeStyles.core.height / 2}
                  width={nodeStyles.core.width}
                  height={nodeStyles.core.height}
                  rx={nodeStyles.core.radius}
                  ry={nodeStyles.core.radius}
                  fill="url(#coreGradient)"
                  stroke={nodeStyles.core.border}
                  strokeWidth={nodeStyles.core.borderWidth}
                  filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))"
                  className="transition-transform duration-300"
                />
                
                {/* Core node text */}
                <text
                  x={centerX}
                  y={centerY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#000000"
                  className="text-2xl font-bold"
                >
                  {coreNode.label}
                </text>
              </g>
            )}
          </svg>

          {/* Tooltip */}
          {hoveredNode && (
            <Tooltip
              x={tooltipPosition.x}
              y={tooltipPosition.y}
              content={hoveredNode.description}
              visible={true}
            />
          )}
        </div>
      ) : (
        <VisNetworkMap
          concepts={{
            nodes: concepts.nodes.map((concept, index) => ({
              id: index + 1,
              label: concept.label,
              level: Math.min(5, Math.ceil((index + 1) / 3))
            })),
            edges: concepts.edges
          }}
          layout="force"
          theme="cool"
          onNodeClick={(nodeId) => {
            const concept = concepts.nodes[nodeId - 1];
            if (concept && onNodeClick) {
              onNodeClick(concept.id);
            }
          }}
        />
      )}
    </Card>
  );
};

export default ConceptMap;