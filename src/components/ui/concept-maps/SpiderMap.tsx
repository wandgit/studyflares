import React, { useEffect, useRef } from 'react';
import { Network, Node, Edge, Options } from 'vis-network';
import { DataSet } from 'vis-data';
import { ConceptMapProps } from './types';
import { getThemeColors } from './theme';

const SpiderMap: React.FC<ConceptMapProps> = ({
  data,
  theme = 'default',
  onNodeClick,
  onEdgeClick,
  height = '600px',
  width = '100%',
  zoomable = true,
  draggable = true,
  showControls = true,
  animations = true,
}) => {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!networkRef.current) return;

    const themeColors = getThemeColors(theme);
    
    // Process nodes to create spider-like structure
    const nodes = new DataSet<Node>(data.nodes.map(node => {
      const isCenter = node.level === 0;
      const angle = (2 * Math.PI * node.id) / data.nodes.length;
      const radius = node.level * 150; // Adjust radius based on level
      
      return {
        ...node,
        color: {
          background: isCenter ? themeColors.centerNode : themeColors.node,
          border: themeColors.nodeBorder,
          highlight: { background: themeColors.nodeHighlight },
        },
        font: {
          color: themeColors.text,
          size: isCenter ? 20 : 14,
          bold: isCenter ? 'bold' : 'normal' as const,
        },
        size: isCenter ? 40 : 25,
        x: isCenter ? 0 : radius * Math.cos(angle),
        y: isCenter ? 0 : radius * Math.sin(angle),
        fixed: isCenter, // Fix center node position
      };
    }));

    // Process edges with curved connections
    const edges = new DataSet<Edge>(data.edges.map(edge => ({
      ...edge,
      color: { color: themeColors.edge, highlight: themeColors.edgeHighlight },
      width: 2,
      smooth: {
        enabled: true,
        type: 'curvedCW',
        roundness: 0.2,
        forceDirection: 'none',
      },
    })));

    const options: Options = {
      nodes: {
        shape: 'dot',
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        arrows: {
          to: { enabled: true, scaleFactor: 0.5 },
        },
        shadow: true,
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.1,
          springLength: 200,
          springConstant: 0.04,
        },
      },
      interaction: {
        dragNodes: draggable,
        dragView: draggable,
        zoomView: zoomable,
        hover: true,
      },
      layout: {
        improvedLayout: true,
      },
    };

    // Initialize network
    const network = new Network(networkRef.current, { nodes, edges }, options);
    networkInstanceRef.current = network;

    // Event handlers
    if (onNodeClick) {
      network.on('selectNode', (params) => {
        if (params.nodes.length > 0) {
          onNodeClick(params.nodes[0]);
        }
      });
    }

    if (onEdgeClick) {
      network.on('selectEdge', (params) => {
        if (params.edges.length > 0) {
          onEdgeClick(params.edges[0]);
        }
      });
    }

    // Animation effect
    if (animations) {
      network.on('stabilizationIterationsDone', () => {
        network.setOptions({ physics: { enabled: false } });
      });
    }

    return () => {
      if (networkInstanceRef.current) {
        networkInstanceRef.current.destroy();
      }
    };
  }, [data, theme, onNodeClick, onEdgeClick, zoomable, draggable, animations]);

  return (
    <div style={{ height, width, border: '1px solid #ddd', borderRadius: '8px' }}>
      <div ref={networkRef} style={{ height: '100%', width: '100%' }} />
      {showControls && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
          <button onClick={() => networkInstanceRef.current?.fit()}>
            Fit View
          </button>
        </div>
      )}
    </div>
  );
};

export default SpiderMap;
