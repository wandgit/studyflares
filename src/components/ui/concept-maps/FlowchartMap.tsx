import React from 'react';
import { Network, Options } from 'vis-network';
import { DataSet } from 'vis-data';
import { ConceptMapProps, VisNode, FontStyles } from './types';
import { getThemeColors } from './theme';

const FlowchartMap: React.FC<ConceptMapProps> = ({ data, theme = 'default', onNodeClick }) => {
  const themeColors = getThemeColors(theme);
  
  // Process nodes for flowchart layout
  const nodes = new DataSet<VisNode>(data.nodes.map(node => ({
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
      bold: (node.type === 'concept' ? 'bold' : 'normal') as FontStyles,
    },
    size: node.type === 'concept' ? 30 : 20,
    shape: node.type === 'concept' ? 'box' : 'diamond',
  })));

  // Process edges
  const edges = new DataSet(data.edges.map(edge => ({
    ...edge,
    color: { color: themeColors.edge },
    arrows: {
      to: { enabled: true, type: 'continuous' },
    },
    smooth: {
      enabled: true,
      type: 'dynamic',
      roundness: 0.5,
      forceDirection: 'none',
    },
  })));

  // Network options
  const options: Options = {
    layout: {
      hierarchical: {
        direction: 'UD',
        sortMethod: 'directed',
        levelSeparation: 150,
        nodeSpacing: 200,
        treeSpacing: 200,
        blockShifting: true,
        edgeMinimization: true,
        parentCentralization: true,
      },
    },
    physics: false,
    interaction: {
      dragNodes: true,
      dragView: true,
      zoomView: true,
      hover: true,
      navigationButtons: true,
    },
    nodes: {
      shape: 'box',
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      widthConstraint: {
        minimum: 100,
        maximum: 200,
      },
      scaling: {
        min: 10,
        max: 30,
      },
    },
    edges: {
      smooth: {
        enabled: true,
        type: 'straightCross',
        roundness: 0.5,
        forceDirection: 'none',
      },
      arrows: {
        to: { enabled: true, scaleFactor: 1 },
      },
    },
  };

  React.useEffect(() => {
    const container = document.getElementById('flowchart-map');
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
    <div id="flowchart-map" style={{ height: '600px', width: '100%' }} />
  );
};

export default FlowchartMap;
