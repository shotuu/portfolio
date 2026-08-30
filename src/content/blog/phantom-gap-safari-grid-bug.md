---
title: "The 39 Pixels That Shouldn't Exist"
slug: "phantom-gap-safari-grid-bug"
date: "2026-08-31"
description: "A card grid in Telos looked perfect on every device except the one in my own pocket. Five failed fixes and a very late night with Safari's remote inspector later, I found exactly where the missing 39 pixels were hiding."
tags: ["web dev", "css", "safari", "debugging", "telos"]
---

It was close to midnight and I was doing the thing every developer does right before bed: scrolling through their own app, half looking for bugs, half just admiring the thing they built. I found a bug. One of the cards in my compound library had what looked like an entire extra card's worth of empty space sitting underneath it, for absolutely no reason I could see.

I closed the app, told myself I'd look at it in the morning, and then obviously did not do that. I stayed up chasing it instead, and it took most of the next day too. As far as I can tell, this exact bug isn't written down anywhere: not in a GitHub issue, not in a WebKit bug report, not in some forgotten Stack Overflow answer from 2019. I only found the actual cause because I happened to own an iPhone and a Mac to plug it into, which turned out to be the whole trick.

This is that story, mostly so that if you ever run into the same thing, you can skip straight past the five things I tried that didn't work.

## The setup

[Telos](/projects) has a compound library page: a grid of about 140 cards, one per compound, each with an icon, a name, a category, a little dose pill, and a two-line description clipped with Tailwind's `line-clamp-2`. There's nothing exotic going on here. It's a plain CSS grid, single column on mobile, `gap: 0.5rem` between rows, the kind of layout you build without thinking twice about it.

Except some of the cards had this gap underneath them that didn't belong. Not all of them, just some, scattered through the list with no obvious pattern. Scroll past three completely normal cards, hit one with a gap the size of a missing card, then back to normal like nothing happened.

<figure class="phantom-fig">
  <svg viewBox="0 0 680 230" role="img" aria-label="Side by side comparison: a grid of four cards with perfectly even 8 pixel gaps between all of them on the left, labeled what I expected, versus a grid on the right labeled what Safari showed me, where one card sits inside a dashed box much taller than the card itself, leaving a large unexplained gap below it.">
    <text x="10" y="24" class="phantom-fig-label" fill="var(--text-secondary)">what I expected</text>
    <rect x="10" y="36" width="290" height="34" rx="5" fill="none" stroke="var(--text-primary)" stroke-width="1.3"></rect>
    <rect x="10" y="78" width="290" height="34" rx="5" fill="none" stroke="var(--text-primary)" stroke-width="1.3"></rect>
    <rect x="10" y="120" width="290" height="34" rx="5" fill="none" stroke="var(--text-primary)" stroke-width="1.3"></rect>
    <rect x="10" y="162" width="290" height="34" rx="5" fill="none" stroke="var(--text-primary)" stroke-width="1.3"></rect>
    <line x1="335" y1="10" x2="335" y2="220" stroke="var(--border)" stroke-width="1"></line>
    <text x="360" y="24" class="phantom-fig-label" fill="var(--accent-orange)">what Safari showed me</text>
    <rect x="360" y="36" width="290" height="34" rx="5" fill="none" stroke="var(--text-primary)" stroke-width="1.3"></rect>
    <rect x="360" y="78" width="290" height="74" rx="5" fill="none" stroke="var(--accent-orange)" stroke-width="1.5" stroke-dasharray="3 3"></rect>
    <rect x="360" y="78" width="290" height="34" rx="5" fill="none" stroke="var(--text-primary)" stroke-width="1.3"></rect>
    <rect x="360" y="150" width="290" height="34" rx="5" fill="none" stroke="var(--text-primary)" stroke-width="1.3"></rect>
    <rect x="360" y="192" width="290" height="34" rx="5" fill="none" stroke="var(--text-primary)" stroke-width="1.3"></rect>
    <text x="505" y="128" text-anchor="middle" class="phantom-fig-note" fill="var(--accent-orange)">empty, unexplained</text>
  </svg>
  <figcaption>Same markup, same CSS, two different browsers. Chrome rendered the left side, every time. My phone rendered the right side, every time, on the same three or four cards, no matter how many times I reloaded.</figcaption>
</figure>

I reloaded a dozen times just to be sure. Same cards, same size gaps, every single time, which was almost more frustrating than if it had been random. Then I opened the same page in Chrome, forced it into the exact same single-column width, and got nothing. Perfectly even spacing, top to bottom, not one gap anywhere.

