export interface IService {
  init?(): Promise<void> | void;
  dispose?(): void;
}
