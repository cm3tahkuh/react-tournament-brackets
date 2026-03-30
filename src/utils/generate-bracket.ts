import { Match, Participant } from '../types';
import { getLocaleStrings } from '../i18n/locales';

/**
 * Input team for bracket generation.
 * Teams are seeded in array order: index 0 = seed 1, index 1 = seed 2, etc.
 */
export type TeamInput = {
  id: string | number;
  name: string;
  [key: string]: any;
};

export type GenerateBracketOptions = {
  /** Include a third-place match (losers of semifinals). Default: false */
  includeThirdPlace?: boolean;
  /** Start time for generated matches. Default: current ISO timestamp */
  startTime?: string;
  /** UI language for round labels: 'en' (default) or 'ru' */
  locale?: string;
};

/** Smallest power of 2 >= n */
function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Standard tournament seeding order for a bracket of given size.
 * E.g. size=8 → [1,8,4,5,3,6,2,7]
 * This ensures top seeds meet as late as possible.
 */
function generateSeedOrder(size: number): number[] {
  if (size === 1) return [1];
  const prev = generateSeedOrder(size / 2);
  const result: number[] = [];
  for (const seed of prev) {
    result.push(seed);
    result.push(size + 1 - seed);
  }
  return result;
}

/**
 * Generate a complete single-elimination bracket from a list of teams.
 *
 * When the number of teams is not a power of 2, the bracket is expanded
 * to the next power of 2 and the top seeds receive byes (auto-advance).
 *
 * @param teams – Array of teams ordered by seed (index 0 = seed 1).
 * @param options – Optional settings.
 * @returns Array of Match objects ready for `<SingleEliminationBracket>`.
 *
 * @example
 * ```ts
 * const teams = [
 *   { id: 1, name: 'Alpha' },
 *   { id: 2, name: 'Beta' },
 *   { id: 3, name: 'Gamma' },
 *   { id: 4, name: 'Delta' },
 *   { id: 5, name: 'Epsilon' },
 * ];
 * const matches = generateSingleEliminationBracket(teams, {
 *   includeThirdPlace: true,
 * });
 * // 5 teams → 8-slot bracket → 3 byes
 * // Byes: seeds 1, 2, 3 auto-advance; seeds 4 vs 5 play in round 1
 * ```
 */
export function generateSingleEliminationBracket(
  teams: TeamInput[],
  options: GenerateBracketOptions = {}
): Match[] {
  const {
    includeThirdPlace = false,
    startTime = new Date().toISOString(),
    locale,
  } = options;

  const numTeams = teams.length;
  if (numTeams < 2) {
    throw new Error('At least 2 teams are required to generate a bracket');
  }

  const bracketSize = nextPowerOf2(numTeams);
  const numRounds = Math.log2(bracketSize);
  const seedOrder = generateSeedOrder(bracketSize);

  // Map 1-indexed seed → team (or null for byes)
  const seedToTeam: (TeamInput | null)[] = [null]; // index 0 unused
  for (let i = 1; i <= bracketSize; i++) {
    seedToTeam.push(i <= numTeams ? teams[i - 1] : null);
  }

  const t = getLocaleStrings(locale);

  // Round label helpers
  const getRoundText = (r: number): string => {
    if (r === numRounds - 1) return t.roundNames.final;
    if (r === numRounds - 2) return t.roundNames.semifinal;
    if (r === numRounds - 3) return t.roundNames.quarterfinal;
    return `${t.roundNames.round} ${r + 1}`;
  };

  const getMatchName = (r: number, m: number, total: number): string => {
    if (r === numRounds - 1) return t.roundNames.grandFinal;
    const prefix = getRoundText(r);
    return total > 1 ? `${prefix} ${m + 1}` : prefix;
  };

  // --- Build match tree ---
  let nextId = 1;
  const rounds: Match[][] = [];

  for (let r = 0; r < numRounds; r++) {
    const numMatches = bracketSize / Math.pow(2, r + 1);
    const roundMatches: Match[] = [];
    for (let m = 0; m < numMatches; m++) {
      roundMatches.push({
        id: nextId++,
        name: getMatchName(r, m, numMatches),
        nextMatchId: null,
        nextLooserMatchId: null,
        tournamentRoundText: getRoundText(r),
        startTime,
        state: 'SCHEDULED',
        participants: [],
      } as any);
    }
    rounds.push(roundMatches);
  }

  // Link matches: each consecutive pair in round r feeds into one match in round r+1
  for (let r = 0; r < numRounds - 1; r++) {
    for (let m = 0; m < rounds[r].length; m++) {
      rounds[r][m].nextMatchId = rounds[r + 1][Math.floor(m / 2)].id;
    }
  }

  // Helper: build a fresh participant from a team
  const makeParticipant = (team: TeamInput): Participant => {
    const { id, name, ...extra } = team;
    return {
      id,
      name,
      isWinner: false,
      resultText: null,
      status: null,
      ...extra,
    };
  };

  // --- Seed first round ---
  for (let m = 0; m < rounds[0].length; m++) {
    const team1 = seedToTeam[seedOrder[m * 2]];
    const team2 = seedToTeam[seedOrder[m * 2 + 1]];

    const participants: Participant[] = [];
    if (team1) participants.push(makeParticipant(team1));
    if (team2) participants.push(makeParticipant(team2));

    // Bye: only one real team — auto-advance
    if (!team1 || !team2) {
      participants[0].isWinner = true;
      participants[0].status = 'WALK_OVER';
      rounds[0][m].state = 'WALK_OVER';
    }

    rounds[0][m].participants = participants;
  }

  // --- Propagate bye winners into the next round ---
  for (let r = 0; r < numRounds - 1; r++) {
    for (const match of rounds[r]) {
      if (match.state !== 'WALK_OVER') continue;
      const winner = match.participants.find(p => p.isWinner);
      if (!winner || !match.nextMatchId) continue;

      const nextMatch = rounds[r + 1].find(nm => nm.id === match.nextMatchId);
      if (!nextMatch) continue;

      // Avoid duplicating if already propagated
      const alreadyIn = nextMatch.participants.some(p => p.id === winner.id);
      if (!alreadyIn) {
        nextMatch.participants.push({
          id: winner.id,
          name: winner.name,
          isWinner: false,
          resultText: null,
          status: null,
        });
      }
    }
  }

  // --- Collect all matches ---
  const allMatches: Match[] = rounds.flat();

  // --- Optional third-place match ---
  if (includeThirdPlace && numRounds >= 2) {
    (allMatches as any[]).push({
      id: nextId++,
      name: t.roundNames.thirdPlace,
      nextMatchId: null,
      nextLooserMatchId: null,
      tournamentRoundText: t.roundNames.thirdPlace,
      startTime,
      state: 'SCHEDULED',
      isThirdPlace: true,
      participants: [],
    });
  }

  return allMatches;
}

