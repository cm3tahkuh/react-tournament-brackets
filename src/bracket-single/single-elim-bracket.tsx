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
import { getLocaleStrings } from '../i18n/locales';

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
    style: {},
  },
  showThirdPlace = false,
  showWinnersColumn = false,
}: SingleElimLeaderboardProps) => {
  // Priority: options.style (highest) → theme → defaultStyle (lowest)
  const locale = (inputStyle as any)?.locale ?? theme.locale ?? 'en';
  const t = getLocaleStrings(locale);

  // Translate a match name (match.name is used as bottomText under each card).
  // Handles both English canonical names and already-translated names.
  const translateMatchName = (name?: string): string => {
    if (!name) return '';
    const r = t.roundNames;
    const directMap: Record<string, string> = {
      'Grand Final': r.grandFinal,
      'Final': r.final,
      'Semifinal': r.semifinal,
      'Semifinals': r.semifinal,
      'Quarterfinal': r.quarterfinal,
      'Quarterfinals': r.quarterfinal,
      '3rd Place': r.thirdPlace,
      'Third Place': r.thirdPlace,
      // idempotent: locale’s own names map to themselves
      [r.grandFinal]: r.grandFinal,
      [r.final]: r.final,
      [r.semifinal]: r.semifinal,
      [r.quarterfinal]: r.quarterfinal,
      [r.thirdPlace]: r.thirdPlace,
    };
    if (directMap[name]) return directMap[name];
    // 2. "Round N M" → "${round} N M"  e.g. "Round 1 1" → "Раунд 1 1"
    const roundNM = name.match(/^(?:Round|Раунд)\s+(\d+)\s+(\d+)$/i);
    if (roundNM) return `${r.round} ${roundNM[1]} ${roundNM[2]}`;
    // 3. "Round N" → "${round} N"  e.g. "Round 3" → "Раунд 3"
    const roundN = name.match(/^(?:Round|Раунд)\s+(\d+)$/i);
    if (roundN) return `${r.round} ${roundN[1]}`;
    // 4. "SomeName N" → translate base, keep number
    const compound = name.match(/^(.+?)\s+(\d+)$/);
    if (compound && directMap[compound[1]]) return `${directMap[compound[1]]} ${compound[2]}`;
    return name;
  };
  const style = {
    ...defaultStyle,
    ...(theme.connectorColor != null && { connectorColor: theme.connectorColor }),
    ...(theme.connectorColorHighlight != null && { connectorColorHighlight: theme.connectorColorHighlight }),
    // Set locale-aware walk-over/no-show text unless caller has explicitly overridden
    wonBywalkOverText: inputStyle?.wonBywalkOverText ?? t.match.walkOver,
    lostByNoShowText: inputStyle?.lostByNoShowText ?? t.match.noShow,
    ...inputStyle,
    locale,
    roundHeader: {
      ...defaultStyle.roundHeader,
      ...(theme.roundHeader?.backgroundColor != null && { backgroundColor: theme.roundHeader.backgroundColor }),
      ...(theme.roundHeader?.fontColor != null && { fontColor: theme.roundHeader.fontColor }),
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
          viewBox={`0 0 ${gameWidth} ${gameHeight + extraHeight}`}
          width={gameWidth}
          height={gameHeight + extraHeight}
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
                          locale={locale}
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
                          bottomText={translateMatchName(match.name)}
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
                        bottomText={translateMatchName(thirdPlaceMatch.name)}
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
                  const first = finalParticipants.find(p => p.isWinner) || finalParticipants[0] || { name: '' };
                  const second = finalParticipants.find(p => !p.isWinner) || finalParticipants[1] || { name: '' };
                  const third = thirdPlaceMatch?.participants?.find(p => p.isWinner) || { name: '' };
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
                          roundTextGenerator: () => t.roundNames.winners,
                          }}
                          canvasPadding={canvasPadding}
                          width={width}
                          numOfRounds={columns.length + 1}
                          tournamentRoundText={t.roundNames.winners}
                          columnIndex={winnersColumnIndex}
                          locale={locale}
                        />
                      )}
                      <foreignObject x={x} y={yStart} width={columnWidth} height={totalHeight}>
                        <FinalPlacements
                          placements={[
                            { label: t.placements.first, name: first.name ?? '' },
                            { label: t.placements.second, name: second.name ?? '' },
                            { label: t.placements.third, name: third.name ?? '' },
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
