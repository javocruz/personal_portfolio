# Art direction

This file is the source of truth for how javicruz.dev looks. Read it before changing anything visual.

## The site, and two sites in its gallery

- **The site** (`src/site/`) is the front door, modelled closely on daoho.dev: pond, projects, gallery, blog.
  - **Type and colour:** Geist Mono only. Warm near-black `#1a1917` with warm off-white `#fff7f0`, and a light theme (`#f5f4f1` / `#262523`) behind a toggle.
  - **Nav:** lowercase, centred, the current page at full strength and the rest at half.
  - **Pond:** a placeholder ASCII pond that keeps clear of text (`[data-pond-avoid]`). It will be replaced.
  - **Projects:** one row of large cards that scrolls sideways, each painting hung on a blurred wash of its own colours. Project pages follow daoho's: hero band, story, the build, photos, previous and next.
  - **Gallery:** Core and Complete hang as works. The viewer has an "enter" button that steps into that whole site.
  - **Page changes:** stepped, after marcvendrell.cat. Everything runs on 12 poses a second: the page sinks 4px and goes in 2 poses, then each `[data-block]` steps in, in its `--order` (`src/site/steps.tsx`).
- **Core** and **Complete** are exhibits. Entering one lasts for the tab. Their header (`Nav.tsx`) has a "← gallery" link back out.
  - **Core** is always **light**: quick, one page, laid out like a studio index.
  - **Complete** is always **dark**: the full exhibition.
  - Both share `Nav.tsx`, where only the colours change, plus Core's style switch.

## Core: modernist abstraction (20th century)

- **Rothko (the only style live for now):** Color Field. Soft-edged stacked rectangles, thin glowing washes, warm cream ground. Mood.
- **Mondrian (built but hidden behind a flag):** De Stijl. White ground, thick black grid lines, flat red, blue and yellow planes. Structure.
- **Font:** Jost, for both styles. Monospace only for the Technique section.
- **Paintings:** each project painting is generated in the active artist's style, from the project's real data, then baked to JPG. Nothing paints in the browser.
- **UI:** only subtle nods to the artist. The paintings carry the style.
- **Images:** never use real Mondrian or Rothko images. Everything is generated.

## Complete: the Sublime (19th-century Romantic)

- **Story:** Thomas Cole, *The Course of Empire* (1836), told by scroll:
  1. Savage
  2. Arcadian
  3. Consummation
  4. Destruction
  5. Desolation

  It opens on Böcklin's *Isle of the Dead*, which is the hero (death shown first), shown in the painting's own colours, graded slightly darker and warmer. Contact is copper on black with Dan Hillier's *Eye of Nature* (used with the artist's OK).
- **Signature move:** the **dither dissolve**. A full-bleed WebGL canvas breaks one painting into 1-bit Bayer dots, switches the dots to the next painting and its palette, then resolves. It has a hot edge and shimmer, and it is driven by scroll only.
- **No mouse dither:** no cursor lens on the canvas or the hero, and no hover dither on the plates. It read as confusing.
- **Accent colour:** each painting has its own palette, and the accent follows the painting as you scroll. No red: the hero's accent is bone, taken from the Isle.
- **Font:** Cormorant Garamond for display (300–400) and body (500), monospace for kickers and wall labels. The hero name is small and quiet, set like a museum title.
- **Gallery plates:** the original watercolour code paintings, always in full colour, hung in visible frames (dark-wood moulding, a thin gilt line at the painting, a pale outer hairline) so they stand off the dark wall.
- **Entrance:** the Core | Complete split, with no smoke.
- **ASCII:** the 404 is Desolation in ASCII.
- **Dropped:** John Martin's paintings and the self-portrait.
- **Paintings used:** public domain only (Cole, Böcklin), plus Hillier with permission.

## Writing

- **Spanish:** Mexican / neutral Latin American. Use "tú", never "vosotros", and dates in `es-MX`.
- **Tone:** plain, direct copy. No em dashes.
