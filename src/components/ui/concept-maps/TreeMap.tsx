import React from 'react';
import { Network, Node, Edge } from 'vis-network';
import { DataSet } from 'vis-data';
import { ConceptMapProps, VisNode } from './types';
import { getThemeColors } from './theme';

const TreeMap: React.FC<ConceptMapProps> = ({ data, theme = 'default', onNodeClick }) => {
  const themeColors = getThemeColors(theme);
  
  // Process nodes for tree layout
  const nodes = new DataSet<Node>(data.nodes.map((node) => ({
    id: node.id,
    label: node.label,
    group: node.type,
    title: node.description,
    color: {
      background: themeColors[node.type || 'node'] || themeColors.node,
      border: themeColors.nodeBorder,
      highlight: { background: themeColors.nodeHighlight },
    },
    font: {
      color: themeColors.text,
      size: 14,
      face: 'arial',
      multi: true,
      bold: node.type === 'concept' ? 'bold' : 'normal',
    },
    size: node.type === 'concept' ? 30 : 20,
  })));

  // Process edges
  const edges = new DataSet<Edge>(data.edges.map((edge) => ({
    id: edge.id,
    from: edge.from,
    to: edge.to,
    label: edge.label,
    color: themeColors.edge,
    arrows: { to: { enabled: true } },
    smooth: {
      enabled: true,
      type: 'cubicBezier',
      forceDirection: 'vertical',
      roundness: 0.5
    },
  })));

  // Network options
  const options: import('vis-network').Options = {
    layout: {
      hierarchical: {
        enabled: true,
        direction: 'LR', // Left to right
        sortMethod: 'directed',
        levelSeparation: 200,
        nodeSpacing: 150,
        treeSpacing: 200,
      },
    },
    physics: false,
    interaction: {
      dragNodes: true,
      dragView: true,
      zoomView: true,
      hover: true,
    },
    nodes: {
      shape: 'box',
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      shadow: true,
      widthConstraint: {
        minimum: 100,
        maximum: 200,
      },
    },
    edges: {
      smooth: {
        enabled: true,
        type: 'cubicBezier',
        forceDirection: 'vertical',
        roundness: 0.5
      } as any
    },
  };

  React.useEffect(() => {
    const container = document.getElementById('tree-map');
    if (container) {
      const network = new Network(
        container,
        { nodes, edges },
        options
      );

      if (onNodeClick) {
        network.on('click', (params) => {
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            onNodeClick(nodeId);
          }
        });
      }
    }
  }, [data, theme]);

  return (
    <div id="tree-map" style={{ height: '600px', width: '100%' }} />
  );
};

export default TreeMap;
