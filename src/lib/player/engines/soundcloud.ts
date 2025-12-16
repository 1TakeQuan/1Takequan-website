import type { PlayerEngine } from "../engine";

declare global {
  interface Window { SC?: any; }
}

export class SoundCloudEngine implements PlayerEngine {
  private iframe?: HTMLIFrameElement;
  private widget?: any;
  private _isPlaying = false;
  private _duration = 0;
  private _position = 0;

  async mount(container: HTMLElement) {
    // create an iframe container
    const iframe = document.createElement("iframe");
    iframe.allow = "autoplay";
    iframe.width = "100%";
    iframe.height = "166";
    iframe.scrolling = "no";
    iframe.frameBorder = "no";
    container.innerHTML = "";
    container.appendChild(iframe);
    this.iframe = iframe;

    // load SC widget API if needed
    if (!window.SC) {
      await new Promise<void>((resolve) => {
        const s = document.createElement("script");
        s.src = "https://w.soundcloud.com/player/api.js";
        s.onload = () => resolve();
        document.body.appendChild(s);
      });
    }
  }

  async load(url: string) {
    if (!this.iframe || !window.SC) return;
    this.iframe.src =
      "https://w.soundcloud.com/player/?url=" +
      encodeURIComponent(url) +
      "&auto_play=false&show_artwork=true";

    this.widget = window.SC.Widget(this.iframe);
    this.widget.bind(window.SC.Widget.Events.READY, () => {
      this.widget.getDuration((ms: number) => (this._duration = ms / 1000));
    });
    this.widget.bind(window.SC.Widget.Events.PLAY, () => (this._isPlaying = true));
    this.widget.bind(window.SC.Widget.Events.PAUSE, () => (this._isPlaying = false));
    this.widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (e: any) => {
      this._position = e.currentPosition / 1000;
    });
  }

  async play() { this.widget?.play(); }
  async pause() { this.widget?.pause(); }
  async seek(seconds: number) { this.widget?.seekTo(seconds * 1000); }

  getState() {
    return { isPlaying: this._isPlaying, position: this._position, duration: this._duration };
  }

  destroy() {
    if (this.iframe?.parentElement) this.iframe.parentElement.innerHTML = "";
    this.widget = undefined;
    this.iframe = undefined;
  }
}
