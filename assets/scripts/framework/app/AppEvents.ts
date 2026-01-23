/**
 * App-level events used by AppController.
 * Your project can extend or replace these.
 */
export interface AppEvents {
  'app/play': {};
  'app/restart': {};
  'app/backToHome': {};
  'app/stateChanged': { state: string; data?: any };
}
