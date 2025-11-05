import { createTheme } from './themes';

// Screenshot-like light blue theme with orange connectors
const ScreenshotTheme = createTheme({
  textColor: { main: '#0F172A', highlighted: '#0B3A75', dark: '#1E293B' },
  matchBackground: { wonColor: '#E6F0FF', lostColor: '#F0F6FF' },
  score: {
    background: { wonColor: '#D4E6FF', lostColor: '#D4E6FF' },
    text: { highlightedWonColor: '#0B3A75', highlightedLostColor: '#0B3A75' },
  },
  border: { color: '#B7C5F3', highlightedColor: '#334155' },
  roundHeader: { backgroundColor: '#CFE3FF', fontColor: '#0F172A' },
  roundHeaders: { background: '#CFE3FF' },
  connectorColor: '#334155',
  connectorColorHighlight: '#1F2937',
  svgBackground: '#E6F0FF',
  // Transparent background for final placements rows
  // (used by FinalPlacements component via theme.finalPlacementsBackground)
  // @ts-ignore - extra theme key for styling only
  finalPlacementsBackground: 'transparent',
});

export default ScreenshotTheme;


