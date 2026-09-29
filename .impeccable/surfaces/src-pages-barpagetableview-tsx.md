---
version: 1
slug: "src-pages-barpagetableview-tsx"
primary_target: "src/pages/BarPageTableView.tsx"
related_targets: ["src/pages/BarPage.tsx","src/Components/Customer/CustomerPage.tsx","src/Components/AdminComponents/AdminDashboard.tsx"]
---

# Surface brief: Plate Vista, all three surfaces

Scope: one visual system across the staff board (`/bar`, `/bar/table/:id`), the guest scan-to-order app (`/r/:slug/t/:qr`), and the admin (`/admin/*`, login, register). Mode: Operate on every surface.

Audience and job: staff bump orders through their lifecycle during service and ring up tables on desktop, tablet or phone. Guests order from their phone at the table. Owners set up the restaurant and read the day's numbers.

Constraints: visual only. Data fetching, realtime, auth, and order logic stay untouched. English copy. Money is in cents.

## Direction contract

THESIS: The order is the chit. One printed slip is the same object on the guest's phone, on the kitchen rail and in the owner's ledger. This refuses the category default of floating rounded status cards on a generic dashboard.

OWN-WORLD: The board and the admin chrome sit on brushed-steel ground (#1A1B1E, rail #26282D). Content is thermal paper (#F4F4F0) with near-black ink (#0E0E0E), mono receipt print (Chivo Mono) for items, prices and times, and Archivo for UI and huge table numerals. Signal orange (#FF6B1A) marks new and primary actions, pass green (#3FA66B) marks ready, and red (#E5484D) plus a hazard hatch marks overdue. Chits have perforated tear edges and a clip at the rail.

STORY: Staff see every open order as a chit hanging on a rail, oldest first, and bump it forward with one big button. Guests build their order as a chit and watch it move through the same five steps. Owners read the day as a Z-report.

FIRST VIEWPORT: Board. A 56px steel header holds the wordmark, station switch, Rail/Floor switch, a connection lamp and the staff chip. Below it are lanes (New, On the line, At the pass, Served), each a steel rail with chits hanging from clips. A chit is about 300px wide, with the table numeral at 44px, a live mm:ss timer hard right, a five-step row, mono item lines, and a full-width bump button at the bottom (orange).

FORM: The Ticket Rail, candidate 1 of 7 on my list (picked by the user as IMPECCABLE'S PICK). Seed key f9a2cb79. Signature interaction: new chits *print* onto the rail (they unroll from the clip downward), and bumping moves the chit to the next lane. The guest's placed order prints the same way. Motion grammar: a single print-in motion with exponential ease-out; nothing else animates by default.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
