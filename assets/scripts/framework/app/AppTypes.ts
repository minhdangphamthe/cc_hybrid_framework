export type SceneMode = 'single' | 'multi';

export interface AppSceneNames {
  home: string;
  gameplay: string;
  result?: string;
}

export interface AppControllerOptions {
  mode: SceneMode;
  scenes?: AppSceneNames;
  /** If true, AppController will auto-start Gameplay from Home after delay (demo). Default false. */
  autoPlayFromHome?: boolean;
  autoPlayDelaySec?: number;
}
