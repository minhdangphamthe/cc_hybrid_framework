/**
 * App-level string constants.
 *
 * Why: avoids "magic strings" in code so it's easier to review/refactor.
 * Use these constants anywhere you previously wrote 'app/play', 'Gameplay', etc.
 */

export const AppEvent = {
  Play: 'app/play',
  Restart: 'app/restart',
  Result: 'app/result',
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
}

export type AppState = typeof AppState[keyof typeof AppState];

export const SceneMode = {
  Single: 'single',
  Multi: 'multi',
}

export type SceneMode = typeof SceneMode[keyof typeof SceneMode];