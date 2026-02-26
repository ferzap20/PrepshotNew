# PrepShot - Style Guide & Design Decisions

## Brand Identity

### Name

**PrepShot** - A blend of "Prep" (camera preparation) and "Shot" (the fundamental unit of filmmaking). Conveys readiness and precision.

### Logo

- **Concept**: Stylized camera iris/lens aperture with 6 iris blades radiating from center
- **Construction**: SVG-based, scalable, three concentric rings (barrel, element, inner) + iris blade shapes + center dot
- **Sizes**: `sm` (28px), `md` (36px), `lg` (48px)
- **Logotype**: "Prep" in foreground color + "Shot" in primary accent color, Inter font, tight tracking

### App Icon

- Rounded square (12px radius) with amber fill
- Simplified 4-blade iris in dark color on amber background
- Works at all sizes from favicon to mobile home screen

---

## Color System

### Philosophy

Dark-first design inspired by professional on-set tools that need to work in low-light environments (DIT tents, dark stages, dawn call times). The amber accent is drawn from the warm tungsten tones of film lighting.

### Core Palette

| Token                  | Hex                         | Usage                                                          |
| ---------------------- | --------------------------- | -------------------------------------------------------------- |
| `--background`         | `#0B0D11`                   | Page background - near-black with subtle blue undertone        |
| `--foreground`         | `#E8EAED`                   | Primary text - warm white, not pure white to reduce eye strain |
| `--card`               | `#14171D`                   | Card/panel backgrounds - slightly elevated from background     |
| `--secondary`          | `#1C2028`                   | Secondary surfaces, input backgrounds, hover states            |
| `--muted-foreground`   | `#8B8FA3`                   | Secondary text, labels, timestamps                             |
| `--primary`            | `#E8A030`                   | Primary accent - warm amber/tungsten gold                      |
| `--primary-foreground` | `#0B0D11`                   | Text on primary color                                          |
| `--border`             | `rgba(255, 255, 255, 0.08)` | Subtle borders, 8% white opacity                               |

### Semantic Colors

| Token             | Hex       | Usage                                     |
| ----------------- | --------- | ----------------------------------------- |
| `--destructive`   | `#E5484D` | Errors, delete actions, critical alerts   |
| Emerald `#10B981` | -         | Success, online status, completed items   |
| Amber `#F59E0B`   | -         | Warnings, pending items, attention needed |
| Blue `#3B82F6`    | -         | Info, links, secondary actions            |
| Purple `#8B5CF6`  | -         | Crew/people related, tertiary accent      |
| Rose `#F43F5E`    | -         | Urgent alerts, overdue items              |

### Color Application Rules

1. **Primary accent sparingly**: Use `--primary` (amber) only for the most important interactive elements, active states, and key data points
2. **Status colors at 15% opacity**: Status badges use `bg-{color}/15 text-{color}` pattern for subtle indication
3. **Borders at 8% white**: Keep borders barely visible to maintain clean card edges without visual noise
4. **Hover states**: Cards use `hover:border-primary/20` for subtle amber glow on interaction

---

## Typography

### Font Stack

- **Primary**: `Inter` - Clean, modern sans-serif optimized for UI. Variable weight support.
- **Monospace**: `JetBrains Mono` - Used for serial numbers, technical identifiers, code-like data
- **Fallback**: `system-ui, -apple-system, sans-serif`

### Scale (defined in theme.css)

- `h1`: `text-2xl` (1.5rem) - Page titles, welcome messages
- `h2`: `text-xl` (1.25rem) - Section headers
- `h3`: `text-lg` (1.125rem) - Card titles, subsection headers
- `h4`: `text-base` (1rem) - Item titles
- Body: `text-sm` (0.875rem) - Primary body text
- Caption: `text-xs` (0.75rem) - Timestamps, metadata, labels
- Micro: `text-[10px]` - Tags, badges, secondary metadata

### Weight Usage

- `400 (normal)`: Body text, descriptions, input values
- `500 (medium)`: Headings, labels, buttons, navigation items (set via `--font-weight-medium`)
- `600 (semibold)`: Reserved for emphasis within headings (rarely used)

### Tracking

- Logo text: `tracking-tight` (-0.025em)
- Uppercase labels: `tracking-wider` (0.05em)
- Body text: Default tracking

---

## Spacing & Layout

### Grid System

- **Max content width**: 1400px (`max-w-[1400px]`)
- **Page padding**: `p-4` mobile, `p-6` desktop (`lg:p-6`)
- **Section gap**: `space-y-6` (1.5rem) between major sections
- **Card internal padding**: `p-4` (1rem)
- **Item gap within cards**: `space-y-2` or `space-y-3`

### Responsive Breakpoints

- `sm` (640px): Minor layout adjustments, show/hide secondary text
- `md` (768px): Desktop search bar visible, 2-column grids
- `lg` (1024px): Sidebar always visible, sidebar offset (`pl-60`)
- `xl` (1280px): 3-column main layout (2+1 split)

### Sidebar

- Width: `w-60` (240px)
- Fixed position, top-16 (below header)
- Mobile: Slide-in overlay with backdrop
- Desktop: Always visible, content offset

---

## Component Patterns

### Cards

```
bg-card border border-border rounded-xl
hover:border-primary/20 transition-colors
```

