---
title: "The Webview That Lied About Having a Touchscreen"
slug: "tauri-macos-phantom-touch-bug"
date: "2026-09-14"
description: "Buttons in Synth would hover perfectly on macOS and then just refuse to click, with no error and no pattern I could find. The actual cause was my desktop app's webview quietly insisting it was running on a touchscreen."
tags: ["tauri", "macos", "webkit", "debugging", "synth"]
---

I was trying to close a dropdown in [Synth](/projects) so I could start recording a meeting, and the dropdown would not close. Not "closed and reopened," not "threw an error in the console." Nothing happened at all. The menu item lit up under my cursor exactly the way it was supposed to, I clicked it, and it just sat there, glowing, completely unbothered by the fact that I had clicked it.

I clicked it again. Same thing. I moved the mouse away and back, watched the hover state come and go correctly, clicked a third time, and finally it worked, like nothing had ever been wrong. That inconsistency is what got under my skin. A button that never works is a bug. A button that works two times out of three, with the exact same click, on the exact same machine, felt like something else.

## The setup

Synth is a Tauri desktop app, which means the whole UI is a real webview (WKWebView on macOS) wrapping a Next.js frontend, with Radix underneath most of the interactive pieces: the recording controls dropdown, the model picker, the meeting list's context menu, dialogs for renaming a meeting or picking an export format. None of it is exotic. It's the same component library plenty of web apps ship, just running inside a native window instead of a browser tab.

The bug didn't care which of those components it hit. Dropdown items, select options, dialog buttons, all of them would occasionally just decline to register a click, while looking, in every visible way, like they'd registered it fine.

<figure class="touch-fig">
  <svg viewBox="0 0 680 220" role="img" aria-label="Side by side comparison: on the left, a dropdown menu item under the cursor with a highlighted hover background and a check mark labeled visual state correct. On the right, an identical menu item and cursor, but instead of a check mark there is an X labeled click silently ignored, with no console error shown.">
    <text x="10" y="24" class="touch-fig-label" fill="var(--text-secondary)">what the screen showed</text>
    <rect x="10" y="40" width="290" height="150" rx="8" fill="none" stroke="var(--border)" stroke-width="1.3"></rect>
    <rect x="26" y="60" width="258" height="34" rx="5" fill="var(--accent-blue-soft)" stroke="var(--accent-blue)" stroke-width="1.4"></rect>
    <text x="42" y="82" class="touch-fig-note" fill="var(--text-primary)">Export Summary</text>
    <circle cx="255" cy="77" r="12" fill="none" stroke="var(--accent-emerald)" stroke-width="2"></circle>
    <path d="M 249 77 L 254 82 L 262 71" fill="none" stroke="var(--accent-emerald)" stroke-width="2"></path>
    <text x="42" y="140" class="touch-fig-note" fill="var(--text-tertiary)">hover, focus, highlight: all correct</text>
    <line x1="340" y1="20" x2="340" y2="200" stroke="var(--border)" stroke-width="1"></line>
    <text x="370" y="24" class="touch-fig-label" fill="var(--accent-orange)">what actually happened</text>
    <rect x="370" y="40" width="290" height="150" rx="8" fill="none" stroke="var(--border)" stroke-width="1.3"></rect>
    <rect x="386" y="60" width="258" height="34" rx="5" fill="var(--accent-blue-soft)" stroke="var(--accent-blue)" stroke-width="1.4"></rect>
    <text x="402" y="82" class="touch-fig-note" fill="var(--text-primary)">Export Summary</text>
    <circle cx="615" cy="77" r="12" fill="none" stroke="var(--accent-orange)" stroke-width="2"></circle>
    <path d="M 609 71 L 621 83 M 621 71 L 609 83" stroke="var(--accent-orange)" stroke-width="2"></path>
    <text x="402" y="140" class="touch-fig-note" fill="var(--accent-orange)">click: silently ignored</text>
    <text x="402" y="158" class="touch-fig-note" fill="var(--text-tertiary)">no console error, no event fired</text>
  </svg>
  <figcaption>Both states came from the exact same component, the exact same click, seconds apart. Nothing in the visible UI or the console distinguished the click that worked from the one that didn't.</figcaption>
</figure>

## Everything I blamed first

