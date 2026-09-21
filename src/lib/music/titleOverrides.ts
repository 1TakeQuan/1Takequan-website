// Targeted title fallbacks for YouTube videos whose title noembed cannot resolve.
//
// This is NOT a catalog. It only exists because noembed consistently returns a server error
// ("Can't use string ("servers") as a HASH ref…") for these specific videos, which would otherwise
// leave the generic "1TakeQuan Track" placeholder on screen. Real resolved titles always win;
// an override is only used when the lookup returns nothing.
//
// Remove an entry once the consolidated master catalog carries the title.
export const TITLE_OVERRIDES: Record<string, string> = {
  fClzw0x4WQQ: "Jump In",
};
