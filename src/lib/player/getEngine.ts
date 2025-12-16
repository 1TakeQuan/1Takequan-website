import type { Provider } from "../types";
import type { PlayerEngine } from "./engine";
import { SoundCloudEngine } from "./engines/soundcloud";
import { YouTubeEngine } from "./engines/youtube";

export async function getEngine(provider: Provider): Promise<PlayerEngine> {
  switch (provider) {
    case "soundcloud": return new SoundCloudEngine();
    case "youtube": return new YouTubeEngine();
    default: throw new Error("Unsupported provider");
  }
}