<figure class="touch-fig">
  <svg viewBox="0 0 700 100" role="img" aria-label="A timeline of five things tried in order: check for an invisible overlay, audit z-index stacking, look for stale event listeners after re-render, add key props to force remounts, all marked as failures in orange, and finally identify the phantom touch capability marked as the real fix in green.">
    <line x1="50" y1="40" x2="650" y2="40" stroke="var(--border)" stroke-width="1.5"></line>
    <circle cx="50" cy="40" r="16" fill="var(--accent-orange-soft)" stroke="var(--accent-orange)" stroke-width="1.6"></circle>
    <text x="50" y="45" text-anchor="middle" class="touch-fig-bar-label" fill="var(--accent-orange)">1</text>
    <circle cx="196" cy="40" r="16" fill="var(--accent-orange-soft)" stroke="var(--accent-orange)" stroke-width="1.6"></circle>
    <text x="196" y="45" text-anchor="middle" class="touch-fig-bar-label" fill="var(--accent-orange)">2</text>
    <circle cx="342" cy="40" r="16" fill="var(--accent-orange-soft)" stroke="var(--accent-orange)" stroke-width="1.6"></circle>
    <text x="342" y="45" text-anchor="middle" class="touch-fig-bar-label" fill="var(--accent-orange)">3</text>
    <circle cx="488" cy="40" r="16" fill="var(--accent-orange-soft)" stroke="var(--accent-orange)" stroke-width="1.6"></circle>
    <text x="488" y="45" text-anchor="middle" class="touch-fig-bar-label" fill="var(--accent-orange)">4</text>
    <circle cx="650" cy="40" r="19" fill="var(--accent-emerald-soft)" stroke="var(--accent-emerald)" stroke-width="2"></circle>
    <text x="650" y="46" text-anchor="middle" class="touch-fig-bar-label" fill="var(--accent-emerald)">5</text>
    <text x="650" y="78" text-anchor="middle" class="touch-fig-note" fill="var(--accent-emerald)">the fix</text>
  </svg>
  <figcaption>1: hunt for an invisible overlay. 2: audit z-index across every layered component. 3: chase stale listeners left behind by re-renders. 4: force remounts with fresh keys. Orange all the way through, until the inspector accidentally handed me the actual clue.</figcaption>
</figure>

**First theory: something invisible is sitting on top of the button.** This is the classic explanation for a hover-but-no-click bug, so I went looking for it first. I inspected the DOM at the exact coordinates of a failed click, checked for a stray `Portal` container left mounted after a dialog closed, even added a temporary `outline: 2px solid red` to every fixed and absolutely positioned element on the page to see if anything unexpected lit up. Nothing was there. The element under the cursor was, every single time, the button I was trying to click.

**Second theory: it's a z-index war.** Radix stacks portals, popovers, and dropdowns in a way that can get genuinely tangled if you're not careful, so I spent a while auditing every `z-index` value in the app, looking for two things that could plausibly be fighting over the same click. I found one legitimately sloppy value and fixed it. The bug didn't care.

**Third theory, and I remember being fairly confident about this one: stale event listeners.** Synth's recording controls re-render a lot, tied to live transcript state, and I've been bitten before by a `useEffect` that attaches a listener without cleaning up the previous one, leaving two handlers arguing over the same click. I went through every dropdown-adjacent `useEffect` in the app, added cleanup functions everywhere I could justify one, even where I was pretty sure it hadn't been the problem.

Still broken. Same menus, same maddening one-in-three failure rate.

**Fourth theory: fine, force a clean remount.** If some stale closure was haunting a component instance, a fresh `key` prop would kill it and start over. I added keys tied to open/close state on the worst-offending dropdowns, shipped it, and clicked through the app for a good twenty minutes specifically trying to make it fail.

It still failed. Four separate, individually reasonable theories, each one implemented and tested, and the actual behavior of the bug hadn't shifted by a single click. At that point I was fairly sure I'd been debugging the wrong layer of the app entirely, I just had no idea which layer was the right one.

## The clue that actually meant something

I opened Safari's Web Inspector on the WKWebView, mostly out of habit, to poke at the DOM one more time while a failure was fresh. And the bug stopped. Buttons I'd just watched fail to click, twice in a row, started working the instant the inspector was attached, and kept working for as long as it stayed open.

That's a strange thing to notice, because it isn't really a fix. Nothing about opening a devtools panel should change whether a click event fires. But it was the first piece of information in this whole chase that pointed somewhere specific: not at my component tree, not at a stray CSS rule, but at something happening underneath the DOM entirely, in however WebKit itself was tracking input state. Attaching the inspector was clearly resetting something. I just needed to find out what.

## What was actually happening

