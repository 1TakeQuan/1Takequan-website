let widgetReady = false;
let widgetPromise: Promise<void> | null = null;

function ensureWidgetAPI(): Promise<void> {
  if (widgetReady && (window as any).SC?.Widget) {
    return Promise.resolve();
  }

  if (widgetPromise) return widgetPromise;

  widgetPromise = new Promise((resolve, reject) => {
    if ((window as any).SC?.Widget) {
      widgetReady = true;
      resolve();
      return;
    }

    const existing = document.querySelector('script[src*="soundcloud.com/player/api.js"]');
    if (existing) {
      const checkInterval = setInterval(() => {
        if ((window as any).SC?.Widget) {
          widgetReady = true;
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Widget API load timeout'));
      }, 5000);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://w.soundcloud.com/player/api.js';
    script.async = true;
    script.onload = () => {
      widgetReady = true;
      resolve();
    };
    script.onerror = () => {
      widgetPromise = null;
      reject(new Error('Failed to load SoundCloud Widget API'));
    };
    document.head.appendChild(script);
  });

  return widgetPromise;
}

export async function playTrack(iframe: HTMLIFrameElement): Promise<void> {
  try {
    await ensureWidgetAPI();
    
    const widget = (window as any).SC?.Widget(iframe);
    if (!widget) {
      console.warn('SoundCloud widget not available for play');
      return;
    }
    
    widget.play();
  } catch (error) {
    console.warn('playTrack failed:', error);
  }
}

export async function pauseTrack(iframe: HTMLIFrameElement): Promise<void> {
  try {
    await ensureWidgetAPI();
    
    const widget = (window as any).SC?.Widget(iframe);
    if (!widget) {
      console.warn('SoundCloud widget not available for pause');
      return;
    }
    
    widget.pause();
  } catch (error) {
    console.warn('pauseTrack failed:', error);
  }
}
