---
name: Plate Vista
description: One printed order slip, the same object on the guest's phone, the kitchen rail and the owner's ledger.
colors:
  signal: "#FF6B1A"
  signal-deep: "#D5501A"
  signal-ink: "#B3410F"
  pass: "#3FA66B"
  pass-ink: "#237145"
  alert: "#E5484D"
  alert-ink: "#B02530"
  amber: "#F7A928"
  steel-950: "#131417"
  steel-900: "#1A1B1E"
  steel-850: "#212226"
  steel-800: "#26282D"
  steel-700: "#363940"
  steel-500: "#6C6F78"
  steel-300: "#AEB0B7"
  paper: "#F4F4F0"
  paper-deep: "#E7E7E2"
  paper-line: "#CFCFC9"
  sheet-white: "#FFFFFF"
  ink: "#0E0E0E"
  ink-soft: "#585852"
typography:
  numeral:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.03em"
    fontVariation: "\"wdth\" 78"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontVariation: "\"wdth\" 100"
  button:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.08em"
  wordmark:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "\"wdth\" 118"
  receipt:
    fontFamily: "'Chivo Mono', ui-monospace, monospace"
    fontSize: "0.95rem"
    fontWeight: 500
    lineHeight: 1.375
    fontFeature: "\"tnum\" 1"
  timer:
    fontFamily: "'Chivo Mono', ui-monospace, monospace"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "\"tnum\" 1"
rounded:
  tear: "3px"
  xs: "4px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  full: "9999px"
spacing:
  hair: "3px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.signal-deep}"
    textColor: "{colors.ink}"
  button-bump:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "48px"
    width: "100%"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-pass:
    backgroundColor: "{colors.pass}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  input:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "44px"
  chit:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tear}"
    padding: "16px"
    width: "300px"
  lane:
    backgroundColor: "{colors.steel-850}"
    textColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    padding: "12px"
  chip-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  chip-idle:
    backgroundColor: "{colors.steel-900}"
    textColor: "{colors.steel-300}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  nav-item:
    textColor: "{colors.steel-300}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  nav-item-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  table-tile-seated:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "14px"
    height: "144px"
  table-tile-free:
    textColor: "{colors.steel-300}"
    rounded: "{rounded.xl}"
    padding: "14px"
    height: "144px"
  status-tag:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
    padding: "2px 6px"
---

# Design System: Plate Vista

## Overview

**Creative North Star: "The Ticket Rail"**

The order is the chit. One printed slip of thermal paper is the same object on the guest's phone, hanging from a clip on the kitchen rail, and lying on the owner's Z-report. Everything else in the system exists to hold that slip: brushed steel is the ground staff work on (the board, the admin sidebar, the sign-in panel), and paper is what an order is printed on (the guest app, every chit, the admin content area). A screen is always one of those two materials, and the scope class `.steel` flips every semantic token from paper to steel.

The world is dense and service-grade. Type is Archivo, pushed narrow and black for huge table numerals and wide for the wordmark; everything that would be printed by a till (quantities, item lines, prices, times, totals) is set in Chivo Mono with tabular figures. Paper carries receipt devices native to the material: torn perforated edges, dashed tear lines, and dotted leaders between a label and its amount. Color is almost absent; signal orange, pass green and alert red are status lights, not decoration.

Motion has one verb: print. A new chit unrolls downward from its clip with an exponential ease-out, and the same motion prints the guest's placed order, the cart bar and toasts. Nothing else animates by default; hover and press responses are short state changes, and all motion collapses under `prefers-reduced-motion`. The world explicitly rejects the category default of floating rounded status cards on a generic dashboard.

**Key Characteristics:**
- Two materials only: steel ground and thermal paper, switched by scope, never blended.
- The chit (clip, torn edge, perforation, mono lines, step row, full-width bump) is the reusable signature on all three surfaces.
- Mono tabular figures for every number a till would print.
- Status is carried by position (lane, step row) and pattern (hazard hatch) first, color second.
- A single print-in motion; everything else is still.

## Colors

A near-monochrome steel-and-paper world lit by three status lamps.

