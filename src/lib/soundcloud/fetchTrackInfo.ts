export async function fetchSoundCloudTrackInfo(url: string) {
  try {
    // SoundCloud oEmbed API - public, no auth required
    const apiUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`;
    const res = await fetch(apiUrl);
    
    if (!res.ok) {
      console.warn(`Failed to fetch SoundCloud info for ${url}`);
      return null;
    }
    
    const data = await res.json();
    
    return {
      title: data.title,
      artwork: data.thumbnail_url?.replace('-large', '-t500x500'), // Get larger image
      author: data.author_name,
      description: data.description,
    };
  } catch (err) {
    console.error('Error fetching SoundCloud track info:', err);
    return null;
  }
}