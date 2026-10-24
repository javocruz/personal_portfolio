# Art direction

This file is the source of truth for how javicruz.dev looks. Read it before changing anything visual.

## Two modes, one header

- **Core** is always **light**: quick, one page, laid out like a studio index.
- **Complete** is always **dark**: the full exhibition.
- There's no light/dark toggle.
- Both modes share the same header (`Nav.tsx`). Only its colours change. The single exception is Core's style switch.

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
