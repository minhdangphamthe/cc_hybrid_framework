/**
 * App-level string constants.
 *
 * Why: avoids "magic strings" in code so it's easier to review/refactor.
 * Use these constants anywhere you previously wrote 'app/play', 'Gameplay', etc.
 */

export const AppEvent = {
  Play: 'app/play',
  Restart: 'app/restart',
  BackToHome: 'app/backToHome',
  StateChanged: 'app/stateChanged',
} as const;

export type AppEventName = typeof AppEvent[keyof typeof AppEvent];

export const AppState = {
  Boot: 'Boot',
  Home: 'Home',
  Gameplay: 'Gameplay',
  Result: 'Result',
  Loading: 'Loading',
} as const;

export type AppStateName = typeof AppState[keyof typeof AppState];

export enum SceneMode {
  Single = 'single',
  Multi = 'multi',
}
