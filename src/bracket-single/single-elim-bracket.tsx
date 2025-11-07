import React from 'react';
import { ThemeProvider } from 'styled-components';
import { sortAlphanumerically } from 'Utils/string';
import { calculateSVGDimensions } from 'Core/calculate-svg-dimensions';
import { MatchContextProvider } from 'Core/match-context';
import MatchWrapper from 'Core/match-wrapper';
import RoundHeader from 'Components/round-header';
import { getPreviousMatches } from 'Core/match-functions';
import { Match, SingleElimLeaderboardProps } from '../types';
import { defaultStyle, getCalculatedStyles } from '../settings';
import { calculatePositionOfMatch } from './calculate-match-position';

import Connectors from './connectors';
import defaultTheme from '../themes/themes';
import FinalPlacements from 'Components/final-placements';

const SingleEliminationBracket = ({
  matches,
  matchComponent,
  currentRound,
  onMatchClick,
  onPartyClick,
  svgWrapper: SvgWrapper = ({ children }) => <div>{children}</div>,
  theme = defaultTheme,
  options: { style: inputStyle } = {
    style: defaultStyle,
  },
  showThirdPlace = false,
  showWinnersColumn = false,
}: SingleElimLeaderboardProps) => {
  const style = {
    ...defaultStyle,
    ...inputStyle,
    roundHeader: {
      ...defaultStyle.roundHeader,
      ...(inputStyle?.roundHeader ?? {}),
    },
    lineInfo: {
      ...defaultStyle.lineInfo,
      ...(inputStyle?.lineInfo ?? {}),
    },
  };

  const { roundHeader, columnWidth, canvasPadding, rowHeight, width } =
    getCalculatedStyles(style);

  // Prefer a final by round text if available; fallback to any match without nextMatchId
  const lastGame =
    matches.find(
      match =>
        !match.nextMatchId &&
        /final/i.test(match.tournamentRoundText ?? '')
    ) || matches.find(match => !match.nextMatchId);

  const thirdPlaceMatch = matches.find(
    m =>
      (m as any).isThirdPlace === true ||
      /third|3(rd)?\s*place/i.test(m.tournamentRoundText ?? '')
  );

  const generateColumn = (matchesColumn: Match[]): Match[][] => {
    const previousMatchesColumn = matchesColumn.reduce<Match[]>(
      (result, match) => {
        return [
          ...result,
          ...matches
            .filter(m => m.nextMatchId === match.id)
            .sort((a, b) => sortAlphanumerically(a.name, b.name)),
        ];
      },
      []
    );

    if (previousMatchesColumn.length > 0) {
      return [...generateColumn(previousMatchesColumn), previousMatchesColumn];
    }
    return [previousMatchesColumn];
  };
  const generate2DBracketArray = (final: Match) => {
    return final
      ? [...generateColumn([final]), [final]].filter(arr => arr.length > 0)
      : [];
  };
  const columns = generate2DBracketArray(lastGame);
  // [
  //   [ First column ]
  //   [ 2nd column ]
  //   [ 3rd column ]
  //   [ lastGame ]
  // ]

  const { gameWidth, gameHeight, startPosition } = calculateSVGDimensions(
    columns[0].length,
    columns.length + (showWinnersColumn ? 1 : 0),
    rowHeight,
    columnWidth,
    canvasPadding,
    roundHeader,
    currentRound
  );

  const extraHeight = showThirdPlace && thirdPlaceMatch ? rowHeight : 0;
  const finalColumnIndex = Math.max(columns.length - 1, 0);

  return (
    <ThemeProvider theme={theme}>
      <SvgWrapper
        bracketWidth={gameWidth}
        bracketHeight={gameHeight}
        startAt={startPosition}
      >
        <svg
          height={gameHeight + extraHeight}
          width={gameWidth}
          viewBox={`0 0 ${gameWidth} ${gameHeight + extraHeight}`}
        >
          <MatchContextProvider>
            <g>
              {columns.map((matchesColumn, columnIndex) =>
                matchesColumn.map((match, rowIndex) => {
                  const { x, y } = calculatePositionOfMatch(
                    rowIndex,
                    columnIndex,
                    {
                      canvasPadding,
                      columnWidth,
                      rowHeight,
                    }
                  );
                  const previousBottomPosition = (rowIndex + 1) * 2 - 1;

                  const { previousTopMatch, previousBottomMatch } =
                    getPreviousMatches(
                      columnIndex,
                      columns,
                      previousBottomPosition
                    );
                  return (
                    <g key={x + y}>
                      {roundHeader.isShown && (
                        <RoundHeader
                          x={x}
                          roundHeader={roundHeader}
                          canvasPadding={canvasPadding}
                          width={width}
                          numOfRounds={columns.length}
                          tournamentRoundText={match.tournamentRoundText}
                          columnIndex={columnIndex}
                        />
                      )}
                      {columnIndex !== 0 && (
                        <Connectors
                          {...{
                            bracketSnippet: {
                              currentMatch: match,
                              previousTopMatch,
                              previousBottomMatch,
                            },
                            rowIndex,
                            columnIndex,
                            gameHeight,
                            gameWidth,
                            style,
                          }}
                        />
                      )}
                      <g>
                        <MatchWrapper
                          x={x}
                          y={
                            y +
                            (roundHeader.isShown
                              ? roundHeader.height + roundHeader.marginBottom
                              : 0)
                          }
                          rowIndex={rowIndex}
                          columnIndex={columnIndex}
                          match={match}
                          previousBottomMatch={previousBottomMatch}
                          topText={match.startTime}
                          bottomText={match.name}
                          teams={match.participants}
                          onMatchClick={onMatchClick}
                          onPartyClick={onPartyClick}
                          style={style}
                          matchComponent={matchComponent}
                        />
                      </g>
                    </g>
                  );
                })
              )}
              {/* Third place match under the final column */}
              {showThirdPlace && thirdPlaceMatch && lastGame && (
                (() => {
                  const { x, y } = calculatePositionOfMatch(
                    0,
                    finalColumnIndex,
                    {
                      canvasPadding,
                      columnWidth,
                      rowHeight,
                    }
                  );
                  const yOffset =
                    y +
                    (roundHeader.isShown
                      ? roundHeader.height + roundHeader.marginBottom
                      : 0) +
                    rowHeight; // place one row below final
                  return (
                    <g key={`third-place-${thirdPlaceMatch.id}`}>
                      <MatchWrapper
                        x={x}
                        y={yOffset}
                        rowIndex={1}
                        columnIndex={finalColumnIndex}
                        match={thirdPlaceMatch}
                        previousBottomMatch={null}
                        topText={thirdPlaceMatch.startTime}
                        bottomText={thirdPlaceMatch.name}
                        teams={thirdPlaceMatch.participants}
                        onMatchClick={onMatchClick}
                        onPartyClick={onPartyClick}
                        style={style}
                        matchComponent={matchComponent}
                      />
                    </g>
                  );
                })()
              )}
              {/* Winners summary column */}
              {showWinnersColumn && lastGame && (
                (() => {
                  const winnersColumnIndex = columns.length; // render to the right
                  const { x } = calculatePositionOfMatch(0, winnersColumnIndex, {
                    canvasPadding,
                    columnWidth,
                    rowHeight,
                  });
                  // Compute placements
                  const finalParticipants = lastGame.participants || [];
                  const first = finalParticipants.find(p => p.isWinner) || finalParticipants[0] || { name: 'TBD' };
                  const second = finalParticipants.find(p => !p.isWinner) || finalParticipants[1] || { name: 'TBD' };
                  const third = thirdPlaceMatch?.participants?.find(p => p.isWinner) || { name: 'TBD' };
                  // Header for winners column like other rounds
                  const headerOffset = roundHeader.isShown
                    ? roundHeader.height + roundHeader.marginBottom
                    : 0;
                  const gap = style.spaceBetweenRows || 0;
                  const itemHeight = rowHeight - gap; // actual box height like matches
                  const totalHeight = 3 * itemHeight + 2 * gap;
                  const available = gameHeight + extraHeight - headerOffset;
                  const yStart = Math.max(headerOffset, headerOffset + (available - totalHeight) / 2);

                  return (
                    <g key="winners-column">
                      {roundHeader.isShown && (
                        <RoundHeader
                          x={x}
                          roundHeader={{
                            ...roundHeader,
                          roundTextGenerator: () => 'Победители',
                          }}
                          canvasPadding={canvasPadding}
                          width={width}
                          numOfRounds={columns.length + 1}
                          tournamentRoundText={'Winners'}
                          columnIndex={winnersColumnIndex}
                        />
                      )}
                      <foreignObject x={x} y={yStart} width={columnWidth} height={totalHeight}>
                        <FinalPlacements
                          placements={[
                            { label: '1 место', name: first.name ?? 'TBD' },
                            { label: '2 место', name: second.name ?? 'TBD' },
                            { label: '3 место', name: third.name ?? 'TBD' },
                          ]}
                          width={columnWidth}
                          itemHeight={itemHeight}
                          gap={gap}
                        />
                      </foreignObject>
                    </g>
                  );
                })()
              )}
            </g>
          </MatchContextProvider>
        </svg>
      </SvgWrapper>
    </ThemeProvider>
  );
};

export default SingleEliminationBracket;
