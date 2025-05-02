import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { ConceptMapProps } from './types';
import { getThemeColors } from './theme';

const RadialMap: React.FC<ConceptMapProps> = ({
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
      font: { size: 20 - node.level * 2, color: colors.text },
      shape: 'circle',
      size: 30 - node.level * 3,
      shadow: true,
    })));

    const edges = new DataSet(data.edges.map(edge => ({
      ...edge,
      color: colors.edges,
      width: 2,
      smooth: { type: 'continuous' },
    })));

    const options = {
      layout: {
        improvedLayout: true,
        randomSeed: 2,
      },
      physics: {
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springLength: 100,
          springConstant: 0.08,
        },
        maxVelocity: 50,
        minVelocity: 0.1,
        solver: 'forceAtlas2Based',
        stabilization: {
          enabled: true,
          iterations: 100,
          updateInterval: 25,
        },
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
          face: 'Arial',
        },
      },
      edges: {
        smooth: {
          type: 'continuous',
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

export default RadialMap;