Safari-only and completely consistent. That combination should have made it easy. It did not.

## Everything I tried that didn't work

Here's the shape of the next several hours, before I get into it properly:

<figure class="phantom-fig">
  <svg viewBox="0 0 700 100" role="img" aria-label="A timeline of six things tried in order: raise the clamp height, move the animation, remove the animation entirely, and try CSS containment, all marked as failures in orange, replace line clamp marked as a partial fix in blue, and finally pin the row height marked as the real fix in green.">
    <line x1="50" y1="40" x2="650" y2="40" stroke="var(--border)" stroke-width="1.5"></line>
    <circle cx="50" cy="40" r="16" fill="var(--accent-orange-soft)" stroke="var(--accent-orange)" stroke-width="1.6"></circle>
    <text x="50" y="45" text-anchor="middle" class="phantom-fig-bar-label" fill="var(--accent-orange)">1</text>
    <circle cx="170" cy="40" r="16" fill="var(--accent-orange-soft)" stroke="var(--accent-orange)" stroke-width="1.6"></circle>
    <text x="170" y="45" text-anchor="middle" class="phantom-fig-bar-label" fill="var(--accent-orange)">2</text>
    <circle cx="290" cy="40" r="16" fill="var(--accent-orange-soft)" stroke="var(--accent-orange)" stroke-width="1.6"></circle>
    <text x="290" y="45" text-anchor="middle" class="phantom-fig-bar-label" fill="var(--accent-orange)">3</text>
    <circle cx="410" cy="40" r="16" fill="var(--accent-blue-soft)" stroke="var(--accent-blue)" stroke-width="1.6"></circle>
    <text x="410" y="45" text-anchor="middle" class="phantom-fig-bar-label" fill="var(--accent-blue)">4</text>
    <circle cx="530" cy="40" r="16" fill="var(--accent-orange-soft)" stroke="var(--accent-orange)" stroke-width="1.6"></circle>
    <text x="530" y="45" text-anchor="middle" class="phantom-fig-bar-label" fill="var(--accent-orange)">5</text>
    <circle cx="650" cy="40" r="19" fill="var(--accent-emerald-soft)" stroke="var(--accent-emerald)" stroke-width="2"></circle>
    <text x="650" y="46" text-anchor="middle" class="phantom-fig-bar-label" fill="var(--accent-emerald)">6</text>
    <text x="650" y="78" text-anchor="middle" class="phantom-fig-note" fill="var(--accent-emerald)">the fix</text>
  </svg>
  <figcaption>1: raise the clamp height. 2: move the entrance animation off the grid item. 3: remove the animation entirely. 4: replace line-clamp outright, orange everywhere except this one, which actually mattered, just not enough by itself. 5: try CSS containment. 6: stop letting Safari measure the row at all. That's the one that worked.</figcaption>
</figure>

**First guess: it's the long descriptions.** The worst gaps sat under cards with noticeably longer text than their neighbors, and that felt like enough of a pattern to chase. I'd already capped the description at `min-h-10`, a height floor, to keep card heights consistent across a row, so my theory was that a floor still forces the browser to measure the real content to check whether it's taller, and that measurement was somehow leaking out into the gap below. I swapped it for a hard `h-10` instead, shipped it, waited for the deploy, reloaded on my phone with actual hope that I was done.

Same gaps. Same cards. Pixel for pixel, nothing had changed.

**Second guess: it's the entrance animation.** Every card faded in with a small `framer-motion` transform on mount, and I'd read that WebKit has a rough history with CSS grid items that carry a `transform`, specifically that a transformed grid item can throw off how a row's height gets calculated, even though `transform` isn't supposed to touch layout at all. So I moved the animation one level deeper, off the actual grid item and onto a plain wrapper's child, which felt like a genuinely clever fix at the time.

Still broken. Exact same cards, exact same size.

**Third guess, and I was getting a little annoyed by now: fine, kill the animation entirely.** If moving it one level in wasn't enough, maybe no version of it was safe, so I ripped `framer-motion` out of the shared list component completely. Zero transforms, anywhere, in that whole grid.

Still broken. Three separate, individually reasonable theories, each one shipped and verified live, and the bug hadn't moved an inch. That's usually the point where you realize you've been debugging the wrong layer of the problem entirely, and I was pretty sure that's where I was, I just didn't know which layer yet.

## Actually getting real data

