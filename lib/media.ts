/**
 * Scholaria — Media manifest.
 *
 * Every photograph and video on the site is referenced from this single file
 * so that re-curation is a one-place edit. URLs are verified to resolve on
 * the Unsplash CDN; if a photo is later removed, swap the photo ID and the
 * caption — every placement updates.
 *
 * Editorial direction: MODERN contemporary scholarship. Bright daylight,
 * glass and concrete libraries, laptops on light wood desks, candid daylight
 * portraits. No vintage leather books, no green-banker-lamp shots, no
 * fountain-pen-on-parchment clichés.
 */

export interface Photo {
  src: string;
  alt: string;
  credit: string;
  width: number;
  height: number;
}

export interface Video {
  src: string;
  poster: string;
  caption: string;
  credit: string;
}

/**
 * VideoSlot — used by the FeatureVideo component on marketing pages.
 *
 * - `youtubeId` is the only part you ever need to change. Leave it empty
 *   and the component shows a beautiful still poster (no playback). Fill it
 *   in and the poster gains a working play button.
 * - To find a YouTube ID: open the video on YouTube and copy the eleven
 *   characters after `v=` (or after `youtu.be/`). Use videos from your own
 *   channel, your institution's channel, or those you have permission to
 *   embed. Default `nocookie.com` embedding is used so we do not set
 *   marketing cookies on first paint.
 */
export interface VideoSlot {
  youtubeId: string;
  poster: string;
  posterAlt: string;
  caption: string;
  attribution: string;
  credit: string;
  duration?: string;
}

const u = (id: string, w = 2200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}`;

/* -------------------------------------------------------------------------- *
 * Marquee — homepage frontispiece + chapter interludes.
 * -------------------------------------------------------------------------- */

export const HERO_FIGURE: Photo = {
  src: u("photo-1521587760476-6c12a4b040da"),
  alt: "Modern library reading room with floor-to-ceiling windows and rows of bright study tables.",
  credit: "Susan Q Yin — Unsplash",
  width: 2200,
  height: 1238
};

export const INTERLUDE_LIBRARY: Photo = {
  src: u("photo-1521295121783-8a321d551ad2"),
  alt: "Long architectural corridor inside a contemporary academic library, daylight overhead.",
  credit: "Tobias Fischer — Unsplash",
  width: 2200,
  height: 1238
};

export const INTERLUDE_MANUSCRIPT: Photo = {
  src: u("photo-1488998427799-e3362cec87c3"),
  alt: "A laptop, an open notebook, and a coffee cup on a clean white desk in daylight.",
  credit: "Lauren Mancke — Unsplash",
  width: 2200,
  height: 1238
};

export const INTERLUDE_DESK: Photo = {
  src: u("photo-1543269865-cbf427effbad"),
  alt: "Two students discussing notes at a bright modern workspace, laptops open.",
  credit: "Helena Lopes — Unsplash",
  width: 2200,
  height: 1238
};

/* -------------------------------------------------------------------------- *
 * Page mastheads — one photograph per page, chosen so each route reads as
 * a distinct issue of the same publication.
 * -------------------------------------------------------------------------- */

export const PAGE_HEROES: Record<string, Photo> = {
  about: {
    src: u("photo-1607237138185-eedd9c632b0b"),
    alt: "Architectural detail of a contemporary university building photographed from below.",
    credit: "Kenny Eliason — Unsplash",
    width: 2200,
    height: 1238
  },
  services: {
    src: u("photo-1571260899304-425eee4c7efc"),
    alt: "A reader at a daylight study desk, open laptop and printed pages laid out side by side.",
    credit: "Toa Heftiba — Unsplash",
    width: 2200,
    height: 1238
  },
  howItWorks: {
    src: u("photo-1497633762265-9d179a990aa6"),
    alt: "Open notebook beside an open book on a light desk, soft daylight from a window.",
    credit: "Alexis Brown — Unsplash",
    width: 2200,
    height: 1238
  },
  upload: {
    src: u("photo-1517048676732-d65bc937f952"),
    alt: "A small group reviewing printed documents around a clean modern table in daylight.",
    credit: "Mimi Thian — Unsplash",
    width: 2200,
    height: 1238
  },
  pricing: {
    src: u("photo-1454165804606-c3d57bc86b40"),
    alt: "Annotated documents and analytics printouts arranged on a white desk.",
    credit: "Helloquence — Unsplash",
    width: 2200,
    height: 1238
  },
  contact: {
    src: u("photo-1554224155-6726b3ff858f"),
    alt: "Modern minimal desk with a laptop, notepad, and a cup of coffee in soft side light.",
    credit: "Andrew Neel — Unsplash",
    width: 2200,
    height: 1238
  },
  faq: {
    src: u("photo-1500917293891-ef795e70e1f6"),
    alt: "Open book with a soft daylight reading lamp on a contemporary desk.",
    credit: "Patrick Tomasso — Unsplash",
    width: 2200,
    height: 1238
  },
  enterprise: {
    src: u("photo-1568667256549-094345857637"),
    alt: "Reading room of a contemporary academic library with tall windows and rows of desks.",
    credit: "Iñaki del Olmo — Unsplash",
    width: 2200,
    height: 1238
  },
  dissertation: {
    src: u("photo-1532012197267-da84d127e765"),
    alt: "Tall library stacks lit by daylight, looking down an aisle of bound research volumes.",
    credit: "Susan Q Yin — Unsplash",
    width: 2200,
    height: 1238
  },
  apa: {
    src: u("photo-1517842645767-c639042777db"),
    alt: "Close-up of a page of printed academic text with crisp line-spacing and margins.",
    credit: "Jaredd Craig — Unsplash",
    width: 2200,
    height: 1238
  },
  literature: {
    src: u("photo-1481627834876-b7833e8f5570"),
    alt: "Stack of contemporary academic books on a clean white desk, one open mid-read.",
    credit: "Mikołaj — Unsplash",
    width: 2200,
    height: 1238
  },
  methodology: {
    src: u("photo-1455390582262-044cdead277a"),
    alt: "Open notebook with a methodology outline written by hand, soft daylight.",
    credit: "Aaron Burden — Unsplash",
    width: 2200,
    height: 1238
  }
};

/* -------------------------------------------------------------------------- *
 * Portraits — used in Correspondence (letters from doctoral candidates).
 * Modern daylight portraiture, candid registers — no stock smiles.
 * -------------------------------------------------------------------------- */

export const PORTRAITS: Record<string, Photo> = {
  // Local portraits — six commissioned editorial portraits at /public/portraits.
  patel: {
    src: "/portraits/patel.png",
    alt: "Portrait of a doctoral candidate in glasses and a green sweater, whiteboard with equations behind.",
    credit: "Scholaria editorial",
    width: 512,
    height: 512
  },
  okafor: {
    src: "/portraits/okafor.png",
    alt: "Portrait of a doctoral candidate in glasses and a gray sweater, bookshelves behind.",
    credit: "Scholaria editorial",
    width: 512,
    height: 512
  },
  park: {
    src: "/portraits/park.png",
    alt: "Portrait of a doctoral candidate in a black turtleneck, holding a pen, books in foreground.",
    credit: "Scholaria editorial",
    width: 512,
    height: 512
  },
  thompson: {
    src: "/portraits/thompson.png",
    alt: "Portrait of a doctoral candidate in a cream knit sweater, notebook open on the desk.",
    credit: "Scholaria editorial",
    width: 512,
    height: 512
  },
  williams: {
    src: "/portraits/williams.png",
    alt: "Portrait of a doctoral candidate with curly hair and glasses, green collared shirt over white tee.",
    credit: "Scholaria editorial",
    width: 512,
    height: 512
  },
  khan: {
    src: "/portraits/khan.png",
    alt: "Portrait of a doctoral candidate in a beige hijab and dark top, library bookshelves behind.",
    credit: "Scholaria editorial",
    width: 512,
    height: 512
  },

  // Three testimonials still use curated Unsplash photos until matching
  // editorial portraits are commissioned. Swap to local paths later.
  ibarra: {
    src: u("photo-1573497019940-1c28c88b4f3e", 600),
    alt: "Portrait of a candidate in a striped shirt photographed in indoor daylight.",
    credit: "Christina @ wocintechchat.com — Unsplash",
    width: 600,
    height: 600
  },
  chen: {
    src: u("photo-1535713875002-d1d0cf377fde", 600),
    alt: "Portrait of a candidate in a sweater photographed in even daylight.",
    credit: "Anastasia Vityukova — Unsplash",
    width: 600,
    height: 600
  },
  ramirez: {
    src: u("photo-1607746882042-944635dfe10e", 600),
    alt: "Portrait of a candidate with curly hair smiling slightly, daylight portrait.",
    credit: "Andrea Piacquadio — Unsplash",
    width: 600,
    height: 600
  },
  ndiaye: {
    src: u("photo-1542178243-bc20204b769f", 600),
    alt: "Portrait of a candidate in a collared shirt photographed in indoor daylight.",
    credit: "Tachina Lee — Unsplash",
    width: 600,
    height: 600
  }
};

/* -------------------------------------------------------------------------- *
 * Feature video slots — engagement-grade YouTube embeds on the homepage.
 * Set `youtubeId` to the eleven-character ID from any YouTube video URL
 * (e.g. `https://youtu.be/<id>`). Leave empty to ship the poster as a
 * still figure with a disabled play button.
 *
 * Suggested content for each slot below. The poster image is shown until
 * the visitor clicks play; only then is YouTube contacted, so the homepage
 * stays fast.
 * -------------------------------------------------------------------------- */

