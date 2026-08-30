---
title: "The Gap That Wasn't Supposed to Be There"
slug: "phantom-gap-safari-grid-bug"
date: "2026-08-31"
description: "A CSS grid on Telos looked fine everywhere except my own phone. Five fixes later, it turned out to be two separate Safari bugs stacked on top of each other."
tags: ["web dev", "css", "safari", "debugging", "telos"]
---

I spent most of a day chasing a bug that, as far as I can tell, doesn't exist anywhere on the internet. Not in a GitHub issue, not in a WebKit bug report, not in a random Stack Overflow answer from 2019. I only found it because I happened to have an iPhone in my pocket and a Mac to plug it into.

This is the story of that bug, mostly so that if you ever hit the same thing, you can skip the five hours I spent hitting everything else first.

## The setup

[Telos](/projects) has a compound library page: a grid of about 140 cards, one per compound, each with an icon, a name, a category, a little dose pill, and a two-line description clipped with Tailwind's `line-clamp-2`. Nothing exotic. A plain CSS grid, single column on mobile, `gap: 0.5rem` between rows.

I opened it on my phone one day and some of the cards had this big, ugly gap underneath them. Not all of them. Just some. Scroll past three normal cards, hit one with a gap that looked like a whole extra card's worth of empty space, then back to normal.

I reloaded. Same cards, same gaps, every time. I opened the same page in Chrome on my laptop, at the same width, forced into the same single-column layout. Perfectly uniform. Not one gap anywhere.

So it was Safari-only, and it was consistent, which made it feel solvable. It was not, immediately, solvable.

## Everything I tried that didn't work

**First guess: it's the long descriptions.** The cards with the worst gaps had noticeably longer description text than their neighbors. Made sense at the time, right? I'd already capped the description at `min-h-10` (a height floor) to keep card heights consistent across a row. My theory was that a *floor* still makes the browser measure the actual content to see if it's taller, and that measurement was somehow leaking into the gap. So I swapped it for a hard `h-10` instead.

Shipped it, waited for the deploy, reloaded on my phone. Same gaps, same cards, pixel for pixel.

**Second guess: it's the entrance animation.** Every card faded in with a small `framer-motion` transform on mount. I'd read that WebKit has a rough history with CSS grid and elements that carry a `transform`, specifically that a transformed grid item can throw off how a row's height gets calculated, even though `transform` isn't supposed to affect layout at all. So I moved the animation one level deeper, off the actual grid item and onto a plain wrapper's child instead.

Still broken. Exact same cards.

**Third guess: fine, kill the animation entirely.** If moving it wasn't enough, maybe no version of it was safe. I ripped `framer-motion` out of the shared list component completely. Zero transforms anywhere in that grid.

Still broken. At this point I'd eliminated three separate, individually reasonable theories, and the bug hadn't budged an inch. That's usually the moment you realize you've been debugging the wrong layer entirely.

## Actually getting real data

I was guessing at what Safari was doing instead of just asking it. So I plugged my phone into my Mac, opened Safari's remote inspector (Develop menu, pick the device, pick the tab), and ran a one-line script in the Console against the actual live page:

```js
const grid = [...document.querySelectorAll('div')]
  .find(d => getComputedStyle(d).display === 'grid');
[...grid.children].map(el => ({
  name: el.querySelector('h3')?.textContent,
  height: Math.round(el.getBoundingClientRect().height)
}));
```

This is the thing I should have done an hour in, not five fixes deep. It gave me actual numbers, from the actual device, instead of a screenshot I was squinting at.

The gap between every single card was a clean, uniform 8px. Every time. The row spacing had never been broken. What was different was each card's own *height*: 123px, 124px, then some cards at 143, 162, 181, even 200. And the step size between those was suspiciously close to one extra line of text at that font size. It tracked almost exactly with how long each card's description was.

Which sent me right back to `line-clamp-2`, the thing I'd already "fixed" in guess #1.

## What was actually going on

Turns out there were two bugs, not one, stacked on top of each other.

