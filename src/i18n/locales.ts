export type Locale = 'en' | 'ru';

export interface LocaleStrings {
  roundNames: {
    final: string;
    grandFinal: string;
    semifinal: string;
    quarterfinal: string;
    thirdPlace: string;
    roundOf16: string;
    roundOf8: string;
    roundOf32: string;
    round: string;
    winners: string;
    upperBracket: string;
    lowerBracket: string;
    ubFinal: string;
    lbFinal: string;
    ubSemiFinal: string;
    lbSemiFinal: string;
    ubRound: string;
    lbRound: string;
  };
  placements: {
    first: string;
    second: string;
    third: string;
  };
  match: {
    details: string;
    walkOver: string;
    noShow: string;
  };
}

export const locales: Record<Locale, LocaleStrings> = {
  en: {
    roundNames: {
      final: 'Final',
      grandFinal: 'Grand Final',
      semifinal: 'Semifinal',
      quarterfinal: 'Quarterfinal',
      thirdPlace: '3rd Place',
      roundOf16: 'Round of 16',
      roundOf8: 'Round of 8',
      roundOf32: 'Round of 32',
      round: 'Round',
      winners: 'Winners',
      upperBracket: 'Upper Bracket',
      lowerBracket: 'Lower Bracket',
      ubFinal: 'Winners Final',
      lbFinal: 'Losers Final',
      ubSemiFinal: 'Winners Semi',
      lbSemiFinal: 'Losers Semi',
      ubRound: 'Winners',
      lbRound: 'Losers',
    },
    placements: {
      first: '1st Place',
      second: '2nd Place',
      third: '3rd Place',
    },
    match: {
      details: 'Match details',
      walkOver: 'WIN',
      noShow: 'No show',
    },
  },
  ru: {
    roundNames: {
      final: 'Финал',
      grandFinal: 'Гранд Финал',
      semifinal: 'Полуфинал',
      quarterfinal: 'Четвертьфинал',
      thirdPlace: '3 место',
      roundOf16: '1/8 финала',
      roundOf8: '1/4 финала',
      roundOf32: '1/16 финала',
      round: 'Раунд',
      winners: 'Победители',
      upperBracket: 'Сетка победителей',
      lowerBracket: 'Сетка проигравших',
      ubFinal: 'Финал победителей',
      lbFinal: 'Финал проигравших',
      ubSemiFinal: 'Полуфинал победителей',
      lbSemiFinal: 'Полуфинал проигравших',
      ubRound: 'Победители',
      lbRound: 'Проигравшие',
    },
    placements: {
      first: '1 место',
      second: '2 место',
      third: '3 место',
    },
    match: {
      details: 'Детали матча',
      walkOver: 'WIN',
      noShow: 'Неявка',
    },
  },
};

/**
 * Returns the locale strings for the given locale code.
 * Defaults to English if the locale is not found.
 */
export function getLocaleStrings(locale?: string): LocaleStrings {
  return locales[(locale as Locale) || 'en'] ?? locales.en;
}
