import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { ConceptMapProps } from './types';
import { getThemeColors } from './theme';

const MindMap: React.FC<ConceptMapProps> = ({
  data,
  theme = 'default',
  onNodeClick,
  onEdgeClick,
  height = '600px',
  width = '100%',
}) => {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!networkRef.current) return;

    const colors = getThemeColors(theme);

    // Create a more organic mind map look
    const nodes = new DataSet(data.nodes.map(node => {
      const isRoot = node.level === 0;
      const isBranch = node.level === 1;
      
      return {
        ...node,
        color: {
          background: colors.nodes[node.level % colors.nodes.length],
          border: colors.edges,
          highlight: {
            background: colors.nodes[node.level % colors.nodes.length],
            border: colors.text,
          },
        },
        font: {
          size: isRoot ? 24 : isBranch ? 20 : 16,
          color: colors.text,
          face: 'Arial',
          bold: isRoot || isBranch,
        },
        shape: isRoot ? 'ellipse' : 'box',
        margin: 10,
        shadow: true,
        borderWidth: isRoot ? 3 : isBranch ? 2 : 1,
        widthConstraint: {
          minimum: 100,
          maximum: 200,
        },
      };
    }));

    const edges = new DataSet(data.edges.map(edge => ({
      ...edge,
      color: {
        color: colors.edges,
        highlight: colors.text,
      },
      width: 2,
      smooth: {
        type: 'curvedCW',
        roundness: 0.3,
      },
      chosen: {
        edge: (values: any) => {
          values.width *= 2;
        },
      },
    })));

    const options = {
      layout: {
        hierarchical: {
          direction: 'LR',
          sortMethod: 'directed',
          nodeSpacing: 150,
          levelSeparation: 200,
          parentCentralization: true,
          blockShifting: true,
          edgeMinimization: true,
        },
      },
      physics: {
        enabled: false,
      },
      interaction: {
        dragNodes: true,
        dragView: true,
        zoomView: true,
        hover: true,
        multiselect: true,
        selectConnectedEdges: true,
      },
      nodes: {
        shape: 'box',
        margin: 10,
        chosen: {
          node: (values: any) => {
            values.borderWidth *= 2;
            values.borderColor = colors.text;
          },
        },
      },
      edges: {
        smooth: {
          type: 'curvedCW',
          roundness: 0.3,
        },
      },
    };

    networkInstanceRef.current = new Network(
      networkRef.current,
      { nodes, edges },
      options
    );

    // Add zoom controls
    const zoomControls = document.createElement('div');
    zoomControls.style.position = 'absolute';
    zoomControls.style.bottom = '20px';
    zoomControls.style.right = '20px';
    zoomControls.style.zIndex = '1';
    zoomControls.className = 'flex gap-2';

    const createButton = (text: string, onClick: () => void) => {
      const button = document.createElement('button');
      button.textContent = text;
      button.className = 'p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 focus:outline-none';
      button.onclick = onClick;
      return button;
    };

    const zoomIn = createButton('+', () => {
      networkInstanceRef.current?.moveTo({
        scale: networkInstanceRef.current.getScale() * 1.2,
      });
    });

    const zoomOut = createButton('-', () => {
      networkInstanceRef.current?.moveTo({
        scale: networkInstanceRef.current.getScale() / 1.2,
      });
    });

    const fitButton = createButton('⟲', () => {
      networkInstanceRef.current?.fit();
    });

    zoomControls.appendChild(zoomIn);
    zoomControls.appendChild(zoomOut);
    zoomControls.appendChild(fitButton);
    networkRef.current.appendChild(zoomControls);

    if (onNodeClick) {
      networkInstanceRef.current.on('click', (params) => {
        if (params.nodes.length > 0) {
          onNodeClick(params.nodes[0]);
        }
      });
    }

    if (onEdgeClick) {
      networkInstanceRef.current.on('click', (params) => {
        if (params.edges.length > 0) {
          onEdgeClick(params.edges[0]);
        }
      });
    }

    return () => {
      if (networkInstanceRef.current) {
        networkInstanceRef.current.destroy();
      }
    };
  }, [data, theme, onNodeClick, onEdgeClick]);

  return (
    <div
      ref={networkRef}
      style={{
        height,
        width,
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
      }}
    />
  );
};

export default MindMap;
