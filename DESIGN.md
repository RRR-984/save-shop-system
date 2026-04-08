# Design Brief: Multi-User Role System

## Direction

**Role-Based Authority Hierarchy** — Extend Save Shop System with Owner/Manager/Staff roles, each with distinct visual identity, access controls, and secure PIN-based authentication.

## Tone

Professional, hierarchical, security-conscious — every role communicates its authority level instantly through color, typography, and UI affordances without sacrificing mobile accessibility.

## Differentiation

Role badges are scannable at a glance: Owner (brand blue, full authority), Manager (purple, medium authority), Staff (gray, execution-only). PIN entry feels intentional and secure. Staff Management is friction-free with inline toggles.

## Color Palette (Role Tokens)

| Token               | OKLCH           | Role                           |
| ------------------- | --------------- | ------------------------------ |
| role-owner-bg       | 0.55 0.2 258    | Owner badge background (blue)  |
| role-manager-bg     | 0.6 0.12 308    | Manager badge background (purple) |
| role-staff-bg       | 0.5 0.01 264    | Staff badge background (gray)  |
| role-owner-fg       | 1 0 0           | Owner badge text (white)       |
| role-manager-fg     | 1 0 0           | Manager badge text (white)     |
| role-staff-fg       | 0.86 0.008 264  | Staff badge text (light gray)  |

## Typography

- Display: Plus Jakarta Sans (700 weight) — role labels, headers, PIN entry prompts
- Body: Plus Jakarta Sans (500/400 weight) — staff names, mobile numbers, descriptions
- Scale: headers use uppercase, body text sentence-case; all role badges uppercase small caps

## Elevation & Depth

Minimal shadow hierarchy: role badges have flat backgrounds with 15% opacity tint; cards use subtle shadow-card; staff management table rows have 2px left border accent (role-colored) on hover.

## Structural Zones

| Zone                 | Background     | Border         | Notes                                  |
| -------------------- | -------------- | -------------- | -------------------------------------- |
| Header (role badge)  | role color 15% | none           | Uppercase label + icon, compact        |
| Staff list (mobile)  | card           | role color 2px | Left accent border, inline toggle      |
| PIN keypad section   | background     | border         | 4x3 grid, large buttons, clear CTA    |
| Footer (actions)     | muted 30%      | border-top     | Delete/confirm buttons, spacing        |

## Spacing & Rhythm

Badges: 0.75rem px, 0.25rem py; staff cards: 1rem padding, 0.5rem gap between elements; keypad: 0.75rem gap between buttons; section gaps 1.5rem (mobile) to 2rem (desktop).

## Component Patterns

- **Badges:** `badge-{role}` classes, rounded-full, uppercase 0.75rem text, 15% opacity background
- **Staff Cards:** responsive grid → table on desktop; role badge + toggle switch + delete button per row
- **PIN Input:** masked input field, 4 PIN boxes side-by-side, on-screen numeric keypad (0-9, del, confirm)
- **Toggles:** green when active, gray when inactive, smooth transition

## Motion

- Entrance: fade-in 0.4s on badge/card mount
- Hover: card lift on staff row (shadow-card → shadow-card-hover), button active:scale-95
- Decorative: none (security-focused, minimal distraction)

## Constraints

- Role badges must fit single line on mobile (max ~80px width)
- PIN entry must work on portrait mode without horizontal scroll
- Staff Management must show at least 4 columns on tablet (name, mobile, role, actions)
- All interactive elements must have 44px+ tap target (WCAG)

## Signature Detail

Role badge color system: Owner dominates (brand blue authority), Manager holds middle ground (purple responsibility), Staff recedes (gray execution) — every role's visual weight matches its system responsibility.
