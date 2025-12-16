import type { Track } from "@/lib/types";

// Helper to fetch cover art from SoundCloud
export async function fetchTrackCover(soundcloudUrl: string): Promise<string | null> {
  try {
    const res = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(soundcloudUrl)}`);
    if (res.ok) {
      const data = await res.json();
      return data.thumbnail_url?.replace('-large', '-t500x500') || null;
    }
  } catch (err) {
    console.error('Failed to fetch cover:', err);
  }
  return null;
}

export const tracks: Track[] = [
  {
    id: "stop-drop-rock-rock-ft",
    title: "Stop Drop Rock Rock Ft",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/stop-drop-rock-rock-ft"
    },
    releaseDate: "2024"
  },
  {
    id: "runaway-ft-b23min-gom3z-prod",
    title: "Runaway FT B23min Gom3z",
    artists: ["1TakeQuan", "B23min", "Gom3z"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/runaway-ft-b23min-gom3z-prod"
    },
    releaseDate: "2024"
  },
  {
    id: "you-ft-bennyave-prod-by",
    title: "You FT Bennyave",
    artists: ["1TakeQuan", "Bennyave"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/you-ft-bennyave-prod-by"
    },
    releaseDate: "2024"
  },
  {
    id: "lesson-learned-ft-tyler-j",
    title: "Lesson Learned Ft Tyler J",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/lesson-learned-ft-tyler-j"
    }
  },
  {
    id: "lunch-date-prod-by-slapmafia",
    title: "Lunch Date Prod. By SlapMafia",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/lunch-date-prod-by-slapmafia"
    }
  },
  {
    id: "handful-prod-by-bigg-boo",
    title: "Handful Prod. By Bigg Boo",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/handful-prod-by-bigg-boo"
    }
  },
  {
    id: "oowee-prod-by-flyguyy",
    title: "Oowee Prod. By Flyguyy",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/oowee-prod-by-flyguyy"
    }
  },
  {
    id: "diddy-bop-ft-1taketeezy",
    title: "Diddy Bop Ft 1TakeTeezy",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/diddy-bop-ft-1taketeezy"
    }
  },
  {
    id: "the-one-ft-1taketeezy-prod-by",
    title: "The One Ft 1TakeTeezy Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/the-one-ft-1taketeezy-prod-by"
    }
  },
  {
    id: "embarrsed-prod-by-1-of-1",
    title: "Embarrsed Prod. By 1 Of 1",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/embarrsed-prod-by-1-of-1"
    }
  },
  {
    id: "make-sense-prod-by-timmy-tunes",
    title: "Make Sense Prod. By Timmy Tunes",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/make-sense-prod-by-timmy-tunes"
    }
  },
  {
    id: "buss-it-4",
    title: "Buss It 4",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/buss-it-4"
    }
  },
  {
    id: "anonymous-2",
    title: "Anonymous 2",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/anonymous-2"
    }
  },
  {
    id: "break-it-7",
    title: "Break It 7",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/break-it-7"
    }
  },
  {
    id: "major-league-3",
    title: "Major League 3",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/major-league-3"
    }
  },
  {
    id: "super-5",
    title: "Super 5",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/super-5"
    }
  },
  {
    id: "no-competition-1",
    title: "No Competition 1",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/no-competition-1"
    }
  },
  {
    id: "moneymaker-8",
    title: "Moneymaker 8",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/moneymaker-8"
    }
  },
  {
    id: "different-6",
    title: "Different 6",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/different-6"
    }
  },
  {
    id: "its-real-9",
    title: "Its Real 9",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/its-real-9"
    }
  },
  {
    id: "go-live-prod-by-killa-kam",
    title: "Go Live Prod. By Killa Kam",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/go-live-prod-by-killa-kam"
    }
  },
  {
    id: "double-o-quan-prod-low-the",
    title: "Double O Quan Prod. Low The",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/double-o-quan-prod-low-the"
    }
  },
  {
    id: "benny-x-quan-2_10-20",
    title: "Benny X Quan 2_10 20",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/benny-x-quan-2_10-20"
    }
  },
  {
    id: "3-sum-ft-lil-vada-donny-solo",
    title: "3 Sum Ft Lil Vada Donny Solo",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/3-sum-ft-lil-vada-donny-solo"
    }
  },
  {
    id: "do-it-prod-by-scumbeatz",
    title: "Do It Prod. By ScumBeatz",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/do-it-prod-by-scumbeatz"
    }
  },
  {
    id: "not-alot-prod-by-larrymakinallthehits-0",
    title: "Not Alot Prod. By LarryMakinAllTheHits 0",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/not-alot-prod-by-larrymakinallthehits-0"
    }
  },
  {
    id: "tonight-ft-lil-vada-prod-by-crook",
    title: "Tonight Ft Lil Vada Prod. By Crook",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/tonight-ft-lil-vada-prod-by-crook"
    }
  },
  {
    id: "show-me-prod-bennyave",
    title: "Show Me Prod. BennyAve",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/show-me-prod-bennyave"
    }
  },
  {
    id: "backshots-ft-boosie-badazz-1takejay-prod-by-420tiesto-killa-kam",
    title: "Backshots Ft Boosie Badazz 1TakeJay Prod. By 420Tiesto Killa Kam",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/backshots-ft-boosie-badazz-1takejay-prod-by-420tiesto-killa-kam"
    }
  },
  {
    id: "drop-pin-ft-1takeocho-tyler-j",
    title: "Drop Pin Ft 1TakeOcho Tyler J",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/drop-pin-ft-1takeocho-tyler-j"
    }
  },
  {
    id: "like-me-ft-1taketeezy-prod-by-mikeyy2yyz-jonnycash",
    title: "Like Me Ft 1TakeTeezy Prod. By Mikeyy2yyz JonnyCash",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/like-me-ft-1taketeezy-prod-by-mikeyy2yyz-jonnycash"
    }
  },
  {
    id: "too-much-prod-by-crook",
    title: "Too Much Prod. By Crook",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/too-much-prod-by-crook"
    }
  },
  {
    id: "i-know-prod-by-acetheface",
    title: "I Know Prod. By AceTheFace",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/i-know-prod-by-acetheface"
    }
  },
  {
    id: "up-down-ft-tyler-j-prod-by-romo",
    title: "Up Down Ft Tyler J Prod. By Romo",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/up-down-ft-tyler-j-prod-by-romo"
    }
  },
  {
    id: "pop-that-prod-by-menanceonthebeat",
    title: "Pop That Prod. By MenaceOnTheBeat",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/pop-that-prod-by-menanceonthebeat"
    }
  },
  {
    id: "in-love-again-prod-acetheface",
    title: "In Love Again Prod. AceTheFace",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/in-love-again-prod-acetheface"
    }
  },
  {
    id: "patience-prod-by-slapmafia",
    title: "Patience Prod. By SlapMafia",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/patience-prod-by-slapmafia"
    }
  },
  {
    id: "talk-to-me-nice-ft-1takejay-1",
    title: "Talk To Me Nice Ft 1TakeJay 1",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/talk-to-me-nice-ft-1takejay-1"
    }
  },
  {
    id: "my-way-prod-lowthegreat",
    title: "My Way Prod. LowTheGreat",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/my-way-prod-lowthegreat"
    }
  },
  {
    id: "dont.play-prod-by-phoobear-2",
    title: "Dont.Play Prod. By Phoobear 2",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/dont.play-prod-by-phoobear-2"
    }
  },
  {
    id: "lethal-prod-by-slapmafia",
    title: "Lethal Prod. By SlapMafia",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/lethal-prod-by-slapmafia"
    }
  },
  {
    id: "go-head-prodby-teezymaadeit-scumbeatz",
    title: "Go Head ProdBy TeezyMaadeIt ScumBeatz",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/go-head-prodby-teezymaadeit-scumbeatz"
    }
  },
  {
    id: "no-emotion",
    title: "No Emotion",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/no-emotion"
    }
  },
  {
    id: "when-you-come-over-prod-by-420tiesto-saltreze",
    title: "When You Come Over Prod. By 420Tiesto Saltreze",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/when-you-come-over-prod-by-420tiesto-saltreze"
    }
  },
  {
    id: "fight-the-pimpimg-freestyle-ft-pocaah",
    title: "Fight The Pimpimg Freestyle Ft Pocaah",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/fight-the-pimpimg-freestyle-ft-pocaah"
    }
  },
  {
    id: "switch-lanes-prod-by-sneak-da-freak",
    title: "Switch Lanes Prod. By Sneak Da Freak",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/switch-lanes-prod-by-sneak-da-freak"
    }
  },
  {
    id: "locked-in-prod-flyguyveezy",
    title: "Locked In Prod. Flyguyveezy",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/locked-in-prod-flyguyveezy"
    }
  },
  {
    id: "adidas-sped-up-prod-by",
    title: "Adidas Sped Up Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/adidas-sped-up-prod-by"
    }
  },
  {
    id: "adidas-prod-slapmafia",
    title: "Adidas Prod. SlapMafia",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/adidas-prod-slapmafia"
    }
  },
  {
    id: "on-the-road-ft-1taketeezy-bighube-prod-by-benny-ave",
    title: "On The Road Ft 1TakeTeezy BigHube Prod. By Benny Ave",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/on-the-road-ft-1taketeezy-bighube-prod-by-benny-ave"
    }
  },
  {
    id: "locksmith-ft-big-sad-1900-prod",
    title: "Locksmith Ft Big Sad 1900 Prod",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/locksmith-ft-big-sad-1900-prod"
    }
  },
  {
    id: "on-the-wall-ft-pocaahontassss",
    title: "On The Wall Ft Pocaahontassss?si=ae5f00cf41954129b128eb05679c6638&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/on-the-wall-ft-pocaahontassss?si=ae5f00cf41954129b128eb05679c6638&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"
    }
  },
  {
    id: "1942-prod-by-scum-uno",
    title: "1942 Prod. By Scum Uno",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1942-prod-by-scum-uno"
    }
  },
  {
    id: "drumroll-prod-by-teezymadeit",
    title: "Drumroll Prod. By TeezyMadeIt",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/drumroll-prod-by-teezymadeit"
    }
  },
  {
    id: "one-call-prod-by-scum-uno-sped-up",
    title: "One Call Prod. By Scum Uno Sped Up",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/one-call-prod-by-scum-uno-sped-up"
    }
  },
  {
    id: "one-call-prod-by-scum-uno",
    title: "One Call Prod. By Scum Uno",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/one-call-prod-by-scum-uno"
    }
  },
  {
    id: "dna-ft-tylerj-chris-o-bannon-prod-by-romo",
    title: "Dna Ft TylerJ Chris O'Bannon Prod. By Romo",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/dna-ft-tylerj-chris-o-bannon-prod-by-romo"
    }
  },
  {
    id: "feedback-prod-by-420tiesto",
    title: "Feedback Prod. By 420Tiesto",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/feedback-prod-by-420tiesto"
    }
  },
  {
    id: "fake-freaky-remix-ft-lil-vada",
    title: "Fake Freaky Remix Ft Lil Vada",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/fake-freaky-remix-ft-lil-vada"
    }
  },
  {
    id: "1takequan-campaign-prod-by",
    title: "1TakeQuan Campaign Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-campaign-prod-by"
    }
  },
  {
    id: "in-my-zone-prod-by",
    title: "In My Zone Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/in-my-zone-prod-by"
    }
  },
  {
    id: "1takequan-x-benny-ave-alone",
    title: "1TakeQuan X Benny Ave Alone",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-x-benny-ave-alone"
    }
  },
  {
    id: "1takequan-booted-up-ft",
    title: "1TakeQuan Booted Up Ft",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-booted-up-ft"
    }
  },
  {
    id: "1taekequan-lil-shyt-prod-by",
    title: "1TaekeQuan Lil Shyt Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1taekequan-lil-shyt-prod-by"
    }
  },
  {
    id: "1takequan-lifestyle-ft-chxnk",
    title: "1TakeQuan Lifestyle Ft Chxnk",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-lifestyle-ft-chxnk"
    }
  },
  {
    id: "1takequan-fake-freaky-prod-by",
    title: "1TakeQuan Fake Freaky Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-fake-freaky-prod-by"
    }
  },
  {
    id: "99-problems-prod-by",
    title: "99 Problems Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/99-problems-prod-by"
    }
  },
  {
    id: "bad-guy",
    title: "Bad Guy",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/bad-guy"
    }
  },
  {
    id: "tear-it-up-freestyle-prod-by-bennyave-420tiesto",
    title: "Tear It Up Freestyle Prod. By BennyAve 420Tiesto",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/tear-it-up-freestyle-prod-by-bennyave-420tiesto"
    }
  },
  {
    id: "call-this-prod-by-bennyave",
    title: "Call This Prod. By BennyAve",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/call-this-prod-by-bennyave"
    }
  },
  {
    id: "nothing-less-ft-tyler-j-chris",
    title: "Nothing Less Ft Tyler J Chris",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/nothing-less-ft-tyler-j-chris"
    }
  },
  {
    id: "1takequan-out-myne-prod-by",
    title: "1TakeQuan Out Myne Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-out-myne-prod-by"
    }
  },
  {
    id: "1takequan-ratchet-talk-prod-by",
    title: "1TakeQuan Ratchet Talk Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-ratchet-talk-prod-by"
    }
  },
  {
    id: "1takequan-hater-baby-prod-by",
    title: "1TakeQuan Hater Baby Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-hater-baby-prod-by"
    }
  },
  {
    id: "1takequan-do-dhat-prod-by",
    title: "1TakeQuan Do Dhat Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-do-dhat-prod-by"
    }
  },
  {
    id: "24a",
    title: "24A",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/24a"
    }
  },
  {
    id: "chitlins-feat-1takejay",
    title: "Chitlins Ft 1TakeJay",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/chitlins-feat-1takejay"
    }
  },
  {
    id: "visions",
    title: "Visions",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/visions"
    }
  },
  {
    id: "damn-ant-feat-big-hube",
    title: "Damn Ant Ft Big Hube",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/damn-ant-feat-big-hube"
    }
  },
  {
    id: "im-tripping-feat-rucci",
    title: "Im Tripping Ft Rucci",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/im-tripping-feat-rucci"
    }
  },
  {
    id: "its-sum-feat-chxnk",
    title: "Its Sum Ft Chxnk",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/its-sum-feat-chxnk"
    }
  },
  {
    id: "love-talk-feat-1takeocho-tyler-j",
    title: "Love Talk Ft 1TakeOcho Tyler J",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/love-talk-feat-1takeocho-tyler-j"
    }
  },
  {
    id: "the-plan",
    title: "The Plan",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/the-plan"
    }
  },
  {
    id: "bubble-coat-feat-1taketeezy",
    title: "Bubble Coat Ft 1TakeTeezy",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/bubble-coat-feat-1taketeezy"
    }
  },
  {
    id: "richard",
    title: "Richard",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/richard"
    }
  },
  {
    id: "lick-lick",
    title: "Lick Lick",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/lick-lick"
    }
  },
  {
    id: "1takequan-please-please-prod",
    title: "1TakeQuan Please Please Prod",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-please-please-prod"
    }
  },
  {
    id: "1takequan-timeless-prod-by",
    title: "1TakeQuan Timeless Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-timeless-prod-by"
    }
  },
  {
    id: "single",
    title: "Single",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/single"
    }
  },
  {
    id: "1takequan-jump-in-ft-almighty-suspect-1takejay",
    title: "1TakeQuan Jump In Ft Almighty Suspect 1TakeJay",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-jump-in-ft-almighty-suspect-1takejay"
    }
  },
  {
    id: "eastside",
    title: "Eastside",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/eastside"
    }
  },
  {
    id: "hold-on-prod-by-adin",
    title: "Hold On Prod. By Adin",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/hold-on-prod-by-adin"
    }
  },
  {
    id: "velveta-prod-micah-street",
    title: "Velveta Prod. Micah Street",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/velveta-prod-micah-street"
    }
  },
  {
    id: "bankroll-prod-by-paupa",
    title: "Bankroll Prod. By Paupa",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/bankroll-prod-by-paupa"
    }
  },
  {
    id: "bb-bottles-bitches-prod-by-mickey2yyz",
    title: "BB Bottles Bitches Prod. By Mickey2yyz",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/bb-bottles-bitches-prod-by-mickey2yyz"
    }
  },
  {
    id: "you-give-me-prod-by-benny-ave",
    title: "You Give Me Prod. By Benny Ave",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/you-give-me-prod-by-benny-ave"
    }
  },
  {
    id: "do-they-work-prod-by-blizzy",
    title: "Do They Work Prod. By Blizzy",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/do-they-work-prod-by-blizzy"
    }
  },
  {
    id: "swang-feat-cheif-boy-lee-lee-babi-prod-by-bigg-boo",
    title: "Swang Ft Cheif Boy Lee Lee Babi Prod. By Bigg Boo",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/swang-feat-cheif-boy-lee-lee-babi-prod-by-bigg-boo"
    }
  },
  {
    id: "jason-feat-1taketeezy-prod-by-romo",
    title: "Jason Ft 1TakeTeezy Prod. By Romo",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/jason-feat-1taketeezy-prod-by-romo"
    }
  },
  {
    id: "what-happened-feat-1takejay-prod-by-fads-bigg-boo",
    title: "What Happened Ft 1TakeJay Prod. By Fads Bigg Boo",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/what-happened-feat-1takejay-prod-by-fads-bigg-boo"
    }
  },
  {
    id: "man-down-feat-lil-duece",
    title: "Man Down Ft Lil Duece",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/man-down-feat-lil-duece"
    }
  },
  {
    id: "confessions",
    title: "Confessions",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/confessions"
    }
  },
  {
    id: "backy-feat-1takejay-1taketeezy",
    title: "Backy Ft 1TakeJay 1TakeTeezy",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/backy-feat-1takejay-1taketeezy"
    }
  },
  {
    id: "1takequan-ali-prod-by-zombie-sneekdafreek",
    title: "1TakeQuan Ali Prod. By Zombie SneekDaFreek",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-ali-prod-by-zombie-sneekdafreek"
    }
  },
  {
    id: "1takequan-muslce-up-prod-by",
    title: "1TakeQuan Muscle Up Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-muslce-up-prod-by"
    }
  },
  {
    id: "wiggle-remix-ft-1takejay-prod-by-lowthegreat",
    title: "Wiggle Remix Ft 1TakeJay Prod. By LowTheGreat",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/wiggle-remix-ft-1takejay-prod-by-lowthegreat"
    }
  },
  {
    id: "1takequan-fight-night-prod-by-lowthegreat",
    title: "1TakeQuan Fight Night Prod. By LowTheGreat",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-fight-night-prod-by-lowthegreat"
    }
  },
  {
    id: "1takequan-ping-pong-prod-by",
    title: "1TakeQuan Ping Pong Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-ping-pong-prod-by"
    }
  },
  {
    id: "1takequan-booker-t-prod-by",
    title: "1TakeQuan Booker T Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-booker-t-prod-by"
    }
  },
  {
    id: "1takequan-wow-prod-by-bennyave",
    title: "1TakeQuan Wow Prod. By BennyAve",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-wow-prod-by-bennyave"
    }
  },
  {
    id: "1takequan-go-girl-prod-by-1",
    title: "1TakeQuan Go Girl Prod. By 1",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-go-girl-prod-by-1"
    }
  },
  {
    id: "1takequan-only-fans-prod-by-lowthegreat",
    title: "1TakeQuan Only Fans Prod. By LowTheGreat",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-only-fans-prod-by-lowthegreat"
    }
  },
  {
    id: "1takequan-sex-prod-by",
    title: "1TakeQuan Sex Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-sex-prod-by"
    }
  },
  {
    id: "1takequan-mall-price-prod-by",
    title: "1TakeQuan Mall Price Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-mall-price-prod-by"
    }
  },
  {
    id: "1takequan-cap-prod-by-steelz",
    title: "1TakeQuan Cap Prod. By Steelz",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-cap-prod-by-steelz"
    }
  },
  {
    id: "1takequan-i-love-it-ft-rucci-prod-by-biggboo",
    title: "1TakeQuan I Love It Ft Rucci Prod. By BiggBoo",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-i-love-it-ft-rucci-prod-by-biggboo"
    }
  },
  {
    id: "1takequan-back-then-ft-mister",
    title: "1TakeQuan Back Then Ft Mister",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-back-then-ft-mister"
    }
  },
  {
    id: "1takequan-faded-down-prod-by-dtscurt",
    title: "1TakeQuan Faded Down Prod. By DtsCurt",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-faded-down-prod-by-dtscurt"
    }
  },
  {
    id: "1takequan-big-dog-prod-by",
    title: "1TakeQuan Big Dog Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-big-dog-prod-by"
    }
  },
  {
    id: "1takequan-no-cut-prod-by-jv",
    title: "1TakeQuan No Cut Prod. By JV",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-no-cut-prod-by-jv"
    }
  },
  {
    id: "1takequan-plumber-prod-by",
    title: "1TakeQuan Plumber Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-plumber-prod-by"
    }
  },
  {
    id: "1takequan-fbgm-prod-by",
    title: "1TakeQuan FBGM Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-fbgm-prod-by"
    }
  },
  {
    id: "1takequan-instructions-prod-by",
    title: "1TakeQuan Instructions Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-instructions-prod-by"
    }
  },
  {
    id: "1takequan-jerry-rice-prod-by",
    title: "1TakeQuan Jerry Rice Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-jerry-rice-prod-by"
    }
  },
  {
    id: "1takequan-shots-prod-by",
    title: "1TakeQuan Shots Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-shots-prod-by"
    }
  },
  {
    id: "1takequan-wiggle-prod-by-lowthegreat",
    title: "1TakeQuan Wiggle Prod. By LowTheGreat",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-wiggle-prod-by-lowthegreat"
    }
  },
  {
    id: "1takequan-double-f-prod-by-lowthegreat",
    title: "1TakeQuan Double F Prod. By LowTheGreat",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-double-f-prod-by-lowthegreat"
    }
  },
  {
    id: "1takequan-chris-obannon-on",
    title: "1TakeQuan Chris O'Bannon On",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-chris-obannon-on"
    }
  },
  {
    id: "1takequan-chris-obannon-my",
    title: "1TakeQuan Chris O'Bannon My",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-chris-obannon-my"
    }
  },
  {
    id: "1takequan-chris-obannon",
    title: "1TakeQuan Chris O'Bannon",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-chris-obannon"
    }
  },
  {
    id: "1takequan-chris-obannon-stingy",
    title: "1TakeQuan Chris O'Bannon Stingy",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-chris-obannon-stingy"
    }
  },
  {
    id: "1takequan-chris-obannon-talk",
    title: "1TakeQuan Chris O'Bannon Talk",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-chris-obannon-talk"
    }
  },
  {
    id: "uan-x-1takejay-mf-prod",
    title: "Uan X 1TakeJay Mf Prod",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/uan-x-1takejay-mf-prod"
    }
  },
  {
    id: "1takequan-homi-prod-by-scumbeats",
    title: "1TakeQuan Homi Prod. By ScumBeats",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-homi-prod-by-scumbeats"
    }
  },
  {
    id: "all-blues-feat-azchike-x-bravo-the-bagchaserprod-by-scum-beats-x-flashassuno-x-laudiano",
    title: "All Blues Ft AzChike X Bravo The Bagchaser Prod. By Scum Beats X FlashAssuno X Laudiano",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/all-blues-feat-azchike-x-bravo-the-bagchaserprod-by-scum-beats-x-flashassuno-x-laudiano"
    }
  },
  {
    id: "sus-quan-macho",
    title: "Sus Quan Macho",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/sus-quan-macho"
    }
  },
  {
    id: "freak-feat-kalan-frfr",
    title: "Freak Ft Kalan FrFr",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/freak-feat-kalan-frfr"
    }
  },
  {
    id: "1takequan-diffrent-vibe-prod",
    title: "1TakeQuan Diffrent Vibe Prod",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-diffrent-vibe-prod"
    }
  },
  {
    id: "1takequan-lil-shawty-prod-by",
    title: "1TakeQuan Lil Shawty Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-lil-shawty-prod-by"
    }
  },
  {
    id: "1takequan-perfect-timing-prod",
    title: "1TakeQuan Perfect Timing Prod",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-perfect-timing-prod"
    }
  },
  {
    id: "1takequan-simple-prod-by",
    title: "1TakeQuan Simple Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-simple-prod-by"
    }
  },
  {
    id: "1takequan-prize",
    title: "1TakeQuan Prize",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-prize"
    }
  },
  {
    id: "1takequan-the-night-prod-by",
    title: "1TakeQuan The Night Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-the-night-prod-by"
    }
  },
  {
    id: "1takequan-x-jstar-questions",
    title: "1TakeQuan X JStar Questions",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-x-jstar-questions"
    }
  },
  {
    id: "1takequan-x-rucci-fresh-prince-prod-by-420tiesto",
    title: "1TakeQuan X Rucci Fresh Prince Prod. By 420Tiesto",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-x-rucci-fresh-prince-prod-by-420tiesto"
    }
  },
  {
    id: "1takequan-never-slip-prod-by-420tiesto",
    title: "1TakeQuan Never Slip Prod. By 420Tiesto",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-never-slip-prod-by-420tiesto"
    }
  },
  {
    id: "1takequan-fuego-prod-by-djtray",
    title: "1TakeQuan Fuego Prod. By DjTray",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-fuego-prod-by-djtray"
    }
  },
  {
    id: "middle-fingers",
    title: "Middle Fingers",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/middle-fingers"
    }
  },
  {
    id: "middle-fingers-prod-by-kev4mvp",
    title: "Middle Fingers Prod. By Kev4Mvp",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/middle-fingers-prod-by-kev4mvp"
    }
  },
  {
    id: "burnt",
    title: "Burnt",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/burnt"
    }
  },
  {
    id: "expensive-habits",
    title: "Expensive Habits",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/expensive-habits"
    }
  },
  {
    id: "memorized",
    title: "Memorized",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/memorized"
    }
  },
  {
    id: "1000-bubbles",
    title: "1000 Bubbles",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1000-bubbles"
    }
  },
  {
    id: "flavor",
    title: "Flavor",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/flavor"
    }
  },
  {
    id: "demons",
    title: "Demons",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/demons"
    }
  },
  {
    id: "wwyt",
    title: "Wwyt",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/wwyt"
    }
  },
  {
    id: "go-gettah",
    title: "Go Gettah",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/go-gettah"
    }
  },
  {
    id: "ah-need-prod-by-sorryjaynari",
    title: "Ah Need Prod. By SorryJayNari",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/ah-need-prod-by-sorryjaynari"
    }
  },
  {
    id: "hit-baby-prod-by-meez-louieji",
    title: "Hit Baby Prod. By Meez LouieJi",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/hit-baby-prod-by-meez-louieji"
    }
  },
  {
    id: "everything-new-prod-by",
    title: "Everything New Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/everything-new-prod-by"
    }
  },
  {
    id: "stay-drunk-feat-lowthegreat",
    title: "Stay Drunk Ft LowTheGreat",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/stay-drunk-feat-lowthegreat"
    }
  },
  {
    id: "ya-feel-me-prod-by-meez",
    title: "Ya Feel Me Prod. By Meez",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/ya-feel-me-prod-by-meez"
    }
  },
  {
    id: "top-5-prod-by-mikeyy2yz",
    title: "Top 5 Prod. By Mikeyy2yz",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/top-5-prod-by-mikeyy2yz"
    }
  },
  {
    id: "loss-prod-by-420tiesto",
    title: "Loss Prod. By 420Tiesto",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/loss-prod-by-420tiesto"
    }
  },
  {
    id: "i-like-prod-by-420tiesto",
    title: "I Like Prod. By 420Tiesto",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/i-like-prod-by-420tiesto"
    }
  },
  {
    id: "dont-hurt-nobody-prod-by",
    title: "Dont Hurt Nobody Prod. By",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/dont-hurt-nobody-prod-by"
    }
  },
  {
    id: "loser-prod-by-420tiesto",
    title: "Loser Prod. By 420Tiesto",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/loser-prod-by-420tiesto"
    }
  },
  {
    id: "1-2-3-prod-by-420tiesto",
    title: "1-2-3 Prod. By 420Tiesto",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1-2-3-prod-by-420tiesto"
    }
  },
  {
    id: "money-prod-by-420tiesto",
    title: "Money Prod. By 420Tiesto",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/money-prod-by-420tiesto"
    }
  },
  {
    id: "1takequan-longtime-ft-daidmb-prod-by-paupa",
    title: "1TakeQuan Longtime Ft Daidmb Prod. By Paupa",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-longtime-ft-daidmb-prod-by-paupa"
    }
  },
  {
    id: "1takequan-x-gogettahkb-18dummy-prod-by-paupa",
    title: "1TakeQuan X GoGettahKb 18Dummy Prod. By Paupa",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-x-gogettahkb-18dummy-prod-by-paupa"
    }
  },
  {
    id: "1takequan-fuck-it-up-radio-edit-master",
    title: "1TakeQuan Fuck It Up Radio Edit Master",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-fuck-it-up-radio-edit-master"
    }
  },
  {
    id: "1takequan-dont-stop-prod-by-420tiesto",
    title: "1TakeQuan Dont Stop Prod. By 420Tiesto",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-dont-stop-prod-by-420tiesto"
    }
  },
  {
    id: "1takequan-savages-ft-ashbashtharapper-prod-by-kingxriko",
    title: "1TakeQuan Savages Ft AshBashThaRapper Prod. By KingxRiko",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-savages-ft-ashbashtharapper-prod-by-kingxriko"
    }
  },
  {
    id: "1takequan-1take-slide-prod-by-arjayonthebeat",
    title: "1TakeQuan 1Take Slide Prod. By ArJayOnTheBeat",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/1takequan-1take-slide-prod-by-arjayonthebeat"
    }
  },
  {
    id: "go-to-work-feat-dmb-gotti",
    title: "Go To Work Ft DMB Gotti",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/go-to-work-feat-dmb-gotti"
    }
  },
  {
    id: "say-so-feat-1taketeezy-kalan",
    title: "Say So Ft 1TakeTeezy Kalan",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/say-so-feat-1taketeezy-kalan"
    }
  },
  {
    id: "weird-shit",
    title: "Weird Shit",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/weird-shit"
    }
  },
  {
    id: "2019-1",
    title: "2019",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/2019-1"
    }
  },
  {
    id: "bopper",
    title: "Bopper",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/bopper"
    }
  },
  {
    id: "savages",
    title: "Savages",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/savages"
    }
  },
  {
    id: "who-want-it",
    title: "Who Want It",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/who-want-it"
    }
  },
  {
    id: "closer-to-you-feat-1takeocho",
    title: "Closer To You Ft 1TakeOcho",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/closer-to-you-feat-1takeocho"
    }
  },
  {
    id: "call-her-a-bitch-freestyle",
    title: "Call Her A Bitch Freestyle",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/call-her-a-bitch-freestyle"
    }
  },
  {
    id: "long-time",
    title: "Long Time",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/long-time"
    }
  },
  {
    id: "yeah-dat",
    title: "Yeah Dat",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/yeah-dat"
    }
  },
  {
    id: "new-olympics",
    title: "New Olympics",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/new-olympics"
    }
  },
  {
    id: "grub-hub",
    title: "Grub Hub",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/grub-hub"
    }
  },
  {
    id: "now-drop-freestyle",
    title: "Now Drop Freestyle",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/now-drop-freestyle"
    }
  },
  {
    id: "feel-special-feat-j-star",
    title: "Feel Special Ft J Star",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/feel-special-feat-j-star"
    }
  },
  {
    id: "focused",
    title: "Focused",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/focused"
    }
  },
  {
    id: "most-likely-feat-hube",
    title: "Most Likely Ft Hube",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/most-likely-feat-hube"
    }
  },
  {
    id: "pretty-brown",
    title: "Pretty Brown",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/pretty-brown"
    }
  },
  {
    id: "my-lady",
    title: "My Lady",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/my-lady"
    }
  },
  {
    id: "sinkin",
    title: "Sinkin",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/sinkin"
    }
  },
  {
    id: "like-this-feat-tony-heisman",
    title: "Like This Ft Tony Heisman",
    artists: ["1TakeQuan"],
    sources: {
      soundcloud: "https://soundcloud.com/1takequan/like-this-feat-tony-heisman"
    }
  }
] as const;

console.log('📀 Catalog loaded:', tracks.length, 'tracks');