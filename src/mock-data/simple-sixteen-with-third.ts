import { Match } from '../types';

// 16 teams: R16(8) -> QF(4) -> SF(2) -> Final(1) + Third(1)
export const simpleSixteenWithThird: Match[] = [
  // Round of 16
  { id: 1, name: 'R16-1', nextMatchId: 21, tournamentRoundText: 'Round of 16', startTime: '2025-11-05T08:00:00Z', state: 'SCORE_DONE', participants: [ { id: 101, name: 'T1', isWinner: true, resultText: '2' }, { id: 116, name: 'T16', isWinner: false, resultText: '0' } ] },
  { id: 2, name: 'R16-2', nextMatchId: 21, tournamentRoundText: 'Round of 16', startTime: '2025-11-05T08:30:00Z', state: 'SCORE_DONE', participants: [ { id: 108, name: 'T8', isWinner: true, resultText: '2' }, { id: 109, name: 'T9', isWinner: false, resultText: '1' } ] },
  { id: 3, name: 'R16-3', nextMatchId: 22, tournamentRoundText: 'Round of 16', startTime: '2025-11-05T09:00:00Z', state: 'SCORE_DONE', participants: [ { id: 105, name: 'T5', isWinner: false, resultText: '0' }, { id: 112, name: 'T12', isWinner: true, resultText: '2' } ] },
  { id: 4, name: 'R16-4', nextMatchId: 22, tournamentRoundText: 'Round of 16', startTime: '2025-11-05T09:30:00Z', state: 'SCORE_DONE', participants: [ { id: 104, name: 'T4', isWinner: true, resultText: '2' }, { id: 113, name: 'T13', isWinner: false, resultText: '1' } ] },
  { id: 5, name: 'R16-5', nextMatchId: 23, tournamentRoundText: 'Round of 16', startTime: '2025-11-05T10:00:00Z', state: 'SCORE_DONE', participants: [ { id: 102, name: 'T2', isWinner: true, resultText: '2' }, { id: 115, name: 'T15', isWinner: false, resultText: '0' } ] },
  { id: 6, name: 'R16-6', nextMatchId: 23, tournamentRoundText: 'Round of 16', startTime: '2025-11-05T10:30:00Z', state: 'SCORE_DONE', participants: [ { id: 107, name: 'T7', isWinner: false, resultText: '0' }, { id: 110, name: 'T10', isWinner: true, resultText: '2' } ] },
  { id: 7, name: 'R16-7', nextMatchId: 24, tournamentRoundText: 'Round of 16', startTime: '2025-11-05T11:00:00Z', state: 'SCORE_DONE', participants: [ { id: 103, name: 'T3', isWinner: true, resultText: '2' }, { id: 114, name: 'T14', isWinner: false, resultText: '1' } ] },
  { id: 8, name: 'R16-8', nextMatchId: 24, tournamentRoundText: 'Round of 16', startTime: '2025-11-05T11:30:00Z', state: 'SCORE_DONE', participants: [ { id: 106, name: 'T6', isWinner: true, resultText: '2' }, { id: 111, name: 'T11', isWinner: false, resultText: '0' } ] },

  // Quarterfinals
  { id: 21, name: 'Quarterfinal 1', nextMatchId: 31, tournamentRoundText: 'Quarterfinals', startTime: '2025-11-05T13:00:00Z', state: 'SCORE_DONE', participants: [ { id: 101, name: 'T1', isWinner: true, resultText: '2' }, { id: 108, name: 'T8', isWinner: false, resultText: '0' } ] },
  { id: 22, name: 'Quarterfinal 2', nextMatchId: 31, tournamentRoundText: 'Quarterfinals', startTime: '2025-11-05T13:30:00Z', state: 'SCORE_DONE', participants: [ { id: 112, name: 'T12', isWinner: false, resultText: '0' }, { id: 104, name: 'T4', isWinner: true, resultText: '2' } ] },
  { id: 23, name: 'Quarterfinal 3', nextMatchId: 32, tournamentRoundText: 'Quarterfinals', startTime: '2025-11-05T14:00:00Z', state: 'SCORE_DONE', participants: [ { id: 102, name: 'T2', isWinner: true, resultText: '2' }, { id: 110, name: 'T10', isWinner: false, resultText: '1' } ] },
  { id: 24, name: 'Quarterfinal 4', nextMatchId: 32, tournamentRoundText: 'Quarterfinals', startTime: '2025-11-05T14:30:00Z', state: 'SCORE_DONE', participants: [ { id: 103, name: 'T3', isWinner: true, resultText: '2' }, { id: 106, name: 'T6', isWinner: false, resultText: '0' } ] },

  // Semifinals
  { id: 31, name: 'Semifinal 1', nextMatchId: 41, tournamentRoundText: 'Semifinal', startTime: '2025-11-05T15:30:00Z', state: 'SCORE_DONE', participants: [ { id: 101, name: 'T1', isWinner: true, resultText: '2' }, { id: 104, name: 'T4', isWinner: false, resultText: '1' } ] },
  { id: 32, name: 'Semifinal 2', nextMatchId: 41, tournamentRoundText: 'Semifinal', startTime: '2025-11-05T16:00:00Z', state: 'SCORE_DONE', participants: [ { id: 102, name: 'T2', isWinner: false, resultText: '0' }, { id: 103, name: 'T3', isWinner: true, resultText: '2' } ] },

  // Final
  { id: 41, name: 'Grand Final', nextMatchId: null, tournamentRoundText: 'Final', startTime: '2025-11-05T17:00:00Z', state: 'SCORE_DONE', participants: [ { id: 101, name: 'T1', isWinner: true, resultText: '3' }, { id: 103, name: 'T3', isWinner: false, resultText: '1' } ] },

  // Third place (semifinal losers: T4 vs T2)
  { id: 42, name: 'Third Place', nextMatchId: null, tournamentRoundText: '3rd Place', startTime: '2025-11-05T16:30:00Z', state: 'SCORE_DONE', isThirdPlace: true as any, participants: [ { id: 104, name: 'T4', isWinner: true, resultText: '2' }, { id: 102, name: 'T2', isWinner: false, resultText: '0' } ] },
];

export default simpleSixteenWithThird;


