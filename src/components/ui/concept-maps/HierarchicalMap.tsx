import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { ConceptMapProps } from './types';
import { getThemeColors } from './theme';

const HierarchicalMap: React.FC<ConceptMapProps> = ({
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
    
    const nodes = new DataSet(data.nodes.map(node => ({
      ...node,
      color: colors.nodes[node.level % colors.nodes.length],
      font: { size: 16 - node.level, color: colors.text },
      shape: 'box',
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      shadow: true,
    })));

    const edges = new DataSet(data.edges.map(edge => ({
      ...edge,
      color: colors.edges,
      arrows: 'to',
      smooth: { 
        enabled: true,
        type: 'cubicBezier',
        roundness: 0.5,
        forceDirection: false
      },
    })));

    const options = {
      layout: {
        hierarchical: {
          direction: 'UD',
          sortMethod: 'directed',
          nodeSpacing: 150,
          levelSeparation: 150,
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
      },
      nodes: {
        borderWidth: 2,
        borderWidthSelected: 4,
        chosen: true,
        font: {
          size: 16,
          face: 'Arial',
        },
      },
      edges: {
        width: 2,
        selectionWidth: 3,
        smooth: {
          enabled: true,
          type: 'cubicBezier',
          roundness: 0.5,
        },
      },
    };

    networkInstanceRef.current = new Network(
      networkRef.current,
      { nodes, edges },
      options
    );

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
      }}
    />
  );
};

export default HierarchicalMap;
