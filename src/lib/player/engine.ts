export interface PlayerEngine {
  mount(container: HTMLElement): Promise<void>;
  load(url: string): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(seconds: number): Promise<void>;
  getState(): { isPlaying: boolean; position: number; duration: number };
  destroy(): void;
}
