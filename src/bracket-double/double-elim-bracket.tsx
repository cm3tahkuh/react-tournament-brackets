import React from 'react';
import { ThemeProvider } from 'styled-components';
import { generatePreviousRound } from 'Core/match-functions';
import { calculateSVGDimensions } from 'Core/calculate-svg-dimensions';
import { MatchContextProvider } from 'Core/match-context';

import { DoubleElimLeaderboardProps, Match } from '../types';
import { defaultStyle, getCalculatedStyles } from '../settings';

import defaultTheme from '../themes/themes';
import { getLocaleStrings } from '../i18n/locales';

import UpperBracket from './upper-bracket';
import LowerBracket from './lower-bracket';
import RoundHeaders from './round-headers';
import FinalGame from './final-game';
import ExtraFinal from './extra-final';

function findTheFinals(matches: { upper: Match[]; lower: Match[] }): {
  convergingMatch: Match;
  finalsArray: Match[];
} {
  const isFinalInUpper = matches.upper.some(match => !match.nextMatchId);
  const isFinalInLower = matches.lower.some(match => !match.nextMatchId);
  let convergingMatch;
  let finalsArray;

  if (isFinalInLower) {
    const lastUpper = matches.upper.find(match => {
      const hasNextMatchInUpper = matches.upper.some(
        m => m.id === match.nextMatchId
      );
      return !hasNextMatchInUpper;
    });
    convergingMatch = matches.lower.find(
      match => match.id === lastUpper.nextMatchId
    );
    finalsArray = [
      convergingMatch,
      matches.lower.find(m => m.id === convergingMatch.nextMatchId),
    ].filter(m => m?.id);
  }
  if (isFinalInUpper) {
    const lastLower = matches.lower.find(match => {
      const hasNextMatchInLower = matches.lower.some(
        m => m.id === match.nextMatchId
      );
      return !hasNextMatchInLower;
    });
    convergingMatch = matches.upper.find(
      match => match.id === lastLower.nextMatchId
    );
    finalsArray = [
      convergingMatch,
      matches.upper.find(m => m.id === convergingMatch.nextMatchId),
    ].filter(m => m?.id);
  }

  return { convergingMatch, finalsArray };
}
const DoubleEliminationBracket = ({
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
}: DoubleElimLeaderboardProps) => {
  // Priority: options.style (highest) → theme → defaultStyle (lowest)
  const style = {
    ...defaultStyle,
    ...(theme.connectorColor != null && { connectorColor: theme.connectorColor }),
    ...(theme.connectorColorHighlight != null && { connectorColorHighlight: theme.connectorColorHighlight }),
    ...inputStyle,
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

  const locale = (inputStyle as any)?.locale ?? theme.locale ?? 'en';
  const t = getLocaleStrings(locale);

  // Translate double-elim match names (bottomText)
  const translateMatchName = (name?: string): string => {
    if (!name) return '';
    const r = t.roundNames;
    const directMap: Record<string, string> = {
      'Grand Final': r.grandFinal,
      'Final': r.final,
      'UB Final': r.ubFinal,
      'LB Final': r.lbFinal,
      'UB Semi Final': r.ubSemiFinal,
      'LB Semi Final': r.lbSemiFinal,
      [r.grandFinal]: r.grandFinal,
      [r.ubFinal]: r.ubFinal,
      [r.lbFinal]: r.lbFinal,
      [r.ubSemiFinal]: r.ubSemiFinal,
      [r.lbSemiFinal]: r.lbSemiFinal,
    };
    if (directMap[name]) return directMap[name];
    // "UB 2.1" → "ВС 2.1", "LB 3.1" → "НС 3.1"
    const ubMatch = name.match(/^UB\s+(.+)$/i);
    if (ubMatch) return `${r.ubRound} ${ubMatch[1]}`;
    const lbMatch = name.match(/^LB\s+(.+)$/i);
    if (lbMatch) return `${r.lbRound} ${lbMatch[1]}`;
    return name;
  };

  style.locale = locale;

  const calculatedStyles = getCalculatedStyles(style);

  const { roundHeader, columnWidth, canvasPadding, rowHeight } =
    calculatedStyles;
  const { convergingMatch, finalsArray } = findTheFinals(matches);

  const hasMultipleFinals = finalsArray?.length > 1;

  const generateColumn = (
    matchesColumn: Match[],
    listOfMatches: Match[]
  ): Match[][] => {
    const previousMatchesColumn = generatePreviousRound(
      matchesColumn,
      listOfMatches
    );

    if (previousMatchesColumn.length > 0) {
      return [
        ...generateColumn(previousMatchesColumn, listOfMatches),
        previousMatchesColumn,
      ];
    }
    return [previousMatchesColumn];
  };
  const generate2DBracketArray = (final: Match, listOfMatches: Match[]) => {
    return final
      ? [...generateColumn([final], listOfMatches), []].filter(
          arr => arr.length > 0
        )
      : [];
  };

  const upperColumns = generate2DBracketArray(convergingMatch, matches.upper);
  const lowerColumns = generate2DBracketArray(convergingMatch, matches.lower);
  // [
  //   [ First column ]
  //   [ 2nd column ]
  //   [ 3rd column ]
  //   [ lastGame ]
  // ]

  const totalNumOfRounds =
    lowerColumns.length + 1 + (hasMultipleFinals && finalsArray.length - 1);
  const upperBracketDimensions = calculateSVGDimensions(
    upperColumns[0].length,
    upperColumns.length,
    rowHeight,
    columnWidth,
    canvasPadding,
    roundHeader,
    currentRound
  );
  const lowerBracketDimensions = calculateSVGDimensions(
    lowerColumns[0].length,
    lowerColumns.length,
    rowHeight,
    columnWidth,
    canvasPadding,
    roundHeader,
    currentRound
  );
  const fullBracketDimensions = calculateSVGDimensions(
    lowerColumns[0].length,
    totalNumOfRounds,
    rowHeight,
    columnWidth,
    canvasPadding,
    roundHeader,
    currentRound
  );

  const { gameWidth } = fullBracketDimensions;
  const gameHeight =
    upperBracketDimensions.gameHeight + lowerBracketDimensions.gameHeight;
  const { startPosition } = upperBracketDimensions;

  return (
    <ThemeProvider theme={theme}>
      <SvgWrapper
        bracketWidth={gameWidth}
        bracketHeight={gameHeight}
        startAt={startPosition}
      >
        <svg
          viewBox={`0 0 ${gameWidth} ${gameHeight}`}
          width={gameWidth}
          height={gameHeight}
        >
          <MatchContextProvider>
            <g>
              <RoundHeaders
                {...{
                  numOfRounds: totalNumOfRounds,
                  calculatedStyles,
                  locale,
                }}
              />
              <UpperBracket
                {...{
                  columns: upperColumns,
                  calculatedStyles,

                  gameHeight,
                  gameWidth,
                  onMatchClick,
                  onPartyClick,
                  matchComponent,
                  translateMatchName,
                }}
              />
              <LowerBracket
                {...{
                  columns: lowerColumns,
                  calculatedStyles,
                  gameHeight,
                  gameWidth,
                  onMatchClick,
                  onPartyClick,
                  matchComponent,
                  upperBracketHeight: upperBracketDimensions.gameHeight,
                  translateMatchName,
                }}
              />
              <FinalGame
                {...{
                  match: convergingMatch,
                  numOfUpperRounds: upperColumns.length,
                  numOfLowerRounds: lowerColumns.length,
                  bracketSnippet: {
                    previousTopMatch: upperColumns[upperColumns.length - 1][0],
                    previousBottomMatch:
                      lowerColumns[lowerColumns.length - 1][0],
                    currentMatch: convergingMatch,
                  },
                  upperBracketHeight: upperBracketDimensions.gameHeight,
                  lowerBracketHeight: lowerBracketDimensions.gameHeight,
                  calculatedStyles,
                  columnIndex: lowerColumns.length,
                  rowIndex: 0,
                  gameHeight,
                  gameWidth,
                  matchComponent,
                  onMatchClick,
                  onPartyClick,
                  translateMatchName,
                }}
              />
              {finalsArray?.length > 1 && (
                <ExtraFinal
                  {...{
                    match: finalsArray[1],
                    numOfUpperRounds: upperColumns.length,
                    numOfLowerRounds: lowerColumns.length,
                    bracketSnippet: {
                      previousBottomMatch: finalsArray[0],
                      currentMatch: finalsArray[1],
                    },
                    upperBracketHeight: upperBracketDimensions.gameHeight,
                    lowerBracketHeight: lowerBracketDimensions.gameHeight,
                    calculatedStyles,
                    columnIndex: lowerColumns.length + 1,
                    rowIndex: 0,
                    gameHeight,
                    gameWidth,
                    matchComponent,
                    onMatchClick,
                    onPartyClick,
                    translateMatchName,
                  }}
                />
              )}
            </g>
          </MatchContextProvider>
        </svg>
      </SvgWrapper>
    </ThemeProvider>
  );
};

export default DoubleEliminationBracket;