The something turned out to be `navigator.maxTouchPoints`, or more precisely, WKWebView's answer to it. On macOS, Tauri's webview can misreport itself as touch-capable, even on a machine with no touchscreen anywhere near it, a mouse-and-trackpad Mac like the one I was testing on. There's an open, still-unresolved discussion about exactly this on Tauri's GitHub (`tauri-apps/tauri` discussion #11957), which is where I finally found language for what I was looking at, though not a fix.

Radix doesn't just ignore that touch-capable signal. Its `DismissableLayer`, the piece responsible for closing dropdowns, popovers, and dialogs when you interact outside them, registers real `touchstart` and `touchend` handlers defensively, on the reasonable assumption that a touch-capable device might send a tap instead of a click. On a real touchscreen this is exactly the right thing to do. On a Mac that's lying about having one, it means Radix is listening for a touch sequence that will never legitimately occur, but that the webview is apparently still capable of half-generating on its own, as a phantom event tied to something in its internal pointer state.

<figure class="touch-fig">
  <svg viewBox="0 0 640 260" role="img" aria-label="Nested diagram: WKWebView at the outermost layer falsely reports touch capability. Inside it, Radix's dismissable layer registers touchstart and touchend handlers defensively because of that false signal. A phantom touchend fires and gets treated as the tail end of a touch interaction, which cancels the real mouse click that follows it, before it ever reaches the button.">
    <rect x="10" y="10" width="620" height="240" rx="10" fill="none" stroke="var(--accent-orange)" stroke-width="1.6" stroke-dasharray="4 4"></rect>
    <text x="26" y="34" class="touch-fig-label" fill="var(--accent-orange)">WKWebView: navigator.maxTouchPoints falsely reports touch support</text>
    <rect x="30" y="50" width="580" height="160" rx="6" fill="none" stroke="var(--text-primary)" stroke-width="1.4"></rect>
    <text x="46" y="72" class="touch-fig-label" fill="var(--text-primary)">Radix DismissableLayer: registers touchstart / touchend defensively</text>
    <rect x="50" y="88" width="540" height="34" rx="4" fill="var(--accent-orange-soft)" stroke="var(--accent-orange)" stroke-width="1.4"></rect>
    <text x="66" y="109" class="touch-fig-note" fill="var(--accent-orange)">phantom touchend fires, no finger ever touched anything</text>
    <rect x="50" y="132" width="540" height="34" rx="4" fill="none" stroke="var(--text-tertiary)" stroke-width="1.1"></rect>
    <text x="66" y="153" class="touch-fig-note">treated as the tail end of a touch interaction</text>
    <rect x="50" y="176" width="540" height="30" rx="4" fill="none" stroke="var(--accent-orange)" stroke-width="1.4" stroke-dasharray="3 3"></rect>
    <text x="66" y="196" class="touch-fig-note" fill="var(--accent-orange)">real mouse click cancelled before it reaches the button</text>
  </svg>
  <figcaption>Nothing in this chain is a bug on its own. Radix's touch handling is correct behavior for a real touchscreen; the webview's false signal is what turns it against a mouse-only Mac.</figcaption>
</figure>

Opening the Web Inspector "fixed" it because attaching it forces WebKit to reset its input state, clearing out whatever half-formed touch sequence was sitting there. That's a diagnostic accident, not a resolution. The moment the inspector closed, the phantom touch capability came right back, and so did the failed clicks.

## The fix

Synth is desktop-only. It runs on a Mac, with a mouse or a trackpad, never a touchscreen, so touch events have exactly zero legitimate use anywhere in the app. Rather than trying to convince Radix or WebKit to behave, I just made sure no touch listener could ever get registered in the first place, on macOS specifically:

```ts
const TOUCH_EVENT_TYPES = new Set(['touchstart', 'touchend', 'touchmove', 'touchcancel']);

if (typeof window !== 'undefined' && /Macintosh|Mac OS X/.test(navigator.userAgent)) {
  const originalAddEventListener = EventTarget.prototype.addEventListener;

  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (TOUCH_EVENT_TYPES.has(type)) return;
    return originalAddEventListener.call(this, type, listener, options);
  };
}
```

That's the entire file. It monkey-patches `addEventListener` so any attempt to register one of the four touch event types is silently dropped, gated behind a macOS check so it's a true no-op everywhere else. The only thing that mattered beyond the patch itself was import order: it has to run before Radix ever gets a chance to attach its own handlers, so it goes at the very top of `layout.tsx`, above everything else, evaluated the moment the module loads, well before any component mounts.

I clicked through every dropdown, dialog, and select in the app after that, on purpose, dozens of times, trying to reproduce the one-in-three failure. Nothing. It just worked, every time, the boring way a button is supposed to.

<style>
  .touch-fig {
    margin: var(--space-2xl) 0;
    padding: var(--space-lg);
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
  }
  .touch-fig svg { width: 100%; height: auto; display: block; }
  .touch-fig figcaption {
    margin-top: var(--space-md);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--text-tertiary);
    line-height: 1.6;
  }
  .touch-fig-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11.5px;
    font-weight: 500;
  }
  .touch-fig-note {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    fill: var(--text-secondary, #525252);
  }
  .touch-fig-bar-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    fill: var(--text-primary, #1a1a1a);
  }
</style>

## Anyway

The strangest part of this whole thing is how little is written about it anywhere. The Tauri discussion describes the exact symptom, other people clearly hitting the same wall, but as of this fix it has no accepted resolution sitting on it. I don't think this bug is rare so much as it's easy to give up on, because "opening devtools fixes it" is such an unsatisfying, seemingly unreproducible clue that it's tempting to write off as a fluke instead of chasing it to an actual cause. It wasn't a fluke. It was the one piece of the app quietly telling the truth about where the problem lived, if I'd been willing to listen to it three theories earlier.
