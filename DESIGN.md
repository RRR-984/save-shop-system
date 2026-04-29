# Design Brief: Restaurant Management Module

## Direction

**Operational Control Center** — Scoped restaurant/hotel KOT system with real-time table & kitchen status, fast menu entry, smart billing. Uses warm food palette (amber/orange/green) for KOT status, maintaining dark navy sidebar consistency with existing Save Shop System.

## Tone

Fast-paced, high-visibility, operational. No playfulness, no luxury — pure functional efficiency. Every interaction scannable at a glance. Professional SaaS quality with food-service urgency.

## Differentiation

Warm KOT status palette (bright yellow Pending, warm orange Cooking, bright green Ready) creates visual separation from cool brand blue used elsewhere. Category badges (Veg green, Non-Veg red, Drinks blue, Snacks amber) aid fast visual sorting. Table grid with clear Free/Occupied/Reserved states. Sidebar section isolated for restaurant-only context.

## Color Palette (Restaurant Tokens)

| Token                | OKLCH            | Usage                           |
| -------------------- | ---------------- | ------------------------------- |
| kot-pending          | 0.85 0.18 92     | KOT pending order (bright yellow) |
| kot-cooking          | 0.68 0.18 65     | KOT cooking (warm orange)       |
| kot-ready            | 0.65 0.17 142    | KOT ready (bright green)        |
| table-free           | 0.65 0.17 142    | Free table (green)              |
| table-occupied       | 0.68 0.18 65     | Occupied table (orange)         |
| table-reserved       | 0.52 0.214 258   | Reserved table (brand blue)     |
| category-veg         | 0.65 0.17 142    | Veg menu badge (green)          |
| category-nonveg      | 0.54 0.24 28     | Non-Veg menu badge (red)        |
| category-drinks      | 0.52 0.214 258   | Drinks menu badge (blue)        |
| category-snacks      | 0.68 0.18 65     | Snacks menu badge (orange)      |

## Typography

- Display: Plus Jakarta Sans (700 weight) — table numbers, section headers, order counts
- Body: Plus Jakarta Sans (500/400) — menu items, order details, billing
- Scale: table numbers large (24px+), order items compact (14px), labels uppercase 12px

## Elevation & Depth

KOT cards: shadow-card with lifted hover state. Table grid: subtle bottom border per cell, optional highlight on tap. Category badges: 15% opacity background. Menu items: white cards with shadow-soft, 8px rounded corners.

## Structural Zones

| Zone              | Background     | Border           | Notes                             |
| ----------------- | -------------- | ---------------- | --------------------------------- |
| Menu/Categories   | card           | bottom 1px       | Category badge + items grid       |
| Table Grid        | background     | 1px border       | Grid layout, status color fill    |
| KOT Kitchen       | card           | status-colored   | Pending/Cooking/Ready columns    |
| Quick Order       | card           | none             | Fast-pick tile buttons            |
| Billing           | card           | top border       | GST toggle, CGST/SGST split      |

## Spacing & Rhythm

Menu: 1rem gap between items; table grid: 0.75rem padding per cell; KOT cards: 0.5rem gap; quick-pick tiles: 0.75rem gap; billing section: 1.5rem spacing; mobile sections separated by 1.5rem, desktop 2rem.

## Component Patterns

- **KOT Status Card:** `bg-kot-{status}` (15% opacity), large item count, order time, compact item list, swipe-to-mark
- **Table Cell:** `bg-table-{status}` (15% opacity), large table number, customer name optional, tap to view orders
- **Menu Item Row:** category badge, half/full toggle, price display, stock indicator
- **Quick-Order Tile:** soft pastel bg, item name, quantity spinner, clear tap target (48px+)
- **Billing GST:** toggle switch, rate buttons (5%/12%/18%/28%), CGST/SGST line items, grand total

## Motion

- Entrance: fade-in 0.3s on card/table mount
- KOT update: subtle scale-up 0.2s on new order, pulse on ready
- Hover: table cell → shadow-soft-hover, KOT card → lift + shadow, button → scale-tap
- Swipe: fast KOT card swipe-to-mark Cooking/Ready (momentum physics)

## Constraints

- Table grid: mobile 2–3 cols (responsive), tablet 4–6, desktop 8+
- KOT cards: max 3 visible on mobile, scroll horizontally or tab filter
- Quick-order: 2–3 cols mobile, 4+ desktop
- Menu: full-width list on mobile, grid 2–3 cols on tablet, sortable by category
- Billing: all controls fit portrait without scroll

## Signature Detail

KOT status colors (yellow→orange→green) create instant cognitive recognition of food prep progress. Table grid provides restaurant owner a glanceable overview — green=revenue-ready, orange=service in progress, blue=future revenue. No technical jargon — pure operational clarity.
