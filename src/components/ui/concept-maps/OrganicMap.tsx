import React from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { ConceptMapProps, ConceptNode, ConceptEdge, VisNode, Font } from './types';
import { getThemeColors } from './theme';

const OrganicMap: React.FC<ConceptMapProps> = ({ data, theme = 'default', onNodeClick }) => {
  const themeColors = getThemeColors(theme);
  
  // Process nodes for organic layout
  type VisConceptNode = ConceptNode & VisNode;
  const nodes = new DataSet<VisConceptNode>(data.nodes.map(node => ({
    ...node,
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
    shape: node.type === 'concept' ? 'dot' : 'ellipse',
  })));

  // Process edges
  const edges = new DataSet<ConceptEdge>(data.edges.map(edge => ({
    ...edge,
    color: { color: themeColors.edge },
    smooth: {
      enabled: true,
      type: 'dynamic',
      roundness: 0.5,
      forceDirection: 'none'
    },
  })));

  // Network options
  const options = {
    layout: {
      improvedLayout: true,
      randomSeed: 2,
    },
    physics: {
      stabilization: {
        iterations: 200,
      },
      barnesHut: {
        gravitationalConstant: -2000,
        centralGravity: 0.1,
        springLength: 150,
        springConstant: 0.02,
        damping: 0.09,
        avoidOverlap: 0.5,
      },
    },
    interaction: {
      dragNodes: true,
      dragView: true,
      zoomView: true,
      hover: true,
      navigationButtons: true,
      keyboard: true,
    },
    nodes: {
      scaling: {
        min: 10,
        max: 30,
        label: {
          enabled: true,
          min: 14,
          max: 30,
          maxVisible: 30,
          drawThreshold: 5
        },
      },
      font: {
        size: 14,
        face: 'arial',
      },
    },
    edges: {
      smooth: {
        enabled: true,
        type: 'dynamic',
        roundness: 0.5,
      },
      length: 200,
    },
  };

  React.useEffect(() => {
    const container = document.getElementById('organic-map');
    if (container) {
      const network = new Network(
        container,
        { nodes, edges },
        options
      );

      if (onNodeClick) {
        network.on('click', (params) => {
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0] as number;
            onNodeClick(nodeId);
          }
        });
      }

      // Add some natural movement
      network.on('stabilizationIterationsDone', () => {
        const nodeIds = nodes.getIds();
        setInterval(() => {
          nodeIds.forEach(id => {
            const position = network.getPositions([id])[id];
            network.moveNode(
              id,
              position.x + (Math.random() - 0.5) * 2,
              position.y + (Math.random() - 0.5) * 2
            );
          });
        }, 5000);
      });
    }
  }, [data, theme]);

  return (
    <div id="organic-map" style={{ height: '600px', width: '100%' }} />
  );
};

export default OrganicMap;