// ---------------------------------------------------------------------------
// Double-Elimination bracket generator
// ---------------------------------------------------------------------------

export type GenerateDoubleEliminationBracketOptions = {
  /** Start time for generated matches. Default: current ISO timestamp */
  startTime?: string;
  /** UI language for round labels: 'en' (default) or 'ru' */
  locale?: string;
};

/**
 * Generate a complete double-elimination bracket structure.
 *
 * Returns `{ upper: Match[], lower: Match[] }` ready for
 * `<DoubleEliminationBracket matches={...} />`.
 *
 * Upper bracket contains the Grand Final as the last match
 * (`nextMatchId === null`).  The Lower Bracket Final points at the
 * Grand Final via `nextMatchId`, which is the convention expected by the
 * `findTheFinals` helper inside the renderer.
 *
 * @example
 * ```ts
 * const matches = generateDoubleEliminationBracket(teams, { locale: 'ru' });
 * <DoubleEliminationBracket matches={matches} matchComponent={Match} />
 * ```
 */
export function generateDoubleEliminationBracket(
  teams: TeamInput[],
  options: GenerateDoubleEliminationBracketOptions = {}
): { upper: Match[]; lower: Match[] } {
  const { startTime = new Date().toISOString(), locale } = options;

  if (teams.length < 2) throw new Error('At least 2 teams are required');

  const bracketSize = nextPowerOf2(teams.length);
  const k = Math.log2(bracketSize); // number of UB rounds before Grand Final

  const seedOrder = generateSeedOrder(bracketSize);
  const seedToTeam: (TeamInput | null)[] = [null];
  for (let i = 1; i <= bracketSize; i++) {
    seedToTeam.push(i <= teams.length ? teams[i - 1] : null);
  }

  let nextId = 1;

  const makeMatch = (name: string, roundText: string): Match =>
    ({
      id: nextId++,
      name,
      nextMatchId: null,
      nextLooserMatchId: null,
      tournamentRoundText: roundText,
      startTime,
      state: 'SCHEDULED',
      participants: [],
    } as any);

  // ── Upper Bracket ────────────────────────────────────────────────────────
  // ubRounds[r]: UB round r (0-indexed; r=0 is R1 with bracketSize/2 matches)
  const ubRounds: Match[][] = [];
  for (let r = 0; r < k; r++) {
    const numMatches = bracketSize / Math.pow(2, r + 1);
    const roundText = `UB ${r + 1}`;
    const roundMatches: Match[] = [];
    for (let m = 0; m < numMatches; m++) {
      let name: string;
      if (numMatches === 1) {
        name = r === k - 1 ? 'UB Final' : `UB Semi Final`;
      } else {
        name = `${roundText}.${m + 1}`;
      }
      roundMatches.push(makeMatch(name, roundText));
    }
    ubRounds.push(roundMatches);
  }

  // Grand Final lives in the upper array; nextMatchId stays null.
  const gfMatch = makeMatch('Grand Final', 'Grand Final');

  // Link UB rounds to each other (winner advances to next UB round)
  for (let r = 0; r < k - 1; r++) {
    for (let m = 0; m < ubRounds[r].length; m++) {
      ubRounds[r][m].nextMatchId = ubRounds[r + 1][Math.floor(m / 2)].id;
    }
  }
  // UB Final → Grand Final
  ubRounds[k - 1][0].nextMatchId = gfMatch.id;

  // ── Lower Bracket ────────────────────────────────────────────────────────
  // Round structure for bracketSize = 2^k:
  //   numLBRounds = 2*(k-1)
  //   LBR[i] match count = bracketSize / 2^(floor(i/2)+2)
  //
  //   Even-indexed rounds (i=0,2,…): "consolidation" – LB survivors pair up
  //     Linking to next: 1-to-1  (lbRounds[i][m] → lbRounds[i+1][m])
  //   Odd-indexed rounds  (i=1,3,…): "drop-in"   – UB loser drops into LB
  //     Linking to next: 2-to-1 (lbRounds[i][m] → lbRounds[i+1][floor(m/2)])
  //   Last round (always odd-indexed): → Grand Final
  //
  // UB loser connections (nextLooserMatchId):
  //   UBR1 (r=0): losers grouped 2-to-1 into LBR1 (i=0)
  //     ubRounds[0][m].nextLooserMatchId = lbRounds[0][floor(m/2)].id
  //   UBR{r+1} (r≥1): each loser drops into a drop-in LB round (i = 2r-1)
  //     ubRounds[r][m].nextLooserMatchId = lbRounds[2r-1][m].id

  const numLBRounds = 2 * (k - 1);
  const lbRounds: Match[][] = [];

  for (let i = 0; i < numLBRounds; i++) {
    const numMatches = bracketSize / Math.pow(2, Math.floor(i / 2) + 2);
    const roundNum = i + 1;
    const roundText = `LB ${roundNum}`;
    const roundMatches: Match[] = [];
    for (let m = 0; m < numMatches; m++) {
      let name: string;
      if (numMatches === 1 && i === numLBRounds - 1) {
        name = 'LB Final';
      } else if (numMatches === 1) {
        name = roundText;
      } else {
        name = `${roundText}.${m + 1}`;
      }
      roundMatches.push(makeMatch(name, roundText));
    }
    lbRounds.push(roundMatches);
  }

  // Link LB rounds
  for (let i = 0; i < numLBRounds - 1; i++) {
    for (let m = 0; m < lbRounds[i].length; m++) {
      if (i % 2 === 0) {
        // Consolidation round → drop-in round: 1-to-1
        lbRounds[i][m].nextMatchId = lbRounds[i + 1][m].id;
      } else {
        // Drop-in round → consolidation round: 2-to-1
        lbRounds[i][m].nextMatchId = lbRounds[i + 1][Math.floor(m / 2)].id;
      }
    }
  }

  // Last LB round (LB Final) → Grand Final
  if (numLBRounds > 0) {
    lbRounds[numLBRounds - 1][0].nextMatchId = gfMatch.id;
  }

  // ── Connect UB losers to LB (nextLooserMatchId) ──────────────────────────
  // UBR1 losers (4 for bracketSize=8) group 2-per-LBR1-match
  for (let m = 0; m < ubRounds[0].length; m++) {
    ubRounds[0][m].nextLooserMatchId = lbRounds[0][Math.floor(m / 2)].id;
  }
  // UBR{r+1} (r≥1) loser drops 1-to-1 into i=2r-1 (drop-in) LB round
  for (let r = 1; r < k; r++) {
    const targetLBIndex = 2 * r - 1; // i for the corresponding drop-in round
    if (targetLBIndex < numLBRounds) {
      for (let m = 0; m < ubRounds[r].length; m++) {
        ubRounds[r][m].nextLooserMatchId = lbRounds[targetLBIndex][m].id;
      }
    }
  }

  // ── Seed first round of UB ───────────────────────────────────────────────
  const makeParticipant = (team: TeamInput): Participant => {
    const { id, name, ...extra } = team;
    return { id, name, isWinner: false, resultText: null, status: null, ...extra };
  };

  for (let m = 0; m < ubRounds[0].length; m++) {
    const team1 = seedToTeam[seedOrder[m * 2]];
    const team2 = seedToTeam[seedOrder[m * 2 + 1]];
    const participants: Participant[] = [];
    if (team1) participants.push(makeParticipant(team1));
    if (team2) participants.push(makeParticipant(team2));
    if (!team1 || !team2) {
      participants[0].isWinner = true;
      participants[0].status = 'WALK_OVER';
      ubRounds[0][m].state = 'WALK_OVER';
    }
    ubRounds[0][m].participants = participants;
  }

  // Propagate bye winners through UB
  for (let r = 0; r < k - 1; r++) {
    for (const match of ubRounds[r]) {
      if (match.state !== 'WALK_OVER') continue;
      const winner = match.participants.find(p => p.isWinner);
      if (!winner || !match.nextMatchId) continue;
      const nextMatch = ubRounds[r + 1].find(nm => nm.id === match.nextMatchId);
      if (!nextMatch) continue;
      if (!nextMatch.participants.some(p => p.id === winner.id)) {
        nextMatch.participants.push({
          id: winner.id,
          name: winner.name,
          isWinner: false,
          resultText: null,
          status: null,
        });
      }
    }
  }

  return {
    upper: [...ubRounds.flat(), gfMatch],
    lower: lbRounds.flat(),
  };
}
