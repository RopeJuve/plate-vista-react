# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Guests** at a restaurant table. They scan the table's QR code on their own phone, browse the menu, build a cart, place orders, and follow their bill without installing anything or creating an account.
- **Bar / kitchen staff** (`bar`, `kitchen` roles) during service. They watch incoming orders across tables, open a single table to see and act on its tickets, and move orders through their statuses. Today they use a desktop browser; the product should work just as well on tablets and phones.
- **Owners / admins** (`admin`, `owner` roles). They set up the restaurant (registration, menu, tables, employees, QR codes) and review performance (daily sales, income, order totals, trending dishes, best employees).

## Product Purpose

Plate Vista is a restaurant ordering system that connects the guest's phone, the staff board, and the owner's dashboard in real time. A guest's order goes straight to the bar/kitchen board over WebSocket, and staff actions go back to the guest's bill. Success means guests order without flagging down a waiter, staff never miss or lose a ticket, and owners can run the restaurant's setup and see its numbers in one place.

## Positioning

A single system with three connected surfaces: scan-to-order for guests, a live order board for staff (kitchen-monitor and POS-style table service), and an admin dashboard. All three share one real-time session model per table, so an order and its status are the same object everywhere.

## Operating Context

- Guests: phone in hand at the table, often one-handed, variable lighting and connectivity; the session starts from a QR scan (`/r/:slug/t/:qrCode`) and ends when the table's bill is closed (a thank-you screen).
- Staff: busy service, glancing between tasks; the board must survive reconnects and recover its state (there are e2e specs for board recovery and per-table staff pads).
- Admins: desk work, between services.
- Multi-restaurant: restaurants are addressed by slug.

## Capabilities and Constraints

- Stack: React 18, Vite, TypeScript, Tailwind 3, shadcn/ui (Radix), lucide-react, recharts, react-hook-form + zod.
- Real-time protocol and auth are documented in `docs/PROTOCOL.md` and `docs/AUTH.md`; money is handled in cents (`src/shared/money/formatCents.ts`).
- Staff JWTs last one hour; guest sessions are per table.
- Visual redesign must not change data fetching, realtime, or auth behavior.

## Brand Commitments

- The product name **Plate Vista** stays. No other identity element (color, type, logo) is binding.

## Evidence on Hand

- No real customer names, testimonials, metrics, or photography are provided. Menu item images come from the restaurant's own uploads. Do not fabricate restaurants, reviews, or usage numbers.

## Product Principles

1. **One order, one truth.** Guests, staff, and admins look at the same order and status; each surface names states identically.
2. **Service speed first.** On the staff board, what needs action now must be readable at a glance, before anything decorative.
3. **Zero-friction guests.** No account, no app install; the menu and the cart are the whole experience.
4. **Works on any screen.** Staff surfaces start on desktop but must stay usable on tablets and phones.

## Accessibility & Inclusion

No product-specific standard has been set yet. Default to WCAG 2.2 AA contrast and touch targets, since guests and staff use touch devices.
