import { ConceptMapTheme } from './types';

interface ThemeColors {
  [key: string]: string | string[];
  nodes: string[];
  edges: string;
  text: string;
  background: string;
  centerNode: string;
  node: string;
  nodeBorder: string;
  nodeHighlight: string;
  edge: string;
  edgeHighlight: string;
  // Node type colors
  concept: string;
  topic: string;
  subtopic: string;
  example: string;
  note: string;
  resource: string;
  question: string;
  // Importance colors
  high: string;
  medium: string;
  low: string;
  // Status colors
  core: string;
  optional: string;
  advanced: string;
}

export const getThemeColors = (theme: ConceptMapTheme): ThemeColors => {
  const themes: Record<ConceptMapTheme, ThemeColors> = {
    default: {
      nodes: ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#607D8B'],
      edges: '#666666',
      text: '#333333',
      background: '#ffffff',
      centerNode: '#1976D2',
      node: '#4CAF50',
      nodeBorder: '#2E7D32',
      nodeHighlight: '#81C784',
      edge: '#666666',
      edgeHighlight: '#2196F3',
      // Node type colors
      concept: '#1976D2',
      topic: '#4CAF50',
      subtopic: '#7CB342',
      example: '#FFA000',
      note: '#9C27B0',
      resource: '#00ACC1',
      question: '#E64A19',
      // Importance colors
      high: '#F44336',
      medium: '#FB8C00',
      low: '#7CB342',
      // Status colors
      core: '#1976D2',
      optional: '#78909C',
      advanced: '#C62828',
    },

    warm: {
      nodes: ['#FF5722', '#FF9800', '#FFC107', '#FFEB3B', '#CDDC39'],
      edges: '#795548',
      text: '#3E2723',
      background: '#FFF3E0',
      centerNode: '#FF5722',
      node: '#FF9800',
      nodeBorder: '#E65100',
      nodeHighlight: '#FFB74D',
      edge: '#795548',
      edgeHighlight: '#FF5722',
      concept: '#FF5722',
      topic: '#FF9800',
      subtopic: '#FFA726',
      example: '#FFB300',
      note: '#FBC02D',
      resource: '#F57C00',
      question: '#D84315',
      high: '#D84315',
      medium: '#F57C00',
      low: '#FFB300',
      core: '#FF5722',
      optional: '#FF9800',
      advanced: '#BF360C',
    },
    cool: {
      nodes: ['#00BCD4', '#03A9F4', '#2196F3', '#3F51B5', '#673AB7'],
      edges: '#546E7A',
      text: '#263238',
      background: '#E3F2FD',
      centerNode: '#1976D2',
      node: '#03A9F4',
      nodeBorder: '#0277BD',
      nodeHighlight: '#4FC3F7',
      edge: '#546E7A',
      edgeHighlight: '#2196F3',
      concept: '#1976D2',
      topic: '#0288D1',
      subtopic: '#039BE5',
      example: '#00ACC1',
      note: '#0097A7',
      resource: '#00838F',
      question: '#006064',
      high: '#01579B',
      medium: '#0277BD',
      low: '#0288D1',
      core: '#01579B',
      optional: '#0288D1',
      advanced: '#01579B',
    },
    nature: {
      nodes: ['#4CAF50', '#8BC34A', '#CDDC39', '#009688', '#43A047'],
      edges: '#33691E',
      text: '#1B5E20',
      background: '#F1F8E9',
      centerNode: '#2E7D32',
      node: '#43A047',
      nodeBorder: '#1B5E20',
      nodeHighlight: '#81C784',
      edge: '#33691E',
      edgeHighlight: '#4CAF50',
      concept: '#2E7D32',
      topic: '#388E3C',
      subtopic: '#43A047',
      example: '#558B2F',
      note: '#689F38',
      resource: '#7CB342',
      question: '#33691E',
      high: '#2E7D32',
      medium: '#388E3C',
      low: '#43A047',
      core: '#1B5E20',
      optional: '#388E3C',
      advanced: '#1B5E20',
    },
    dark: {
      nodes: ['#7E57C2', '#5C6BC0', '#42A5F5', '#26C6DA', '#66BB6A'],
      edges: '#FFFFFF',
      text: '#FFFFFF',
      background: '#212121',
      centerNode: '#7E57C2',
      node: '#5C6BC0',
      nodeBorder: '#FFFFFF',
      nodeHighlight: '#9575CD',
      edge: '#FFFFFF',
      edgeHighlight: '#B39DDB',
      concept: '#7E57C2',
      topic: '#5C6BC0',
      subtopic: '#42A5F5',
      example: '#26C6DA',
      note: '#66BB6A',
      resource: '#26A69A',
      question: '#FF7043',
      high: '#E57373',
      medium: '#FFB74D',
      low: '#81C784',
      core: '#7E57C2',
      optional: '#5C6BC0',
      advanced: '#5E35B1',
    },
    light: {
      nodes: ['#90CAF9', '#80DEEA', '#80CBC4', '#A5D6A7', '#C5E1A5'],
      edges: '#455A64',
      text: '#37474F',
      background: '#FFFFFF',
      centerNode: '#64B5F6',
      node: '#81D4FA',
      nodeBorder: '#0288D1',
      nodeHighlight: '#B3E5FC',
      edge: '#455A64',
      edgeHighlight: '#90CAF9',
      concept: '#64B5F6',
      topic: '#81D4FA',
      subtopic: '#80DEEA',
      example: '#80CBC4',
      note: '#A5D6A7',
      resource: '#C5E1A5',
      question: '#FFE082',
      high: '#EF9A9A',
      medium: '#90CAF9',
      low: '#A5D6A7',
      core: '#64B5F6',
      optional: '#81D4FA',
      advanced: '#42A5F5',
    },
    colorful: {
      nodes: ['#E91E63', '#2196F3', '#4CAF50', '#FFC107', '#9C27B0'],
      edges: '#607D8B',
      text: '#212121',
      background: '#FAFAFA',
      centerNode: '#E91E63',
      node: '#2196F3',
      nodeBorder: '#1976D2',
      nodeHighlight: '#90CAF9',
      edge: '#607D8B',
      edgeHighlight: '#E91E63',
      concept: '#E91E63',
      topic: '#2196F3',
      subtopic: '#4CAF50',
      example: '#FFC107',
      note: '#9C27B0',
      resource: '#00BCD4',
      question: '#FF5722',
      high: '#F44336',
      medium: '#FFC107',
      low: '#4CAF50',
      core: '#E91E63',
      optional: '#2196F3',
      advanced: '#9C27B0',
    },
  };

  return themes[theme];
};
