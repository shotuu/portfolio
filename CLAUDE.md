# This repo

Daniel Wu's personal portfolio site. Astro 5, static output, deployed to
GitHub Pages on every push to `main`. Blog posts live in
`src/content/blog/*.md`, styling is one global stylesheet at
`src/styles/global.css` plus scoped `<style>` blocks in each `.astro`
component.

## Writing a blog post

Read this section before drafting any post in `src/content/blog/`. It's
distilled from what actually worked (and what had to be revised) writing
`phantom-gap-safari-grid-bug.md`, Daniel's first real technical post here.
Read `hello-world.md` too, it's the baseline for voice, and this section is
the baseline for everything past voice: structure, storytelling, figures,
and the technical mechanics of embedding SVG diagrams in a `.md` file on
this stack.

### Voice

First person, as Daniel. Contractions everywhere. Casual register, the way
someone actually talks when they're excited to explain something, not the
way a report gets written. Short asides are good ("which in hindsight is an
embarrassing amount of time to spend..."). Self-deprecating humor about your
own dead-end theories lands well and keeps a technical post feeling human.

Avoid: corporate postmortem language (no "TL;DR" boxes, no "verdict"
badges, no formal "Root Cause" section headers stripped of personality),
academic hedging, and anything that reads like it was assembled from a
template. If a sentence could appear unchanged in an incident report from
any company, rewrite it.

### Structure

`## `-headed sections in plain Markdown. A short, scene-setting opening
before the first heading (no header on the intro itself, matching
`hello-world.md`). A casual, lightly personal sign-off at the end, not a
summary paragraph that restates what was just said.

Think of the whole post as having a shape, not just a sequence of facts:

1. **Hook**: open on a specific moment, not a topic sentence. "It was close
   to midnight and I was scrolling through my own app" beats "I found a bug
   in my app recently." A hook is one or two short paragraphs, not a
   preamble.
2. **Setup**: establish what the reader needs to understand the stakes,
   what you built, what broke, why it was confusing. This is a good place
   for your first figure, so the post has a visual within the first screen.
3. **Rising action / complications**: the things you tried that didn't
   work. Let the attempts escalate in tone, mild confidence on the first
   one, visible frustration by the third or fourth. This section should NOT
   read as a flat, evenly-paced list. Vary paragraph length, mix a longer
   discursive paragraph with a short one-line gut-punch ("Still broken.
   Same cards.").
4. **Turning point**: the moment something actually changed, ideally
   because you did something different (got real data, asked someone,
   changed your approach), not just because you got lucky on attempt N.
5. **Resolution**: the actual root cause and fix, explained clearly. This
   is where precision matters most; don't sacrifice technical accuracy for
   narrative flair here.
6. **Close**: a short, personal wind-down. One or two sentences. Don't
   summarize the post; that's what the meta `description` frontmatter field
   is for.

### Titles

A title should hang on one specific, curiosity-driving detail: a real
number, a strange fact, a concrete image, something that makes a reader
think "wait, what?" rather than "oh, a post about X." Compare:

- Flat: "The Gap That Wasn't Supposed to Be There" (generic, this is the
  actual before from revising this post's own title, keep it as the
  cautionary example)
- Better: "The 39 Pixels That Shouldn't Exist" (the real number from the
  story, specific and slightly strange)

Don't oversell or misrepresent the content to get a click. The intrigue
should come from an accurate, specific detail, not a vague tease.

### Prose rhythm

This is the single most common tell that a paragraph was AI-written: a run
of same-length declarative sentences back to back, each stating one fact,
with no variation in rhythm. Real example that had to be fixed in this exact
post:

> Before: "The row spacing had never been broken. What was different was
> each card's own height. It tracked almost exactly with how long each
> card's description was."
>
> After: "The row spacing had never actually been the problem. What varied
> was each card's own height: 123px here, 124px there, then a scattering of
> cards sitting at 143, 162, 181, even 200. And the size of each jump lined
> up almost exactly with one extra line of text at that font size, which
> tracked suspiciously well with how long each card's description happened
> to be."

Notice the after version varies sentence length, uses a colon to build a
list into a sentence instead of a separate one, and ends on a longer,
winding sentence instead of another short declarative. Read every paragraph
back and ask whether three sentences in a row are roughly the same length
and shape. If so, combine some, split others, or add a subordinate clause.
Short sentences are still good, used deliberately for emphasis or a
punchline, not as the default unit of the whole post.

### Figures

Use 3-5 figures per post, spread through the piece rather than clustered
near the end. A post that's all text until the very bottom feels like a
wall to scroll through. Each figure should show a real mechanism,
comparison, or dataset from the actual story, never a generic decorative
graphic (depict the mechanism, not its name).

Diversify figure *type* across a post instead of repeating the same shape
four times:

- **Comparison**: two states side by side (expected vs. actual, before vs.
  after). Good early in a post, sets up the mystery visually before the
  prose explains it.
- **Mechanism / nested-box diagram**: for explaining *where* something
  lives structurally (which element, which layer). Good at the root-cause
  moment.
- **Data / bar chart**: real numbers you actually measured, not invented
  ones. Always caption with where the numbers came from.
- **Process / timeline**: a short horizontal sequence of steps or attempts,
  each marked with an outcome (color-coded). Good for pacing a
  "things I tried" section without making the reader read five identical
  paragraph shapes in a row.

Every figure needs a `<figcaption>` that states the one claim it's making.
Use `role="img"` and a real `aria-label` on the `<svg>` describing what it
shows, for readers who can't see it.

### Technical mechanics (Astro + this repo specifically)

- Posts are plain Markdown (`.md`, not `.mdx`) in `src/content/blog/`, one
  file per post, picked up automatically by `src/pages/blog/index.astro`
  and `src/pages/blog/[slug].astro` via `import.meta.glob`. Frontmatter
  shape: `title`, `slug`, `date` (`"YYYY-MM-DD"`), `description`, `tags`
  (array of short lowercase strings). `slug` drives the URL, don't change
  it on an already-published post, only `title`.
- Raw HTML (including inline `<svg>`) passes through fine in these `.md`
  files, Astro's default markdown pipeline doesn't sanitize it. **But: a
  blank line inside a raw HTML block breaks it.** CommonMark's HTML-block
  parser stops at the first blank line inside an HTML block, and everything
  after that point gets parsed as ordinary Markdown instead, which means
  your remaining SVG tags render as literal escaped text on the page. This
  bit every figure in the phantom-gap post on the first pass. Keep every
  line from `<figure>` to `</figure>` (and `<style>` to `</style>`)
  completely blank-line-free, no readability blank lines between SVG
  element groups, even though that's tempting.
- SVG text labels clip silently if they run past the `viewBox` bounds. SVG
  overflows are clipped by default, with no console warning. When a label
  might be long, either give it enough margin, use `text-anchor="end"`
  positioned inside the safe area, or just shorten the label and put the
  detail in the `<figcaption>` instead (the figcaption is prose, it can
  always fit more than an SVG label can).
- Theme figures with the site's real CSS custom properties from
  `src/styles/global.css`: `var(--text-primary)`, `var(--text-secondary)`,
  `var(--accent-blue)` / `--accent-orange` / `--accent-emerald` /
  `--accent-violet` (each has a `-soft` variant for fills), `var(--border)`,
  `var(--bg-secondary)`. Don't invent a separate color palette for
  figures; they need to respond correctly to the site's existing
  light/dark toggle (`[data-theme="dark"]`), and using the real tokens
  makes that automatic. For the monospace label font inside SVG `<text>`,
  hardcode `font-family: 'JetBrains Mono', monospace` directly (CSS custom
  properties aren't always reliably inherited into SVG text at build time
  the same way colors are) rather than relying on `var(--font-mono)` alone.
- Code blocks are fenced normally and Shiki (configured for
  `github-light`/`github-dark`) highlights them automatically, no manual
  styling needed. Use ` ```diff ` with `-`/`+` prefixed lines for
  before/after code changes, Shiki renders these with real red/green
  diff coloring in both themes for free.
- **Before considering a post done, actually build and look at it:**
  `npx astro build && npx astro preview`, then load the page in a browser
  and scroll through every figure. Markdown-with-embedded-SVG has failure
  modes (the blank-line issue above, label clipping) that don't show up as
  build errors or warnings; the build succeeds and the page just quietly
  renders wrong. A clean `astro build` is not sufficient evidence that a
  post's figures are correct.
