# Art direction

This file is the source of truth for how javicruz.dev looks. Read it before changing anything visual.

## The site, and two sites in its gallery

- **The site** (`src/site/`) is the front door, modelled closely on daoho.dev: playground, projects, about, blog. The gallery is off the nav and the sitemap for now; /gallery still works.
  - **Type and colour:** Geist Mono only. Warm near-black `#1a1917` with warm off-white `#fff7f0`, and a light theme (`#f5f4f1` / `#262523`) behind a toggle.
  - **Nav:** lowercase, centred in a 44px bar (the same space above and below), the current page at full strength and the rest at half, with the time in Madrid at the far left. A one-line footer closes every page except the playground.
  - **Playground (the home page):** one self-running automaton or simulation, picked at random per visit and started from a new seed, faint behind the text and clear of it (`[data-pond-avoid]`). One of them is the Course of Empire (after Cole): each of its five stages is one day, sunrise to a short starry night, twelve seconds a day, so the bay is built and lost over five days (a minute) and starts again; one sun, the same size on the same arc at an even speed every day; its horizon sits at mid-height so the home text falls over water and land. The cursor does nothing. In code it is still called the pond; candidates live at `/lab/ponds`.
  - **Projects:** a two-column grid that scrolls down, each painting hung on a blurred wash of its own colours. Project pages follow daoho's: hero band, story, the build, photos, previous and next.
  - **Small touches:** a ⌘K command menu (nav button and shortcut) styled like the site; project names in the home bio show their painting beside the cursor; About's "now" lists live GitHub pushes; the 404 keeps the playground running behind one line. Project pages carry a strip of real figures (`numbers` in `projects.ts`), each one traceable to a repo, the CV or a README.
  - **Guestbook:** in the nav next to the playground. Visitors draw on a 255×255 board (pen strokes, undo, clear), sign, and add one line. Nothing shows until Javier approves it: each signature emails him a link to it and to the review queue, a page with every waiting and published signature (`worker/guestbook.ts`, a Durable Object with SQLite).
  - **About:** plain lists: experience, leadership, recognition, education, skills, contact. Rows open for detail.
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