### Primary
- **Signal Orange** (signal): New orders and the one primary action on a surface: the bump button, the "New" lane count, the current pending step, focus rings, selection and caret. Hover deepens to **Scorched Signal** (signal-deep). On paper, orange text uses **Signal Ink** (signal-ink), the text-weight variant that holds 4.5:1.

### Secondary
- **Pass Green** (pass): Ready and served. Lights the step row once an order reaches the pass, the "n ready" tag on a floor table, the live connection lamp. On paper, green text uses **Pass Ink** (pass-ink).

### Tertiary
- **Alert Red** (alert): Overdue, cancelled, offline, destructive. Always paired with a non-color cue (hazard hatch, strike-through, dashed step row). On paper, red text uses **Alert Ink** (alert-ink).
- **Lamp Amber** (amber): Transitional states only: reconnecting lamp, reserved tables, kitchen notes highlighted at 20%, and the snapshot-failed banner (ink on amber).

### Neutral
- **Brushed Steel** (steel-900): The board and admin-chrome ground, under a faint top-down sheen (`.steel-ground`).
- **Deep Steel** (steel-950): Headers above the steel ground, translucent at 95%.
- **Lane Steel** (steel-850) / **Rail Steel** (steel-800): Lanes (at 70%), steel cards, segmented-control wells.
- **Seam Steel** (steel-700): Borders and inputs inside `.steel`; idle chip outlines.
- **Clip Steel** (steel-500): The rail bar and chit clips; scrollbar thumbs on steel. Not for text.
- **Brushed Label** (steel-300): Secondary text on steel.
- **Thermal Paper** (paper): The guest app ground, every chit, the admin content area, and the "active" state of any steel control (active nav item, active chip, active tab turn to paper).
- **Paper Fold** (paper-deep) / **Paper Rule** (paper-line): Muted fills and hairline borders on paper.
- **Sheet White** (sheet-white): Inputs, dialogs, admin panels and the Z-report slip, where a crisper sheet must read against thermal paper.
- **Thermal Ink** (ink): All text on paper; primary fills on paper (the guest's in-cart stepper, the cart bar, ink buttons).
- **Faded Ink** (ink-soft): Secondary text on paper, like thermal print that has started to fade.

### Named Rules
**The Two Materials Rule.** Every region is steel or paper. Steel regions wrap in `.steel`; the semantic tokens (background, card, border, muted) follow. Do not invent a third ground.

**The Lamp Rule.** Signal, pass, alert and amber mark state, never ornament. If a colored element does not answer "what state is this order in?" or "what do I press next?", it should be ink or steel.

**The Ink-On-Lamp Rule.** Labels on a signal, pass or alert fill are set in ink (signal 6.8:1, pass 6.3:1, alert 4.9:1). White on those fills does not reach 4.5:1 and is not part of the system.

## Typography

**Display Font:** Archivo (variable width 62–125, weight 400–900), with the system sans stack as fallback
**Body Font:** Archivo at width 100
**Label/Mono Font:** Chivo Mono (400/500/700), with the system mono stack as fallback

**Character:** A grotesque that can be squeezed into black, condensed table numerals or stretched into a wide wordmark, paired with a receipt-printer mono for everything a till would print.

### Hierarchy
- **Numeral** (900, 2.75rem, 0.9, width 78): The table number on a chit. Floor tiles use the same face at 2.5rem, width 80. The biggest thing on the board is always which table.
- **Headline** (800, 1.75rem mobile → 2.125rem from md, 1.25): Admin page titles, one per screen.
- **Title** (700, 1.125rem, 1.25): Card, panel and dialog titles; the guest's dish names at 1.05rem.
- **Body** (400, 0.875rem, 1.43): UI copy and descriptions. Descriptions on paper are Faded Ink; line length stays under max-w-2xl.
- **Label** (700, 0.7rem, 0.08em, uppercase): Status words on the step row, table tags, "Total" on the receipt, lane headings (at 0.875rem, 0.12em).
- **Receipt** (Chivo Mono 500, 0.95rem, tabular): Item lines on a chit, prices, quantities (`2×`), totals.
- **Timer** (Chivo Mono 700, 1.25rem, 1, tabular): The live m:ss timer, hard right on each chit; turns Alert Ink when overdue.

### Named Rules
**The Till Rule.** If a till would print it (money, quantity, time, order number, item lines, and the small uppercase annotations a receipt carries such as "#A3F2 · 3 items" or "Rail is clear"), it is Chivo Mono with tabular figures. Controls, headings and body copy are Archivo.

**The Width Axis Rule.** Condense Archivo (width 78–80) only for table numerals; widen it (118) only for the wordmark. Everything else sits at width 100.

## Layout

Two layout models. The **board** is a row of lanes (New, On the line, At the pass, Served), oldest chit first. On phones and tablets, lanes are a horizontal snap-scroll strip (each lane `minmax(17.5rem, 88vw)`, then `minmax(19rem, 1fr)` from 640px); from 1280px they become a fixed grid of three equal lanes plus a narrower Served lane (0.8fr), each scrolling on its own. Board chrome is a 56px steel header; content caps at 1920px with 12px gutters (20px from 640px).

The **floor** is an auto-fill grid of table tiles (min 10rem each). The **admin** is a 16rem steel sidebar beside a paper content column capped at 1400px (padding 16 → 24 → 40px); below 1024px the sidebar becomes a slide-in sheet. The **guest app** is a single paper column with a floating ink cart bar at the bottom.

Spacing runs on a 4px grid: 12px between chits and lanes, 16px inside a chit, 24px between admin panels. Every touch target is at least 40px (steppers, chips, nav rows, icon buttons), 44px for inputs, 48px for the bump button.

## Elevation & Depth

Depth is physical, not ambient: things hang or lie. A chit hanging on steel casts a real drop shadow; a chit lying on paper casts a faint one. Because the chit's torn edge is a mask, its shadow is a `filter: drop-shadow` on a wrapper, never a `box-shadow` on the slip. Steel surfaces are otherwise flat and separate by tone (950 header, 900 ground, 850 lane, 800 card). Paper panels separate with a 1px ink ring at 7% rather than a shadow.

### Shadow Vocabulary
- **Hanging chit** (`filter: drop-shadow(0 6px 10px rgb(0 0 0 / 0.28)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.2))`): Chits on a steel rail.
- **Lying chit** (`filter: drop-shadow(0 4px 12px rgb(20 20 20 / 0.10)) drop-shadow(0 1px 1px rgb(20 20 20 / 0.08))`): Chits on paper (guest bill, Z-report).
- **Rail** (`box-shadow: 0 2px 4px rgb(0 0 0 / 0.4)`): The steel bar a lane's chits hang from.
- **Clip** (`box-shadow: 0 2px 3px rgb(0 0 0 / 0.45)`): The clip at the top of a hanging chit.
- **Seated table** (`box-shadow: 0 8px 20px -8px rgb(0 0 0 / 0.6)`): A floor tile that has become paper.
- **Floating bar** (`box-shadow: 0 16px 40px -10px rgb(0 0 0 / 0.55)`): The guest cart bar and toasts.

### Named Rules
**The Hang-Or-Lie Rule.** A shadow means an object is hanging from something or lying on something. Flat UI (panels, inputs, nav) takes no shadow.

## Shapes

Paper is torn, not rounded: a chit's bottom edge is a row of 7px perforation teeth (a CSS mask), with only its top corners softened to 3px under the clip. Inside a slip, sections are divided by a dashed tear line (8px period, ink at 35%) and label–amount pairs are joined by a dotted leader. Steel containers (lanes, floor tiles, admin panels) are gently rounded at 12px; controls (buttons, inputs, nav rows) at 8px; tags at 4px; filters, counts, steppers and the lamp are full pills or circles. A free table is drawn as a dashed outline on steel; a reserved one as a dashed amber outline; a seated one becomes solid paper.

## Components

### Buttons
Tactile and service-grade: big, flat, pressed 1px on tap.
- **Shape:** Gently rounded (8px).
- **Primary:** Signal fill, ink label, 40px tall with 16px sides; a 1px white inner highlight and a 2px signal-deep glow at rest.
- **Hover / Focus:** Hover deepens to signal-deep. Focus is a 2px signal ring offset 2px from the surface. Press moves the button down 1px. Disabled drops to 45% opacity.
- **Bump:** The primary at 48px, full chit width, 16px label; one per chit, at the bottom, naming the next step ("Accept", "Start", "Ready", "Serve").
- **Ink / Pass / Destructive:** Ink fill with paper label; pass fill; alert fill. Each follows the Ink-On-Lamp Rule.
- **Ghost / Quiet:** Transparent, tinting to paper-deep (or steel-700 on steel). The "Cancel order" action under a bump is a quiet 36px button that tints alert on hover.

### Chips
- **Style:** Station filters on the board are 40px pills: idle is a steel-700 outline with steel-300 text; active turns to solid paper with ink text.
- **Counts:** Mono pill beside a lane heading or tab: white at 10% on steel, signal when the New lane has orders.
- **Tags:** 4px-radius labels (Seated, n ready, Reserved, Popular, Sold out) in the label style.

### Cards / Containers
- **Corner Style:** 12px for lanes, floor tiles and admin panels.
- **Background:** steel-850 at 70% for lanes; sheet-white on paper for admin panels.
- **Shadow Strategy:** See Hang-Or-Lie; panels are flat with a 1px ink ring at 7%.
- **Internal Padding:** 20px, 24px from 768px.

### Inputs / Fields
- **Style:** 44px, sheet-white fill, 1px paper-line border, 8px radius, 0.95rem text; the caret is signal.
- **Focus:** Border turns signal with a 3px signal ring at 20%.
- **Error / Disabled:** Disabled at 50% opacity with a not-allowed cursor.

### Navigation
- **Board header:** 56px steel-950 bar: wordmark, connection lamp, a steel-800 segmented well whose active tab turns paper, staff chip at the far right.
- **Admin sidebar:** Steel; group titles as small wide-tracked steel-300 labels; 40px rows in steel-300 that tint white at 6% on hover; the active row turns paper with an ink label and a signal-ink icon. Below 1024px it slides in from the left over a 60% steel scrim.

### The Chit (signature)
A thermal slip, about 300px wide on the board: clip at top center, table label plus the huge numeral at left, the live timer and `#ID · n items` hard right, an optional hazard hatch strip when overdue, the step row, a tear line, mono item lines with a station icon (bar or kitchen) and amber-highlighted notes, another tear line, a dotted-leader total, then the bump. It prints in on mount, staggered 45ms per chit. The Served lane uses a compact variant (numeral at title size, 80% opacity). The same object is the guest's order on their bill and the Z-report on the admin overview.

### Step Row (signature)
Five 6px cells in one pill-ended bar (pending, accepted, preparing, ready, served) lit up to "now": ink as it advances, signal on the current pending step, pass once ready. A cancelled order draws the row as a dashed alert line with a struck-through label. The same row sits on the guest's bill, the chit and the admin table, so every surface names state identically.

### Lamp
A 10px dot with a 3px halo: pass and steady when live, amber and pulsing (1.6s) while connecting, alert when offline, always with its word.

### Hazard Hatch
A 6px 45° stripe of alert and ink (8px bands) across an overdue chit, so urgency never rides on color alone.

## Do's and Don'ts

### Do:
- **Do** set every region on steel (`.steel`) or on paper, and let the active state of a steel control become paper.
- **Do** build any new order-bearing view from the chit: clip or no clip, torn edge, tear lines, mono lines, leader total.
- **Do** set every price, quantity, time and order number in Chivo Mono with tabular figures.
- **Do** reuse the five-cell step row wherever an order's status appears.
- **Do** pair every alert color with a pattern or text cue (hazard hatch, strike-through, a word).
- **Do** use the -ink variants (signal-ink, pass-ink, alert-ink) for colored text on paper.
- **Do** keep touch targets at 40px or more, and one bump per chit.
- **Do** use print-in (620ms, cubic-bezier(0.16, 1, 0.3, 1)) for anything that arrives, and nothing else for idle motion.

### Don't:
- **Don't** put white labels on signal, pass or alert fills; they measure 2.9:1, 3.1:1 and 3.9:1.
- **Don't** use signal, pass or alert as decoration or as the ground of a whole region.
- **Don't** replace the chit with a floating rounded status card.
- **Don't** put a `box-shadow` on a masked chit; shadow the wrapper with `drop-shadow`.
- **Don't** set controls, headings or body copy in mono, or condense Archivo outside table numerals.
- **Don't** use steel-500 for text; it is the rail and clip metal.
