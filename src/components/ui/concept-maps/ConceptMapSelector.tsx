import React, { useState } from 'react';
import { ConceptMapProps, ConceptMapLayout, ConceptMapTheme } from './types';
import HierarchicalMap from './HierarchicalMap';
import RadialMap from './RadialMap';
import ForceDirectedMap from './ForceDirectedMap';
import MindMap from './MindMap';
import SpiderMap from './SpiderMap';
import TimelineMap from './TimelineMap';
import TreeMap from './TreeMap';
import ClusterMap from './ClusterMap';
import OrganicMap from './OrganicMap';
import FlowchartMap from './FlowchartMap';
import Card from '../Card';
import { Select, Button, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface ConceptMapSelectorProps extends ConceptMapProps {
  defaultLayout?: ConceptMapLayout;
  defaultTheme?: ConceptMapTheme;
}

const ConceptMapSelector: React.FC<ConceptMapSelectorProps> = ({
  data,
  defaultLayout = 'hierarchical',
  defaultTheme = 'default',
  ...props
}) => {
  const [layout, setLayout] = useState<ConceptMapLayout>(defaultLayout);
  const [theme, setTheme] = useState<ConceptMapTheme>(defaultTheme);

  const layouts: { value: ConceptMapLayout; label: string; description: string }[] = [
    { 
      value: 'hierarchical',
      label: 'Hierarchical',
      description: 'Traditional top-down hierarchy showing relationships between concepts'
    },
    { 
      value: 'radial',
      label: 'Radial',
      description: 'Concepts arranged in a circular pattern around a central theme'
    },
    { 
      value: 'force',
      label: 'Force-Directed',
      description: 'Dynamic layout where concepts find their natural positions'
    },
    { 
      value: 'tree',
      label: 'Tree',
      description: 'Left-to-right tree structure showing concept hierarchies'
    },
    { 
      value: 'mindmap',
      label: 'Mind Map',
      description: 'Free-form mind map for brainstorming and idea organization'
    },
    { 
      value: 'cluster',
      label: 'Cluster',
      description: 'Groups related concepts into visual clusters'
    },
    { 
      value: 'organic',
      label: 'Organic',
      description: 'Natural, flowing layout that emphasizes concept relationships'
    },
    { 
      value: 'spider',
      label: 'Spider',
      description: 'Web-like structure radiating from a central concept'
    },
    { 
      value: 'flowchart',
      label: 'Flowchart',
      description: 'Process-oriented layout showing concept flow and dependencies'
    },
    { 
      value: 'timeline',
      label: 'Timeline',
      description: 'Chronological or sequential arrangement of concepts'
    },
  ];

  const themes: { value: ConceptMapTheme; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'warm', label: 'Warm' },
    { value: 'cool', label: 'Cool' },
    { value: 'nature', label: 'Nature' },
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'colorful', label: 'Colorful' },
  ];

  const renderMap = () => {
    switch (layout) {
      case 'hierarchical':
        return <HierarchicalMap data={data} theme={theme} {...props} />;
      case 'radial':
        return <RadialMap data={data} theme={theme} {...props} />;
      case 'force':
        return <ForceDirectedMap data={data} theme={theme} {...props} />;
      case 'tree':
        return <TreeMap data={data} theme={theme} {...props} />;
      case 'mindmap':
        return <MindMap data={data} theme={theme} {...props} />;
      case 'cluster':
        return <ClusterMap data={data} theme={theme} {...props} />;
      case 'organic':
        return <OrganicMap data={data} theme={theme} {...props} />;
      case 'spider':
        return <SpiderMap data={data} theme={theme} {...props} />;
      case 'flowchart':
        return <FlowchartMap data={data} theme={theme} {...props} />;
      case 'timeline':
        return <TimelineMap data={data} theme={theme} {...props} />;
      default:
        return <HierarchicalMap data={data} theme={theme} {...props} />;
    }
  };

  return (
    <Card>
      <div style={{ padding: '1rem' }}>
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Select
              value={layout}
              onChange={(e) => setLayout(e.target.value as ConceptMapLayout)}
              size="small"
              style={{ minWidth: '150px' }}
              variant="outlined"
            >
              {layouts.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
            <Tooltip title={layouts.find(l => l.value === layout)?.description || ''}>
              <InfoIcon sx={{ ml: 1, color: 'action.active', cursor: 'help' }} />
            </Tooltip>
          </div>
          
          <Select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ConceptMapTheme)}
            size="small"
            style={{ minWidth: '120px' }}
            variant="outlined"
          >
            {themes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
                {t.description && (
                  <span style={{ color: 'gray', fontSize: '0.9em' }}>
                    {' - '}{t.description}
                  </span>
                )}
              </option>
            ))}
          </Select>

          <Button
            variant="outlined"
            size="small"
            startIcon={<InfoIcon />}
            onClick={() => {
              // Add export functionality later
              console.log('Export clicked');
            }}
          >
            Export
          </Button>
        </div>
        {renderMap()}
      </div>
    </Card>
  );
};

export default ConceptMapSelector;
