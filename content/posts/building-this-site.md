---
title: I built three websites to end up with a simple one
date: 2026-11-10
summary: Shaders, two exhibitions painted in code, thirty ideas for a pond. Then I took most of it away, and the site got better every time.
tags: meta, design
---

This site is the third version of itself, and it is by far the plainest. One typeface, two colours, a header and a column of text. Getting here took a lot more work than the busy versions did.

## Version one: everything

The first version was a dark page with WebGPU shaders moving behind the text, a command palette, a hidden "hyperdrive" mode and a lot of motion. Every piece was fun to build. Together they were noise. It was easy to watch the background and miss the part about what I actually do.

## Version two: two exhibitions

So I went the other way and made it about art. I split the site into two whole sites.

**Core** is the quick version: one page, laid out like a studio index. Every project has a painting in the style of Rothko (and Mondrian, built but hidden), generated with JavaScript from that project's real numbers and baked to an image.

**Complete** is the long version: Thomas Cole's *The Course of Empire* told by scroll, one painting dissolving into the next, with Böcklin's *Isle of the Dead* and Dan Hillier's *Eye of Nature* (used with permission).

I am still proud of both. But they were exhibitions, and a portfolio is not an exhibition. You had to understand the concept before you could find my CV.

## Version three: take things away

Two sites changed my mind: [daoho.dev](https://www.daoho.dev/) and [marcvendrell.cat](https://marcvendrell.cat/). Both are almost nothing, and both feel more personal than anything I had built. So I rebuilt the front door to be almost nothing too:

- **One font, two colours.** Geist Mono, warm near-black, warm off-white, a light theme behind a toggle.
- **Pages that step instead of slide.** Everything moves at 12 poses a second, like hand-drawn animation on twos. A page sinks four pixels and goes in two steps, then the next one arrives block by block.
- **Plain lists.** Projects in a grid, experience as rows you can open, a footer that is one line long.

The paintings did not disappear. Each project still hangs its watercolour, and Core and Complete still exist. They just stopped being the first thing you have to get through.

## The pond

The hardest part was the background on the home page. It started as a placeholder: an ASCII pond with ripples.

I made a testing room and built twelve replacements: Monet's water lilies in brushstrokes, fireflies that slowly blink in sync, water striders, ink drops, an engraved eye. All of them were prettier than what is there now, and all of them changed the mood of the site. The three I liked were the most boring ones: a dither, a contour map and the original glyphs.

Round two was nine more in that voice: halftones, a vector field, a hex dump, an oscilloscope. Better, but the cursor made them messy. Moving your mouse over a page to read it should not set it on fire.

Round three took the cursor away. What runs behind the text now is one of seven systems that play out by themselves: Conway's Game of Life, elementary cellular automata, reaction-diffusion, Langton's ants, cyclic spirals, Brian's Brain, or rain on dithered glyphs. One is picked at random on every visit, from a fresh seed, faint enough to sit behind the words. The name sits in the corner if you want to know what you are looking at.

I renamed it from pond to playground, because there are no fish anymore.

## What I learned

Everything I removed worked. That was the hard part: none of it was broken, it just did not earn its place.

Simple is not the absence of work. It is the result of trying the complicated version, looking at it honestly, and keeping only what the person on the other side actually needs. For a portfolio, that is short: who I am, what I built, and how to reach me. Everything else should stay quiet.

The site is a small Vite and React app on Cloudflare, and this blog is just Markdown files. The source is [on GitHub](https://github.com/javocruz/personal_portfolio) if you want to see all the versions it took.
