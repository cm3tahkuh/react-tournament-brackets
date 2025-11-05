import { Match } from '../types';

// 8 teams: QF(4) -> SF(2) -> Final(1) + Third Place(1)
export const simpleEightWithThird: Match[] = [
  // Quarterfinals
  {
    id: 101,
    name: 'Quarterfinal 1',
    nextMatchId: 201,
    tournamentRoundText: 'Quarterfinals',
    startTime: '2025-11-05T09:00:00Z',
    state: 'SCORE_DONE',
    participants: [
      { id: 1, name: 'Team 1', isWinner: true, resultText: '2' },
      { id: 8, name: 'Team 8', isWinner: false, resultText: '0' },
    ],
  },
  {
    id: 102,
    name: 'Quarterfinal 2',
    nextMatchId: 201,
    tournamentRoundText: 'Quarterfinals',
    startTime: '2025-11-05T10:00:00Z',
    state: 'SCORE_DONE',
    participants: [
      { id: 4, name: 'Team 4', isWinner: false, resultText: '1' },
      { id: 5, name: 'Team 5', isWinner: true, resultText: '2' },
    ],
  },
  {
    id: 103,
    name: 'Quarterfinal 3',
    nextMatchId: 202,
    tournamentRoundText: 'Quarterfinals',
    startTime: '2025-11-05T11:00:00Z',
    state: 'SCORE_DONE',
    participants: [
      { id: 2, name: 'Team 2', isWinner: true, resultText: '2' },
      { id: 7, name: 'Team 7', isWinner: false, resultText: '1' },
    ],
  },
  {
    id: 104,
    name: 'Quarterfinal 4',
    nextMatchId: 202,
    tournamentRoundText: 'Quarterfinals',
    startTime: '2025-11-05T12:00:00Z',
    state: 'SCORE_DONE',
    participants: [
      { id: 3, name: 'Team 3', isWinner: false, resultText: '0' },
      { id: 6, name: 'Team 6', isWinner: true, resultText: '2' },
    ],
  },

  // Semifinals
  {
    id: 201,
    name: 'Semifinal 1',
    nextMatchId: 301,
    tournamentRoundText: 'Semifinal',
    startTime: '2025-11-05T13:30:00Z',
    state: 'SCORE_DONE',
    participants: [
      { id: 1, name: 'Team 1', isWinner: false, resultText: '1' },
      { id: 5, name: 'Team 5', isWinner: true, resultText: '2' },
    ],
  },
  {
    id: 202,
    name: 'Semifinal 2',
    nextMatchId: 301,
    tournamentRoundText: 'Semifinal',
    startTime: '2025-11-05T14:30:00Z',
    state: 'SCORE_DONE',
    participants: [
      { id: 2, name: 'Team 2', isWinner: true, resultText: '2' },
      { id: 6, name: 'Team 6', isWinner: false, resultText: '0' },
    ],
  },

  // Final
  {
    id: 301,
    name: 'Grand Final',
    nextMatchId: null,
    tournamentRoundText: 'Final',
    startTime: '2025-11-05T16:00:00Z',
    state: 'SCORE_DONE',
    participants: [
      { id: 5, name: 'Team 5', isWinner: false, resultText: '1' },
      { id: 2, name: 'Team 2', isWinner: true, resultText: '3' },
    ],
  },

  // Third Place (semifinal losers: Team 1 vs Team 6)
  {
    id: 302,
    name: 'Third Place',
    nextMatchId: null,
    tournamentRoundText: '3rd Place',
    startTime: '2025-11-05T15:15:00Z',
    state: 'SCORE_DONE',
    isThirdPlace: true as any,
    participants: [
      { id: 1, name: 'Team 1', isWinner: true, resultText: '2' },
      { id: 6, name: 'Team 6', isWinner: false, resultText: '1' },
    ],
  },
];

export default simpleEightWithThird;


