import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import Card from './Card';

interface ConceptNode {
  id: number;
  label: string;
  level: number;
}

interface ConceptEdge {
  id: number;
  from: number;
  to: number;
  label?: string;
}

interface ConceptMapProps {
  concepts: {
    nodes: ConceptNode[];
    edges: ConceptEdge[];
  };
  layout?: 'hierarchical' | 'radial' | 'force' | 'tree';
  onNodeClick?: (nodeId: number) => void;
  onEdgeClick?: (edgeId: number) => void;
  theme?: 'default' | 'warm' | 'cool' | 'nature';
}

const VisNetworkMap: React.FC<ConceptMapProps> = ({ 
  concepts, 
  layout = 'force',
  onNodeClick,
  onEdgeClick,
  theme = 'default'
}) => {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!networkRef.current) return;

    const nodes = new DataSet(concepts.nodes.map(node => ({
      ...node,
      color: getNodeColor(node.level),
      font: { size: getFontSize(node.level) },
      size: getNodeSize(node.level),
    })));

    const edges = new DataSet(concepts.edges.map((edge, index) => ({
      ...edge,
      id: index,
      arrows: 'to',
      color: { color: '#666666' },
      width: 2,
    })));

    const data = { nodes, edges };

    const getLayoutOptions = () => {
      switch (layout) {
        case 'hierarchical':
          return {
            hierarchical: {
              direction: 'UD',
              sortMethod: 'directed',
              levelSeparation: 150,
              nodeSpacing: 100,
            },
          };
        case 'radial':
          return {
            layout: {
              randomSeed: 1,
              improvedLayout: true,
              hierarchical: false,
            },
          };
        case 'tree':
          return {
            layout: {
              hierarchical: {
                direction: 'LR',
                sortMethod: 'directed',
                levelSeparation: 200,
                nodeSpacing: 150,
              },
            },
          };
        default:
          return {
            layout: {
              improvedLayout: true,
              hierarchical: false,
            },
          };
      }
    };

    const options = {
      ...getLayoutOptions(),
      nodes: {
        shape: 'dot',
        borderWidth: 2,
        borderWidthSelected: 4,
        scaling: {
          min: 16,
          max: 32,
          label: { enabled: true, min: 14, max: 24 }
        },
        font: {
          color: '#333333',
          face: 'Arial',
          size: 14,
          bold: {
            color: '#333333',
            size: 16,
            mod: 'bold'
          }
        },
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.2)',
          size: 10,
          x: 5,
          y: 5
        }
      },
      edges: {
        font: {
          size: 12,
          align: 'middle',
          background: 'white',
          strokeWidth: 2
        },
        smooth: {
          enabled: true,
          type: 'dynamic',
          roundness: 0.5,
          forceDirection: 'none'
        },
        selectionWidth: 3,
        color: {
          color: '#666666',
          highlight: '#3498db',
          hover: '#1abc9c'
        }
      },
      physics: {
        enabled: true,
        stabilization: {
          enabled: true,
          iterations: 1000,
          updateInterval: 50,
          fit: true
        },
        barnesHut: {
          gravitationalConstant: -2000,
          springConstant: 0.04,
          springLength: 200
        },
        minVelocity: 0.75
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        zoomView: true,
        dragView: true,
        dragNodes: true,
        selectable: true,
        selectConnectedEdges: true,
        hoverConnectedEdges: true,
        keyboard: {
          enabled: true,
          speed: { x: 10, y: 10, zoom: 0.02 },
          bindToWindow: true
        },
        navigationButtons: true,
        zoomSpeed: 1
      },
    };

    networkInstanceRef.current = new Network(networkRef.current, data, options);

    if (networkInstanceRef.current) {
      networkInstanceRef.current.on('click', (params) => {
        if (params.nodes.length > 0 && onNodeClick) {
          onNodeClick(params.nodes[0]);
        } else if (params.edges.length > 0 && onEdgeClick) {
          onEdgeClick(params.edges[0]);
        }
      });

      networkInstanceRef.current.on('stabilizationProgress', (params) => {
        const progress = Math.round(params.iterations / params.total * 100);
        console.log('Layout stabilization progress:', progress + '%');
      });

      networkInstanceRef.current.once('stabilizationIterationsDone', () => {
        console.log('Layout stabilization finished');
      });
    }

    return () => {
      if (networkInstanceRef.current) {
        networkInstanceRef.current.destroy();
        networkInstanceRef.current = null;
      }
    };
  }, [concepts, layout, onNodeClick, onEdgeClick]);

  const getThemeColors = () => {
    const themes = {
      default: {
        1: '#E3F2FD',
        2: '#90CAF9',
        3: '#42A5F5',
        4: '#1E88E5',
        5: '#1565C0',
      },
      warm: {
        1: '#FFEBEE',
        2: '#FFCDD2',
        3: '#EF9A9A',
        4: '#E57373',
        5: '#EF5350',
      },
      cool: {
        1: '#E8F5E9',
        2: '#C8E6C9',
        3: '#A5D6A7',
        4: '#81C784',
        5: '#66BB6A',
      },
      nature: {
        1: '#F1F8E9',
        2: '#DCEDC8',
        3: '#C5E1A5',
        4: '#AED581',
        5: '#9CCC65',
      },
    };
    return themes[theme];
  };

  const getNodeColor = (level: number): string => {
    const colors = getThemeColors();
    return colors[level as keyof typeof colors] || colors[1];
  };

  const getFontSize = (level: number): number => {
    const sizes = {
      1: 14,
      2: 16,
      3: 18,
      4: 20,
      5: 22,
    };
    return sizes[level as keyof typeof sizes] || sizes[1];
  };

  const getNodeSize = (level: number): number => {
    const sizes = {
      1: 20,
      2: 25,
      3: 30,
      4: 35,
      5: 40,
    };
    return sizes[level as keyof typeof sizes] || sizes[1];
  };

  return (
    <Card className="p-4">
      <div
        ref={networkRef}
        style={{
          height: '600px',
          width: '100%',
          background: '#ffffff',
        }}
      />
    </Card>
  );
};

export default VisNetworkMap;
