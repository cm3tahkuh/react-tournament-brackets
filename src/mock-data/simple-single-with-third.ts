import { Match } from '../types';

export const simpleSingleWithThird: Match[] = [
  {
    id: 1,
    name: 'Semifinal 1',
    nextMatchId: 3,
    tournamentRoundText: 'Semifinal',
    startTime: '2025-11-05T10:00:00Z',
    state: 'SCORE_DONE',
    participants: [
      { id: 11, name: 'Team A', isWinner: true, resultText: '2' },
      { id: 12, name: 'Team B', isWinner: false, resultText: '0' },
    ],
  },
  {
    id: 2,
    name: 'Semifinal 2',
    nextMatchId: 3,
    tournamentRoundText: 'Semifinal',
    startTime: '2025-11-05T11:00:00Z',
    state: 'SCORE_DONE',
    participants: [
      { id: 13, name: 'Team C', isWinner: false, resultText: '1' },
      { id: 14, name: 'Team D', isWinner: true, resultText: '2' },
    ],
  },
  {
    id: 3,
    name: 'Grand Final',
    nextMatchId: null,
    tournamentRoundText: 'Final',
    startTime: '2025-11-05T13:00:00Z',
    state: 'SCORE_DONE',
    participants: [
      { id: 11, name: 'Team A', isWinner: true, resultText: '3' },
      { id: 14, name: 'Team D', isWinner: false, resultText: '2' },
    ],
  },
  {
    id: 4,
    name: '3 место',
    nextMatchId: null,
    tournamentRoundText: '3rd Place',
    startTime: '2025-11-05T12:00:00Z',
    state: 'SCORE_DONE',
    // mark explicitly as third place
    isThirdPlace: true as any,
    participants: [
      { id: 13, name: 'Team C', isWinner: true, resultText: '2' },
      { id: 12, name: 'Team B', isWinner: false, resultText: '1' },
    ],
  },
];

export default simpleSingleWithThird;


