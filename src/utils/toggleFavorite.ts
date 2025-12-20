export function toggleFavorite(trackId: string, favorites: string[], setFavorites: (ids: string[]) => void) {
  if (favorites.includes(trackId)) {
    setFavorites(favorites.filter(id => id !== trackId));
  } else {
    setFavorites([...favorites, trackId]);
  }
}