I was guessing at what Safari was doing instead of just asking it, which in hindsight is an embarrassing amount of time to spend not asking the one machine that actually knew the answer. So I plugged my phone into my Mac, opened Safari's remote inspector (Develop menu, pick the device, pick the tab), and ran a one-line script in the Console against the live page:

```js
const grid = [...document.querySelectorAll('div')]
  .find(d => getComputedStyle(d).display === 'grid');
[...grid.children].map(el => ({
  name: el.querySelector('h3')?.textContent,
  height: Math.round(el.getBoundingClientRect().height)
}));
```

This is what I should have done an hour in, not three fixes deep. It handed me real numbers straight from the device, instead of another screenshot I was squinting at on my laptop trying to eyeball pixel counts.

The gap between every single card, it turned out, was a clean uniform 8px, everywhere, with no exceptions. The row spacing had never actually been the problem. What varied was each card's own height: 123px here, 124px there, then a scattering of cards sitting at 143, 162, 181, even 200. And the size of each jump lined up almost exactly with one extra line of text at that font size, which tracked suspiciously well with how long each card's description happened to be.

Which sent me right back to `line-clamp-2`. The thing I'd already "fixed" in guess number one.

## What was actually going on

Turns out there were two separate bugs stacked on top of each other, and I'd only been fixing at the seam between them.

**Bug one:** Tailwind's `line-clamp-2` compiles down to an old WebKit hack, `display: -webkit-box` paired with `-webkit-line-clamp`. On my phone's build of Safari, combining that with an explicit height didn't reliably cap anything at all. Longer text just kept growing the box, proportional to how much text there was, height property or not. So I ripped `line-clamp` out everywhere in the app and replaced it with a plain fixed height plus `overflow: hidden`. You lose the ellipsis at the cut-off point, but it's unambiguous: every browser respects a fixed height and an overflow rule, no legacy box model involved anywhere.

I measured the actual `<button>` for the card right after shipping that change, and it came back at 123px. Exactly right. For about ten minutes I thought I was finally done.

Then I checked the grid item wrapping it, and it was still 162px.

**Bug two,** and this is the one that actually explains the number in the title: even with the description correctly clipped to 40px on screen, its natural, un-clipped content still wanted 95px of space, which `scrollHeight` was happy to confirm. Whatever Safari's grid engine uses to decide how tall an `auto` row should be seemed to be looking at that unclipped 95px figure, not the 40px that was actually painted on screen. The card itself rendered exactly right. The invisible box the grid built around it didn't match, and the leftover space just sat there quietly below the card, looking exactly like a layout bug even though every single element inside it was behaving perfectly.

I had one more idea before I let myself accept how strange this was. CSS containment, `contain: layout paint`, on the grid item, which is supposed to stop a descendant's content from being able to influence how an ancestor gets measured. It's a reasonable technique, and one the app already used elsewhere for exactly this kind of isolation. I shipped it, confirmed with a fresh, timestamped console check that I wasn't just staring at a stale cached build for the fifth time, and it changed nothing.

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

## The actual fix

By this point every card's real height was fully deterministic. Fixed-size icon, single-line truncated name and category, and now a properly hard-clipped description. There was no legitimate reason left for the row height to be `auto` at all, since nothing inside the card could actually vary anymore.

So instead of trying, yet again, to convince Safari to measure things correctly, I just took the measurement away from it entirely:

```diff
- grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3
+ grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-[128px]
```

Pin the row track to a fixed pixel value and there's no `auto` sizing pass left for the bug to hide inside. I reloaded, ran the same console check one more time, and this time the grid item and the button finally matched: 123 and 123.

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

A browser that just quietly refuses to reproduce your bug isn't a coincidence you get to wave off. It's information. I burned three separate fixes assuming that Chrome working meant my code had to be fine, and the problem had to be somewhere I just hadn't looked yet on the Safari side. That part was true. I just kept guessing at the wrong place to look.

There's a second lesson buried in there too: measure the thing the bug is actually in, not the thing that's easiest to check. I checked the card's visible content three separate times, and it was correct every single time, which is exactly why it took so long. The real bug was one level up, sitting inside a box with no border, no background, and nothing rendered inside it to give away that it even existed.

And, more narrowly, `-webkit-line-clamp` is apparently just not safe to pair with an explicit height on some builds of Safari. If you're clamping text inside anything remotely complex, a plain fixed height with `overflow: hidden` is more boring to look at, but it will not quietly lie to you six months later at midnight.

Anyway. The grid is fixed now, the app looks the same on every device I own, and I have a genuinely new appreciation for Safari's remote inspector, which I'd never once opened before this week and will absolutely be reaching for again.
