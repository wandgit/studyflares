import { Node, Edge } from 'vis-network';

export type FontStyles = 'normal' | 'bold' | 'italic' | 'bolditalic';

export interface Font {
  color?: string;
  size?: number;
  face?: string;
  bold?: FontStyles;
  italic?: boolean;
  vadjust?: number;
  multi?: boolean | string;
  align?: 'left' | 'center' | 'right';
}

export type VisNode = Node & {
  font?: Font;
  color?: {
    background?: string;
    border?: string;
    highlight?: { background?: string };
  };
  shape?: string;
  size?: number;
};

export type VisEdge = Edge & {
  color?: { color?: string };
  smooth?: {
    enabled: boolean;
    type: string;
    roundness?: number;
    forceDirection?: string | boolean;
  };
  arrows?: {
    to?: { enabled?: boolean; type?: string };
  };
};

export interface ConceptNode extends VisNode {
  id: number;
  label: string;
  level: number;
  category: string;
  description: string;
  examples: string[];
  type?: 'concept' | 'topic' | 'subtopic' | 'example' | 'note' | 'resource' | 'question';
  group?: string;
  importance?: 'high' | 'medium' | 'low';
  status?: 'core' | 'optional' | 'advanced';
  tags?: string[];
  imageUrl?: string;
  url?: string;
}

export interface ConceptEdge extends VisEdge {
  id: number;
  from: number;
  to: number;
  label: string;
  type: string;
}

export interface ConceptMapData {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

export type ConceptMapLayout = 
  | 'hierarchical' // Traditional top-down hierarchy
  | 'radial' // Circular arrangement
  | 'force' // Force-directed graph
  | 'tree' // Left-to-right tree
  | 'mindmap' // Free-form mind map
  | 'cluster' // Grouped clusters
  | 'organic' // Natural, organic layout
  | 'spider' // Spider/web layout
  | 'flowchart' // Flowchart-style
  | 'timeline' // Timeline-based layout

export type ConceptMapTheme = 
  | 'default'
  | 'warm'
  | 'cool'
  | 'nature'
  | 'dark'
  | 'light'
  | 'colorful';

export interface ThemeColors {
  [key: string]: string | string[];
  nodes: string[];
  edges: string;
  text: string;
  background: string;
  centerNode: string;
  node: string;
  edge: string;
  concept: string;
  topic: string;
  subtopic: string;
  example: string;
  note: string;
  resource: string;
  question: string;
  high: string;
  medium: string;
  low: string;
  core: string;
  optional: string;
  advanced: string;
}

export interface ConceptMapProps {
  data: ConceptMapData;
  layout?: ConceptMapLayout;
  theme?: ConceptMapTheme;
  onNodeClick?: (nodeId: number) => void;
  onEdgeClick?: (edgeId: number) => void;
  interactive?: boolean;
  height?: string;
  width?: string;
  zoomable?: boolean;
  draggable?: boolean;
  showControls?: boolean;
  showLegend?: boolean;
  showMinimap?: boolean;
  autoLayout?: boolean;
  animations?: boolean;
  grouping?: boolean;
  filtering?: boolean;
  searchable?: boolean;
  exportable?: boolean;
}