- Always `rounded-xl` (0.75rem)
- Subtle border, hover reveals amber accent
- Internal padding `p-4`
- Group hover for child element transitions

### Buttons

**Primary**: `bg-primary text-primary-foreground rounded-lg hover:bg-primary/90`
**Secondary**: `bg-secondary border border-border text-foreground rounded-lg hover:bg-secondary/80`
**Ghost**: `p-2 rounded-lg hover:bg-secondary transition-colors`
**Icon**: `p-2 rounded-lg` with muted-foreground icon color

### Status Badges

```
text-xs px-2 py-0.5 rounded-full border
bg-{statusColor}/15 text-{statusColor} border-{statusColor}/20
```

### Stats Cards

- Icon in `bg-primary/10` rounded container
- Large value number, small label below
- Optional trend indicator (up/down with color)

### Alert Items

- Left border color indicates severity (`border-l-2`)
- Background tint at 5% opacity matching severity
- Icon color matches severity

### List Items

- Separated by `border-b border-border`
- Hover state optional (`hover:bg-secondary/30`)
- Consistent icon + content + meta layout

---

## Iconography

### Library

**Lucide React** - Consistent 24px stroke icons, used at these sizes:

- `18px`: Navigation items, card header icons
- `16px`: Inline icons, button icons, status icons
- `14px`: Small metadata icons
- `12px` / `11px`: Micro metadata (within text lines)

### Icon Colors

- Navigation active: `text-primary`
- Navigation inactive: `text-sidebar-foreground/70`
- Metadata: `text-muted-foreground`
- Status: Matches semantic color (emerald, amber, red, blue)

---

## Animation & Transitions

### Defaults

- Color/opacity transitions: `transition-colors` (150ms ease)
- All properties: `transition-all` (150ms)
- Sidebar slide: `transition-transform duration-200 ease-in-out`
- Image zoom on hover: `transition-transform duration-500` with `group-hover:scale-105`

### Principles

1. **Subtle over flashy**: Transitions should feel responsive, not decorative
2. **Performance**: Use `transform` and `opacity` for GPU-accelerated animations
3. **Backdrop blur**: `backdrop-blur-xl` on header for depth without heavy shadows

---

## Interaction Patterns

### Search

- Global search in header with keyboard shortcut hint (`/`)
- Mobile: Collapsible search bar below header
- Placeholder text describes searchable content: "Search equipment, projects, crew..."

### Navigation

- Sidebar with grouped sections (Main, System)
- Active state: `bg-primary/10 text-primary`
- Badge counts for actionable items
- Sync status indicator at sidebar bottom

### Cards as Links

- Entire card is clickable (`cursor-pointer`)
- Hover reveals chevron or border highlight
- Group hover pattern for coordinated child transitions

---

## Data Display Conventions

### Dates

- Short format: "Feb 26", "Mar 3"
- Day of week: 3-letter abbreviation ("Thu", "Fri")
- Times: 12-hour with AM/PM ("6:00 AM")

### Numbers

- Equipment counts: Plain number
- Progress: Fraction format "Day 14/45" with percentage
- Badge counts: Number in pill

### Status Labels

- Active/Shooting: Emerald
- Prepping: Amber/Primary
- Wrapped: Muted gray
- On Hold: Amber

### Project Tags

- Small pill: `text-[10px] bg-primary/10 text-primary/70 px-1.5 py-0.5 rounded`
- Used to associate items with their parent project

---

## Offline-First Considerations

### Visual Indicators

- Online/Offline status in header with Wifi/WifiOff icon
- Sync timestamp in sidebar footer
- Green dot for synced, amber for pending

### Design Implications

- All data should feel locally available (no loading spinners for cached data)
- Queue indicators for pending sync operations
- Graceful degradation messaging when features require connectivity

---

## Accessibility Notes

### Contrast

- All text meets WCAG AA minimum against dark backgrounds
- Primary amber (#E8A030) on dark (#0B0D11) = 7.2:1 ratio (AAA)
- Muted text (#8B8FA3) on card (#14171D) = 4.7:1 ratio (AA)

### Focus States

- `outline-ring/50` applied globally via Tailwind base
- Interactive elements use visible focus rings

### Touch Targets

- Minimum 44px touch target for mobile interactive elements
- Sidebar nav items: `py-2` with full-width click area
- Header buttons: `p-2` minimum (36px effective)

---

## File Structure

```
src/app/
  App.tsx                    # Router provider entry
  routes.ts                  # Route definitions
  components/
    AppLayout.tsx            # Shell with header + sidebar + outlet
    Header.tsx               # Top bar with search, status, user
    Sidebar.tsx              # Navigation sidebar
    PrepShotLogo.tsx         # Logo + Icon SVG components
    WelcomeBanner.tsx        # Personalized greeting banner
    StatsCard.tsx            # Metric display card
    ProjectCard.tsx          # Project summary card with image
    QuickActions.tsx         # Action grid buttons
    RecentActivity.tsx       # Activity feed
    UpcomingShootDays.tsx    # Schedule preview
    EquipmentAlerts.tsx      # Warning/alert list
  pages/
    HomePage.tsx             # Dashboard composition
    PlaceholderPage.tsx      # Stub for unbuilt sections
```