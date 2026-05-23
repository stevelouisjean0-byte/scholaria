# Scholaria — Image & video curation guide

All photographic and video assets on the site are referenced from a single
manifest at [`lib/media.ts`](../lib/media.ts). To re-curate, edit URLs there.

## Editorial direction

The site reads as an academic press journal. Imagery must feel *inhabited and
serious*, not stocky or "AI-startup". The brief:

- **Reading rooms, libraries, archives** — warm natural light, oak, brass, ink.
- **Manuscripts, fountain pens, books** — top-down, soft shadow, no clutter.
- **Doctoral-age portraits** — candid, considered, off-axis. No big smiles.
- **Video** — slow, considered, no rapid cuts. Editorial register only.

What to avoid: glossy AI/tech imagery, neon, gradients, glass towers, neon
signage, anything with a laptop displaying code, anything with stock-photo
smiles directed at the camera.

---

## Adding videos to the site

Videos are loaded with a **lite-YouTube** pattern: the page renders a still
poster image and only contacts YouTube when a visitor clicks play. This keeps
the homepage fast and avoids setting third-party cookies on first paint.

### To add a video to the homepage

1. Find the video you want on YouTube (your own channel, your institution's
   channel, or one you have permission to embed).
2. Copy the eleven-character ID from the URL — for example, the ID in
   `https://www.youtube.com/watch?v=ABC123def45` is `ABC123def45`.
3. Open [`lib/media.ts`](../lib/media.ts) and paste the ID into the relevant
   slot — either `FEATURE_VIDEO_HERO.youtubeId` (the first video on the
   homepage) or `FEATURE_VIDEO_DESK.youtubeId` (the second).
4. While you're there, edit the `poster`, `caption`, and `attribution` to
   match the video.

That is the entire workflow. The component handles everything else.

### What to use for each video slot

The homepage has three configurable slots:

| Slot | Where it appears | Suggested content |
| --- | --- | --- |
| `FEATURE_VIDEO_HERO` | Homepage, after the editor's note | A 60–90s film about the platform: how Scholaria runs the autonomous review pipeline from intake to delivery. |
| `FEATURE_VIDEO_DESK` | Homepage, after the services teaser | A 2-minute editorial cut, "a day at the desk". Doctoral candidates working, the platform's outputs being read. No narration required. |
| `FEATURE_VIDEO_TESTIMONY` | Reserved for the About page | A doctoral candidate speaking on camera about their dissertation experience. |

### Self-hosted MP4s instead of YouTube

If you'd rather host your own MP4s (no YouTube branding, no analytics calls):

1. Drop the file into `public/videos/your-name.mp4`.
2. Open `components/feature-video.tsx` and swap the YouTube iframe for a
   `<video src="/videos/your-name.mp4" autoplay muted loop playsInline />`.
3. Comment out the YouTube ID check so the player loads on render.

The lite-YouTube pattern is the recommended default because it scales to any
length of video without storage cost.

---

## Trusted image sources

| Source | Notes |
| --- | --- |
| **Unsplash** ([unsplash.com](https://unsplash.com)) | Free, no attribution legally required. CDN whitelisted in `next.config.mjs`. |
| **Pexels images** ([pexels.com](https://pexels.com)) | Free photos. Note: Pexels MP4 files block hotlinking — use YouTube for video. |

## Curated Unsplash collections (open in a browser to pick from)

- "Books" — https://unsplash.com/s/photos/books
- "Library interior" — https://unsplash.com/s/photos/library-interior
- "Manuscript" — https://unsplash.com/s/photos/manuscript
- "Reading" — https://unsplash.com/s/photos/reading
- "University" — https://unsplash.com/s/photos/university

## URL format reference

```ts
// Unsplash — the photo ID is the segment after /photo- in the page URL
"https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=2200"

// YouTube ID — the eleven characters after v= or after youtu.be/
"ABC123def45"
```

## Attribution

All Unsplash content is licensed for commercial use without required
attribution. Scholaria still attributes inline (caption + credit column)
because it is editorial-press hygiene. For YouTube videos: use content you
own, have explicit permission to embed, or that allows public embedding
under its own license.
