import { createTheme } from './themes';

// Pure white, neutral theme
const WhiteTheme = createTheme({
  textColor: { main: '#111111', highlighted: '#000000', dark: '#111111' },
  matchBackground: { wonColor: '#FFFFFF', lostColor: '#FFFFFF' },
  score: {
    background: { wonColor: '#F5F7FA', lostColor: '#F5F7FA' },
    text: { highlightedWonColor: '#111111', highlightedLostColor: '#111111' },
  },
  border: { color: '#E5E7EB', highlightedColor: '#94A3B8' },
  roundHeader: { backgroundColor: '#000000', fontColor: '#FFFFFF' },
  connectorColor: '#E5E7EB',
  connectorColorHighlight: '#94A3B8',
  svgBackground: '#FFFFFF',
});

export default WhiteTheme;
