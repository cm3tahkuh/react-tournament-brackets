import React from 'react';
import styled from 'styled-components';
import { Options } from '../types';

export interface RoundHeaderProps {
  x: number;
  y?: number;
  width: number;
  roundHeader: Options['roundHeader'];
  canvasPadding: number;
  numOfRounds: number;
  tournamentRoundText: string;
  columnIndex: number;
}

const Text = styled.text`
  font-family: ${({ theme }) => theme.fontFamily};
  color: ${({ theme }) => theme.textColor.highlighted};
`;
const Rect = styled.rect.attrs(({ theme }) => ({
  fill: theme.roundHeaders.background,
}))``;

export default function RoundHeader({
  x,
  y = 0,
  width,
  roundHeader,
  canvasPadding,
  numOfRounds,
  tournamentRoundText,
  columnIndex,
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
      />
      <Text
        x={x + width / 2}
        y={y + canvasPadding + roundHeader.height / 2}
        style={{
          fontFamily: roundHeader.fontFamily,
          fontSize: `${roundHeader.fontSize}px`,
          color: roundHeader.fontColor,
        }}
        fill="currentColor"
        dominantBaseline="middle"
        textAnchor="middle"
      >
        {roundHeader.roundTextGenerator
          ? roundHeader.roundTextGenerator(columnIndex + 1, numOfRounds)
          : (() => {
              if (columnIndex + 1 === numOfRounds) return 'Финал';
              if (columnIndex + 1 === numOfRounds - 1) return 'Полуфинал';
              const map: Record<string, string> = {
                Quarterfinals: 'Четвертьфинал',
                Quarterfinal: 'Четвертьфинал',
                'Round of 16': '1/8 финала',
                'Round of 8': '1/4 финала',
                'Round of 32': '1/16 финала',
                Semifinal: 'Полуфинал',
                Final: 'Финал',
              };
              const raw = tournamentRoundText || '';
              return map[raw] || raw || 'Раунд';
            })()}
      </Text>
    </g>
  );
}
