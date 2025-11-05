import React from 'react';
import styled, { css } from 'styled-components';
import useWindowSize from 'Hooks/use-window-size';
import BracketLeaderboard from './bracket-single/single-elim-bracket';
import SvgViewer from './svg-viewer';
import { simpleSmallBracket } from './mock-data/simple-data';

export default {
  title: 'Components/Custom',
  component: BracketLeaderboard,
};

export function CustomMatchBracket() {
  const [width, height] = useWindowSize();
  const finalWidth = Math.max(width - 50, 500);
  const finalHeight = Math.max(height - 100, 500);
  return (
    <BracketLeaderboard
      matches={simpleSmallBracket}
      options={{
        style: {
          roundHeader: { backgroundColor: '#AAA' },
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
      matchComponent={({
        match,
        onMatchClick,
        onPartyClick,
        onMouseEnter,
        onMouseLeave,
        topParty,
        bottomParty,
        topWon,
        bottomWon,
        topHovered,
        bottomHovered,
        topText,
        bottomText,
        connectorColor,
        teamNameFallback,
        resultFallback,
      }) => (
        <Card role="button" aria-label={topText}
          onClick={evt => onMatchClick?.({ match, topWon, bottomWon, event: evt })}
        >
          {topText ? <Header>{topText}</Header> : <Spacer />}
          <Row
            hovered={topHovered}
            won={topWon}
            onMouseEnter={() => onMouseEnter(topParty.id)}
            onMouseLeave={onMouseLeave}
            onClick={() => onPartyClick?.(topParty, topWon)}
          >
            <Name won={topWon}>{topParty?.name || teamNameFallback}</Name>
            <ScorePill won={topWon}>
              {topParty?.resultText ?? resultFallback(topParty)}
            </ScorePill>
          </Row>
          <Divider style={{ borderColor: connectorColor }} />
          <Row
            hovered={bottomHovered}
            won={bottomWon}
            onMouseEnter={() => onMouseEnter(bottomParty.id)}
            onMouseLeave={onMouseLeave}
            onClick={() => onPartyClick?.(bottomParty, bottomWon)}
          >
            <Name won={bottomWon}>{bottomParty?.name || teamNameFallback}</Name>
            <ScorePill won={bottomWon}>
              {bottomParty?.resultText ?? resultFallback(bottomParty)}
            </ScorePill>
          </Row>
          {bottomText ? <Footer>{bottomText}</Footer> : <Spacer />}
        </Card>
      )}
    />
  );
}

// styled-components for the custom match card
const Card = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  background: #ffffff;
  border: 1px solid #e6e6ea;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #4a4a4a;
  background: #f6f7fb;
  border-bottom: 1px solid #ececf1;
`;

const Footer = styled.div`
  padding: 6px 10px;
  font-size: 11px;
  color: #6a6a6a;
  background: #fafbff;
  border-top: 1px solid #ececf1;
  text-align: center;
`;

const Spacer = styled.div`
  height: 6px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 10px 10px 12px;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  ${props =>
    props.hovered &&
    css`
      background: #fff8ef;
    `}
`;

const Name = styled.div`
  flex: 1;
  min-width: 0;
  color: ${props => (props.won ? '#0f7b6c' : '#2b2b2b')};
  font-weight: ${props => (props.won ? 700 : 500)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ScorePill = styled.div`
  margin-left: 10px;
  min-width: 36px;
  text-align: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-weight: 700;
  color: ${props => (props.won ? '#0f7b6c' : '#4a4a4a')};
  background: ${props => (props.won ? 'rgba(15, 123, 108, 0.12)' : '#f0f1f6')};
`;

const Divider = styled.div`
  border-top: 2px solid #ff8c00;
`;
