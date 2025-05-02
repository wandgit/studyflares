import React, { useEffect, useRef } from 'react';
import { Network, Options } from 'vis-network';
import { DataSet } from 'vis-data';
import { ConceptMapProps, Font } from './types';
import { getThemeColors } from './theme';

const TimelineMap: React.FC<ConceptMapProps> = ({
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

    // Process nodes for timeline layout
    const nodes = data.nodes.map(node => {
      const level = node.level || 0;
      const timelineY = level * 100; // Vertical spacing between timeline levels
      const x = level * 200; // Horizontal spacing
      
      return {
        id: node.id,
        label: node.label,
        level: node.level,
        type: node.type,
        color: {
          background: themeColors[node.type || 'node'] || themeColors.node,
          border: themeColors.nodeBorder,
          highlight: { background: themeColors.nodeHighlight },
        },
        font: {
          color: themeColors.text,
          size: 14,
          face: 'arial',
          bold: node.type === 'concept' ? 'bold' : 'normal',
        } as Font,
        size: node.type === 'concept' ? 30 : 20,
        x,
        y: timelineY,
        fixed: { x: false, y: true },
      };
    });

    const nodesDataSet = new DataSet(nodes);

    // Process edges with timeline-appropriate styling
    const edgesArray = data.edges.map(edge => ({
      ...edge,
      color: { color: themeColors.edge, highlight: themeColors.edgeHighlight },
      width: 2,
      smooth: {
        enabled: true,
        type: 'curvedCW',
        roundness: 0.2,
        forceDirection: 'horizontal',
      },
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 0.5,
        },
      },
    }));

    const edgesDataSet = new DataSet(edgesArray);

    const options: Options = {
      nodes: {
        shape: 'box',
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        shadow: true,
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.1,
          springLength: 200,
          springConstant: 0.04,
          damping: 0.09,
        },
      },
      interaction: {
        dragNodes: draggable,
        dragView: draggable,
        zoomView: zoomable,
        hover: true,
      },
      layout: {
        hierarchical: {
          enabled: true,
          direction: 'LR',
          sortMethod: 'directed',
          nodeSpacing: 150,
          levelSeparation: 200,
        },
      },
    };

    // Initialize network
    networkInstanceRef.current = new Network(
      networkRef.current,
      { nodes: nodesDataSet, edges: edgesDataSet },
      options
    );

    // Event handlers
    if (onNodeClick) {
      networkInstanceRef.current.on('selectNode', (params: { nodes: number[] }) => {
        if (params.nodes.length > 0) {
          onNodeClick(params.nodes[0]);
        }
      });
    }

    if (onEdgeClick) {
      networkInstanceRef.current.on('selectEdge', (params) => {
        if (params.edges.length > 0) {
          onEdgeClick(params.edges[0]);
        }
      });
    }

    // Animation effect
    if (animations && networkInstanceRef.current) {
      networkInstanceRef.current.on('stabilizationIterationsDone', () => {
        networkInstanceRef.current?.setOptions({ physics: { enabled: false } });
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

export default TimelineMap;