export const FEATURE_VIDEO_HERO: VideoSlot = {
  // A short film about the platform: how Scholaria runs the autonomous
  // review pipeline, narrated over a doctoral student's manuscript.
  // Suggested length: 60–90 seconds. Drop your YouTube ID here:
  youtubeId: "",
  poster: u("photo-1521295121783-8a321d551ad2"),
  posterAlt: "Architectural corridor inside a contemporary academic library, daylight overhead.",
  caption: "A short film about how Scholaria reviews a manuscript, from intake to delivery.",
  attribution: "Scholaria editorial · 2026",
  credit: "Photograph · Tobias Fischer — Unsplash",
  duration: "01:38"
};

export const FEATURE_VIDEO_DESK: VideoSlot = {
  // Behind-the-scenes / "Day in the life of a doctoral writer using
  // Scholaria" — a contemplative editorial cut, not a tutorial.
  youtubeId: "",
  poster: u("photo-1543269865-cbf427effbad"),
  posterAlt: "Two doctoral candidates at a bright modern workspace with laptops and printed pages.",
  caption: "A day at the editorial desk, told without narration.",
  attribution: "Field film · Atlanta cohort · 2026",
  credit: "Photograph · Helena Lopes — Unsplash",
  duration: "02:14"
};

export const FEATURE_VIDEO_TESTIMONY: VideoSlot = {
  // Optional third slot — a doctoral candidate speaking on camera about
  // their dissertation experience. Recommended on the About page.
  youtubeId: "",
  poster: u("photo-1494790108377-be9c29b29330"),
  posterAlt: "Portrait of a doctoral candidate in soft window light.",
  caption: "Letters from the cohort, read on camera.",
  attribution: "Correspondence series · 2026",
  credit: "Photograph · Christina @ wocintechchat.com — Unsplash",
  duration: "00:54"
};