**Bug one:** Tailwind's `line-clamp-2` compiles down to the old WebKit hack, `display: -webkit-box` with `-webkit-line-clamp`. On my phone's build of Safari, pairing that with an explicit height didn't reliably cap anything. Longer text just kept growing the box, proportional to how much text there was, height property or not. So I ripped out `line-clamp` everywhere in the app and replaced it with a plain fixed height plus `overflow: hidden`. No ellipsis at the cut-off point, but it's unambiguous. Every browser respects a fixed height and overflow, no legacy box model involved.

I measured the actual `<button>` for the card directly after that change: 123px, exactly right. Good.

Except the *grid item wrapping it* was still 162px.

**Bug two,** and the one that actually explains the title of this post: even with the description correctly clipped to 40px on screen, its natural, un-clipped content still wanted 95px (`scrollHeight` told me that much). And whatever Safari's grid engine uses to decide how tall an `auto` row should be seems to be looking at that unclipped 95px number, not the 40px that's actually painted. The card renders exactly right. The invisible box the grid allocated around it doesn't match, and the leftover space just sits there, silently, below the card, looking exactly like a layout bug even though every element inside it is behaving.

I tried one more targeted fix before giving up on being clever about it: CSS containment (`contain: layout paint`) on the grid item, which is supposed to stop a descendant's content from being able to influence how an ancestor gets measured. Reasonable idea, and it's a pattern the app already used elsewhere. Didn't work either. Confirmed with a fresh, timestamped console check to rule out me just looking at a stale cached build for the fifth time.

## The actual fix

At that point every card's real height was fully deterministic. Fixed-size icon, single-line truncated name and category, and now a hard-clipped description. There was no reason for the row height to be `auto` in the first place, since nothing in it could legitimately vary.

So instead of trying to convince Safari to measure things correctly, I just took the measurement away from it entirely:

```diff
- grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3
+ grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-[128px]
```

Pin the row track to a fixed pixel value, and there's no `auto` sizing pass left for the bug to hide in. Reloaded, ran the same console check, and this time the grid item and the button matched. 123 and 123.

<figure class="phantom-fig">
  <svg viewBox="0 0 640 260" role="img" aria-label="Diagram of a nested box: a grid item that Safari measured at 162 pixels, containing a card that correctly renders at 123 pixels, containing a description paragraph clipped on screen to 40 pixels but with 95 pixels of unclipped content sitting underneath it. The gap between the grid item's boundary and the card's actual bottom edge is the phantom 39 pixels that showed up as a visual gap.">
    <rect x="10" y="10" width="620" height="240" rx="10" fill="none" stroke="var(--accent-orange)" stroke-width="1.6" stroke-dasharray="4 4"></rect>
    <text x="26" y="34" class="phantom-fig-label" fill="var(--accent-orange)">grid item, Safari measured this at 162px</text>
    <rect x="30" y="50" width="580" height="160" rx="6" fill="none" stroke="var(--text-primary)" stroke-width="1.4"></rect>
    <text x="46" y="72" class="phantom-fig-label" fill="var(--text-primary)">the &lt;button&gt; card, actually renders at 123px</text>
    <rect x="50" y="88" width="540" height="34" rx="4" fill="none" stroke="var(--text-tertiary)" stroke-width="1.1"></rect>
    <text x="66" y="109" class="phantom-fig-note">icon, name, category, dose pill</text>
    <rect x="50" y="132" width="540" height="34" rx="4" fill="var(--accent-emerald-soft)" stroke="var(--accent-emerald)" stroke-width="1.4"></rect>
    <text x="66" y="153" class="phantom-fig-note" fill="var(--accent-emerald)">description, clipped to 40px on screen ✓</text>
    <line x1="592" y1="132" x2="592" y2="210" stroke="var(--accent-orange)" stroke-width="1.4"></line>
    <line x1="586" y1="132" x2="598" y2="132" stroke="var(--accent-orange)" stroke-width="1.4"></line>
    <line x1="586" y1="210" x2="598" y2="210" stroke="var(--accent-orange)" stroke-width="1.4"></line>
    <text x="606" y="175" class="phantom-fig-note" fill="var(--accent-orange)" transform="rotate(90 606 175)">≈39px</text>
  </svg>
  <figcaption>The card and the text inside it both render at the right size. The extra space sits between the button's real bottom edge and wherever Safari decided the row needed to end, and it appears to be sizing that boundary off the unclipped content, not the clipped one.</figcaption>
