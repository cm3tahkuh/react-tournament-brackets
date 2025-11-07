import React from 'react';
import useWindowSize from 'Hooks/use-window-size';
import SingleEliminationBracket from './bracket-single/single-elim-bracket';
import SvgViewer from './svg-viewer';
import { simpleSingleWithThird } from './mock-data/simple-single-with-third';
import { simpleEightWithThird } from './mock-data/simple-eight-with-third';
import { simpleSixteenWithThird } from './mock-data/simple-sixteen-with-third';
import DefaultMatch from './components/match';

export default {
  title: 'Components/Third Place & Winners',
  component: SingleEliminationBracket,
};

export function SingleElimWithThirdPlaceAndWinners() {
  const [width, height] = useWindowSize();
  const finalWidth = Math.max(width - 50, 500);
  const finalHeight = Math.max(height - 100, 500);
  return (
    <SingleEliminationBracket
      matches={simpleSingleWithThird}
      showThirdPlace
      showWinnersColumn
      matchComponent={DefaultMatch}
      options={{
        style: {
          roundHeader: { backgroundColor: '#EEE' },
          connectorColor: '#8A2BE2',
          connectorColorHighlight: '#000',
        },
      }}
      svgWrapper={({ children, ...props }) => (
        <SvgViewer
          background="#FFF"
          SVGBackground="#FFF"
          width={finalWidth}
          height={finalHeight}
          {...props}
        >
          {children}
        </SvgViewer>
      )}
    />
  );
}

export function SingleElim8TeamsWithThirdAndWinners() {
  const [width, height] = useWindowSize();
  const finalWidth = Math.max(width - 50, 700);
  const finalHeight = Math.max(height - 100, 600);
  return (
    <SingleEliminationBracket
      matches={simpleEightWithThird}
      showThirdPlace
      showWinnersColumn
      matchComponent={DefaultMatch}
      options={{
        style: {
          roundHeader: { backgroundColor: '#F2F6FF' },
          connectorColor: '#FF8C00',
          connectorColorHighlight: '#000',
        },
      }}
      svgWrapper={({ children, ...props }) => (
        <SvgViewer
          background="#FFF"
          SVGBackground="#FFF"
          width={finalWidth}
          height={finalHeight}
          {...props}
        >
          {children}
        </SvgViewer>
      )}
    />
  );
}

export function SingleElim16TeamsWithThirdAndWinners() {
  const [width, height] = useWindowSize();
  const finalWidth = Math.max(width - 50, 900);
  const finalHeight = Math.max(height - 100, 700);
  return (
    <SingleEliminationBracket
      matches={simpleSixteenWithThird}
      showThirdPlace
      showWinnersColumn
      matchComponent={DefaultMatch}
      options={{
        style: {
          roundHeader: { backgroundColor: '#FFF7E6' },
          connectorColor: '#2E86DE',
          connectorColorHighlight: '#000',
        },
      }}
      svgWrapper={({ children, ...props }) => (
        <SvgViewer
          background="#FFF"
          SVGBackground="#FFF"
          width={finalWidth}
          height={finalHeight}
          {...props}
        >
          {children}
        </SvgViewer>
      )}
    />
  );
}


