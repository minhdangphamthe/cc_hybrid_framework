/**
 * App-level events used by AppController.
 * Your project can extend or replace these.
 */
import { AppStateName } from './AppConstants';

export interface AppEvents {
  'app/play': {};
  'app/restart': {};
  'app/backToHome': {};
  'app/stateChanged': { state: AppStateName; data?: any };
}
