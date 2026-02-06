
export enum AppState {
  INTRO = 'INTRO',
  FAQ = 'FAQ',
  SCORE = 'SCORE',
  SUSPENSE = 'SUSPENSE',
  PROPOSAL = 'PROPOSAL',
  SUCCESS = 'SUCCESS'
}

export interface FaqData {
  girlfriendName: string;
  guessName: string;
  guessAge: string;
  guessColor: string;
  guessCricketer: string;
  guessFruit: string;
  guessPerson: string;
  guessLocation: string;
  guessDish: string;
  guessCity: string;
  guessFestival: string;
  guessDestination: string;
  aboutMe: string;
}