</figure>

<figure class="phantom-fig">
  <svg viewBox="0 0 720 190" role="img" aria-label="Bar chart of five real card heights measured on the device: 124, 143, 162, 181, and 200 pixels, climbing in steps of about 19 pixels, roughly one text line each, tracking with each card's description length.">
    <line x1="50" y1="150" x2="620" y2="150" stroke="var(--border)" stroke-width="1"></line>
    <line x1="50" y1="20" x2="50" y2="150" stroke="var(--border)" stroke-width="1"></line>
    <line x1="50" y1="112" x2="620" y2="112" stroke="var(--accent-emerald)" stroke-width="1" stroke-dasharray="4 4" opacity="0.6"></line>
    <text x="630" y="116" class="phantom-fig-note" fill="var(--accent-emerald)">baseline</text>
    <g text-anchor="middle">
      <g transform="translate(110,0)">
        <rect x="-30" y="112" width="60" height="38" fill="var(--accent-emerald)" opacity="0.55" rx="2"></rect>
        <text x="0" y="105" class="phantom-fig-bar-label">124</text>
      </g>
      <g transform="translate(220,0)">
        <rect x="-30" y="88" width="60" height="62" fill="var(--accent-orange)" opacity="0.5" rx="2"></rect>
        <text x="0" y="81" class="phantom-fig-bar-label">143</text>
      </g>
      <g transform="translate(330,0)">
        <rect x="-30" y="60" width="60" height="90" fill="var(--accent-orange)" opacity="0.65" rx="2"></rect>
        <text x="0" y="53" class="phantom-fig-bar-label">162</text>
      </g>
      <g transform="translate(440,0)">
        <rect x="-30" y="32" width="60" height="118" fill="var(--accent-orange)" opacity="0.8" rx="2"></rect>
        <text x="0" y="25" class="phantom-fig-bar-label">181</text>
      </g>
      <g transform="translate(550,0)">
        <rect x="-30" y="20" width="60" height="130" fill="var(--accent-orange)" opacity="0.95" rx="2"></rect>
        <text x="0" y="13" class="phantom-fig-bar-label">200</text>
      </g>
    </g>
  </svg>
  <figcaption>Real numbers straight off <code>getBoundingClientRect()</code>, run on the actual device. Each step is roughly one line of text, the clue that pointed back at <code>line-clamp</code>, and then past it to the grid itself.</figcaption>
</figure>

<style>
  .phantom-fig {
    margin: var(--space-2xl) 0;
    padding: var(--space-lg);
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
  }
  .phantom-fig svg { width: 100%; height: auto; display: block; }
  .phantom-fig figcaption {
    margin-top: var(--space-md);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--text-tertiary);
    line-height: 1.6;
  }
  .phantom-fig-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11.5px;
    font-weight: 500;
  }
  .phantom-fig-note {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    fill: var(--text-secondary, #525252);
  }
  .phantom-fig-bar-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    fill: var(--text-primary, #1a1a1a);
  }
</style>

## What I took away from this

A browser that just quietly refuses to reproduce your bug isn't a coincidence you can wave off, it's information. I burned three fixes assuming Chrome working meant my code was fine and the problem had to be somewhere I hadn't looked yet on the Safari side specifically, which was true, just not in the place I kept guessing.

Also: measure the thing the bug is actually in, not the thing that's easiest to check. I checked the card's visible content three separate times and it was correct every single time. The bug was one level up, in a box with no border, no background, and nothing rendered inside it to give it away.

And `-webkit-line-clamp` is apparently just not safe to pair with an explicit height on some versions of Safari. If you're clamping text inside anything remotely complex, a plain fixed height with `overflow: hidden` is more boring but it will not lie to you.

Anyway, the grid is fixed now, and I have a new appreciation for Safari's remote inspector, which I'd genuinely never opened before this week.
