import type { PlayerEngine } from "../engine";

export class YouTubeEngine implements PlayerEngine {
  private iframe?: HTMLIFrameElement;
  private container?: HTMLElement;
  private currentUrl = "";
  private isPlaying = false;

  async mount(container: HTMLElement): Promise<void> {
    this.container = container;
    // create iframe shell
    const iframe = document.createElement("iframe");
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.style.border = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    this.container.innerHTML = "";
    this.container.appendChild(iframe);
    this.iframe = iframe;
  }

  async load(url: string): Promise<void> {
    this.currentUrl = this.toEmbed(url);
    if (this.iframe) {
      this.iframe.src = this.currentUrl;
    }
    this.isPlaying = false;
  }

  async play(): Promise<void> {
    // YouTube iframe API would enable programmatic play; as a simple embed, reload with autoplay=1
    if (this.iframe && this.currentUrl) {
      const withAutoplay = this.currentUrl.includes("?")
        ? `${this.currentUrl}&autoplay=1`
        : `${this.currentUrl}?autoplay=1`;
      this.iframe.src = withAutoplay;
      this.isPlaying = true;
    }
  }

  async pause(): Promise<void> {
    // No direct pause without the full IFrame API; reload without autoplay as a cheap pause
    if (this.iframe && this.currentUrl) {
      this.iframe.src = this.currentUrl;
      this.isPlaying = false;
    }
  }

  async seek(_seconds: number): Promise<void> {
    // Not supported in this minimal embed; use IFrame API if needed
  }

  getState(): { isPlaying: boolean; position: number; duration: number } {
    return { isPlaying: this.isPlaying, position: 0, duration: 0 };
  }

  destroy(): void {
    if (this.container) this.container.innerHTML = "";
    this.iframe = undefined;
    this.isPlaying = false;
  }

  // Accept music.youtube.com/watch, youtube.com/watch, youtu.be and return an embeddable URL
  private toEmbed(url: string): string {
    let u: URL;
    try {
      u = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return url;
    }
    let id = "";
    if (/(^|\.)youtu\.be$/i.test(u.hostname)) {
      id = u.pathname.slice(1);
    } else if (/(^|\.)youtube\.com$/i.test(u.hostname) || /(^(^|\.)music\.youtube\.com)$/i.test(u.hostname)) {
      if (u.pathname === "/watch") id = u.searchParams.get("v") ?? "";
      if (u.pathname === "/playlist") {
        const list = u.searchParams.get("list");
        if (list) return `https://www.youtube-nocookie.com/embed/videoseries?list=${list}`;
      }
    }
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : url;
  }
}
