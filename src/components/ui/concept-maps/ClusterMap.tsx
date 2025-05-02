import React from 'react';
import { Network, Options } from 'vis-network';
import { DataSet } from 'vis-data';
import { ConceptMapProps, ConceptNode, ConceptEdge, ThemeColors, VisNode, VisEdge, FontStyles } from './types';
import { getThemeColors } from './theme';

const ClusterMap: React.FC<ConceptMapProps> = ({ data, theme = 'default', onNodeClick }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const networkRef = React.useRef<Network | null>(null);
  const nodesRef = React.useRef<DataSet<VisNode> | null>(null);
  const edgesRef = React.useRef<DataSet<VisEdge> | null>(null);
  const themeColors: ThemeColors = getThemeColors(theme);
  
  // Process nodes for cluster layout
  const processedNodes = data.nodes.map((node: ConceptNode) => {
    const nodeType = node.type || 'default';
    const nodeSize = nodeType === 'concept' ? 30 : 20;
    const nodeBold = nodeType === 'concept' ? 'bold' as FontStyles : 'normal' as FontStyles;
    const nodeShape = nodeType === 'concept' ? 'dot' : 'ellipse';
    const processedNode: VisNode = {
      ...node,
      color: {
        background: (themeColors[nodeType as keyof ThemeColors] as string) || themeColors.node,
        border: themeColors.edge,
        highlight: { background: (themeColors[nodeType as keyof ThemeColors] as string) },
      },
      font: {
        color: themeColors.node,
        size: 14,
        face: 'arial',
        bold: nodeBold,
      },
      margin: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5
      },
      size: nodeSize,
      shape: nodeShape,
    };
    return processedNode;
  });

  nodesRef.current = new DataSet(processedNodes);

  // Process edges
  const processedEdges = data.edges.map((edge: ConceptEdge) => {
    const edgeColor = themeColors.edge;
    const processedEdge: VisEdge = {
      ...edge,
      color: { color: edgeColor },
      arrows: { to: { enabled: true } },
      smooth: {
        enabled: true,
        type: 'dynamic',
        roundness: 0.5,
        forceDirection: 'none'
      }
    };
    return processedEdge;
  });

  edgesRef.current = new DataSet(processedEdges);

  // Network options
  const options: Options = {
    layout: {
      improvedLayout: true,
      clusterThreshold: 150,
      hierarchical: false,
    },
    physics: {
      stabilization: true,
      barnesHut: {
        gravitationalConstant: -2000,
        centralGravity: 0.3,
        springLength: 200,
        springConstant: 0.04,
        damping: 0.09,
      },
    },
    interaction: {
      dragNodes: true,
      dragView: true,
      zoomView: true,
      hover: true,
    },
    nodes: {
      shape: 'dot',
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
    },
    edges: {
      smooth: {
        enabled: true,
        type: 'continuous',
        forceDirection: 'none',
        roundness: 0.5
      },
      length: 250,
    },
    groups: {
      concept: { color: themeColors.concept },
      topic: { color: themeColors.topic },
      subtopic: { color: themeColors.subtopic },
      example: { color: themeColors.example },
    },
  };

  React.useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const networkData = {
      nodes: nodesRef.current as unknown as DataSet<any>,
      edges: edgesRef.current as unknown as DataSet<any>
    };
    if (container) {
      networkRef.current = new Network(
        container,
        networkData,
        options
      );

      if (onNodeClick && networkRef.current && nodesRef.current) {
        networkRef.current.on('click', (params: { nodes: number[] }) => {
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = nodesRef.current?.get(nodeId);
            if (node && onNodeClick) {
              onNodeClick(nodeId);
            }
          }
        });
      }

      // Create clusters based on node types
      const nodeTypes = [...new Set(data.nodes.map((node: ConceptNode) => node.type))];
      nodeTypes.forEach((type: string | undefined) => {
        if (type && networkRef.current) {
          const clusterOptionsByData = {
            joinCondition: (nodeOptions: any) => (nodeOptions as ConceptNode).type === type,
            clusterNodeProperties: {
              id: 'cluster-' + type,
              label: type.charAt(0).toUpperCase() + type.slice(1) + ' Cluster',
              shape: 'dot',
              size: 30,
              color: (themeColors[type as keyof ThemeColors] as string) || themeColors.node,
            },
          };
          networkRef.current.cluster(clusterOptionsByData);
        }
      });
    }
  }, [data, theme, onNodeClick]);

  return (
    <div ref={containerRef} style={{ height: '600px', width: '100%' }} />
  );
};

export default ClusterMap;
