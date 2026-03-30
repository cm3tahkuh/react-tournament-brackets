import React from 'react';
import styled from 'styled-components';
import { Options } from '../types';
import { getLocaleStrings } from '../i18n/locales';

export interface RoundHeaderProps {
  x: number;
  y?: number;
  width: number;
  roundHeader: Options['roundHeader'];
  canvasPadding: number;
  numOfRounds: number;
  tournamentRoundText: string;
  columnIndex: number;
  locale?: string;
}

const Text = styled.text`
  font-family: ${({ theme }) => theme.fontFamily};
`;
const Rect = styled.rect``;

export default function RoundHeader({
  x,
  y = 0,
  width,
  roundHeader,
  canvasPadding,
  numOfRounds,
  tournamentRoundText,
  columnIndex,
  locale,
}: RoundHeaderProps) {
  return (
    <g>
      <Rect
        x={x}
        y={y + canvasPadding}
        width={width}
        height={roundHeader.height}
        rx="3"
        ry="3"
        fill={roundHeader.backgroundColor}
      />
      <Text
        x={x + width / 2}
        y={y + canvasPadding + roundHeader.height / 2}
        style={{
          fontFamily: roundHeader.fontFamily,
          fontSize: `${roundHeader.fontSize}px`,
          fill: roundHeader.fontColor,
        }}
        dominantBaseline="middle"
        textAnchor="middle"
      >
        {roundHeader.roundTextGenerator
          ? roundHeader.roundTextGenerator(columnIndex + 1, numOfRounds)
          : (() => {
              const t = getLocaleStrings(locale).roundNames;
              // canonical English → locale mapping
              const map: Record<string, string> = {
                Final: t.final,
                'Grand Final': t.grandFinal,
                Semifinal: t.semifinal,
                Semifinals: t.semifinal,
                Quarterfinal: t.quarterfinal,
                Quarterfinals: t.quarterfinal,
                '3rd Place': t.thirdPlace,
                'Third Place': t.thirdPlace,
                'Round of 16': t.roundOf16,
                'Round of 8': t.roundOf8,
                'Round of 32': t.roundOf32,
              };
              const raw = tournamentRoundText || '';
              if (map[raw]) return map[raw];
              // Positional fallback: last column = Final, second-to-last = Semifinal
              if (columnIndex + 1 === numOfRounds) return t.final;
              if (columnIndex + 1 === numOfRounds - 1) return t.semifinal;
              // Handle "Round N" pattern
              const roundMatch = raw.match(/^(?:Round|Раунд)\s+(\d+)$/i);
              if (roundMatch) return `${t.round} ${roundMatch[1]}`;
              // Pure number fallback → "Round N"
              const numericMatch = raw.match(/^(\d+)$/);
              if (numericMatch) return `${t.round} ${numericMatch[1]}`;
              return raw || t.round;
            })()}
      </Text>
    </g>
  );
}
