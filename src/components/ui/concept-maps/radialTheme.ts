export interface RadialThemeColors {
  background: string;
  centralNode: {
    fill: string;
    stroke: string;
    text: string;
  };
  branches: {
    whatIsTested: string;
    importantConcepts: string;
    mainGoals: string;
    keyTakeaways: string;
    connection: string;
    text: string;
  };
}

export const defaultRadialTheme: RadialThemeColors = {
  background: '#FFFFFF',
  centralNode: {
    fill: '#E6F3FF',
    stroke: '#A0C4FF',
    text: '#000000',
  },
  branches: {
    whatIsTested: '#FFF8DC',
    importantConcepts: '#FFE4E1',
    mainGoals: '#E0FFF0',
    keyTakeaways: '#FFF8DC',
    connection: '#999999',
    text: '#000000',
  },
};

export const getRadialThemeColors = (theme: string = 'default'): RadialThemeColors => {
  // Add more themes here if needed
  return defaultRadialTheme;
};
