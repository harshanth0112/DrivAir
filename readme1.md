DRIVAIR --- Global Design System & UX Specification
Design direction: Hyper-Saturated Fluid --- adapted for a
professional B2B transport and contract marketplace.

Applies to: Every page, component, and portal in DRIVAIR: Public,
Company, Driver, Vehicle Owner, and Admin.

Primary requirement: A bold, premium visual identity with clear
information hierarchy, accessible contrast, predictable interactions,
and mobile-first responsive behaviour.

1. Design Vision
DRIVAIR should feel like a premium, modern mobility-tech platform:
confident, energetic, trustworthy, and easy to operate.

Use the supplied Cyber Yellow + Deep Onyx + Glassmorphism + Liquid
Geometry visual language, but adapt it to a working business
application. The landing page can be expressive and dramatic;
dashboards, forms, tables, bidding, documents, and chat must prioritise
readability and task completion.
Design principles
1. Bold brand, calm workflow: Use saturated yellow for brand
   moments and important actions, not as a background behind every
   piece of data.
2. Liquid sectioning: Use organic curves and oversized rounded
   shapes for hero sections, landing-page transitions, and selected
   empty states. Do not use irregular shapes behind dense forms or
   tables.
3. Dark premium foundation: Use deep onyx for the main shell and
   charcoal for surfaces.
4. Glass with restraint: Use glassmorphism for hero overlays,
   floating summaries, and selected highlight cards. Use solid surfaces
   for data-heavy content to preserve legibility.
5. Mobile-first usability: Every task must work comfortably on a
   narrow phone screen with touch-friendly controls.
6. Consistent UX: All portals share the same design tokens,
   components, navigation rules, feedback patterns, and accessibility
   standards.
7. Clear trust signals: Verification status, document expiry, offer
   state, and contract status must always be explicit in both text and
   colour.
2. Brand Tokens
Create one central token source. Do not scatter raw hex values
throughout components.
2.1 Colour palette
  Token                   Value                      Usage
  brand.primary         #FDE047                  Cyber Yellow: primary
CTA, highlights, key
brand moments

  brand.primaryHover    #FACC15                  Hover/pressed yellow

  brand.primarySoft     #FEF3A6                  Soft highlight
background

  background.canvas     #0A0A0A                  Deep Onyx app
background

  background.surface    #171717                  Main cards, panels,
sidebars

  background.elevated   #202020                  Elevated panels and
popovers

  background.subtle     #262626                  Inputs, secondary
controls, table rows

  text.primary          #FFFFFF                  Main text on dark
surfaces

  text.secondary        #B8B8B8                  Supporting text

  text.muted            #858585                  Hints and metadata; do
not use for essential
information

  border.default        rgba(255,255,255,0.12)   Standard dark-surface
borders

  border.glass          rgba(255,255,255,0.20)   Glass borders

  status.success        #22C55E                  Verified, completed,
accepted

  status.warning        #F59E0B                  Pending, expiring soon,
needs attention

  status.danger         #EF4444                  Rejected, expired,
failed, blocked
status.info           #38BDF8                  Informational states
Colour rules - Yellow is the brand accent, not the universal status
colour. - Never communicate status by colour alone. Always include a
text label and, where useful, an icon. - Use white or near-white text on
dark surfaces. Use near-black text on yellow surfaces. - Do not place
small white text on yellow. - Keep yellow surfaces visually dominant
only in selected areas, especially the landing hero and key CTA. - Avoid
gradients on the primary Cyber Yellow brand surface. Neutral dark
surfaces may use subtle tonal layering, not decorative rainbow
gradients.
2.2 Typography
Use Inter as the default font. If General Sans is available and
licensed for the project, it may be used as an alternative. Do not mix
font families across portals.

Recommended type scale:

  Role            Desktop    Mobile     Weight
  Hero display    64--88px   40--52px   700--800
Page title      36--48px   28--34px   700
Section title   24--30px   22--26px   600--700
Card title      18--20px   17--18px   600
Body            14--16px   14--16px   400
Supporting      12--14px   12--14px   400
Label           10--12px   10--12px   600, uppercase, letter spacing

Rules: - Use oversized typography on the public landing page, not inside
every dashboard card. - Keep paragraphs short and scannable. - Use
tabular numerals for prices, counts, dates, and contract values. - Do
not make essential information smaller than 12px.
2.3 Shape, radius, spacing
- Primary buttons and compact badges: pill-shaped (9999px).
- Glass/highlight cards: 28–32px.
- Standard cards and panels: 20–24px.
- Inputs and dropdowns: 14–16px (do not force pill inputs if it
  harms form clarity).
- Hero shapes: large asymmetric curves such as rounded-b-[80px] to
  rounded-b-[120px].
- Use a consistent 4px spacing base.
- Dashboard content padding: 24--32px desktop, 16--20px tablet, 16px
  mobile.
- Use whitespace to separate content rather than unnecessary borders.
3. Global Application Shell
All authenticated portals must share a consistent shell.
Desktop
- Fixed or sticky left sidebar, approximately 248--272px wide.
- Main content area uses the dark canvas.
- Top bar includes page context, search where appropriate,
  notifications, and profile menu.
- Main content has a readable maximum width; do not stretch forms and
  text across very wide screens.
- Sidebar shows active navigation clearly with a yellow accent or
  subtle yellow surface.
- Use collapsible sidebar where the screen is smaller.
Tablet
- Sidebar collapses to icon rail or drawer.
- Main content uses available width.
- Two-column cards become one or two columns based on actual space.
- Tables may scroll horizontally only when a card-based mobile
  presentation is not suitable.
Mobile
- Do not show a permanently expanded desktop sidebar.
- Use a compact top bar and a mobile navigation drawer or bottom
  navigation for the most common destinations.
- Keep no more than 4--5 primary items in bottom navigation; put
  less-used destinations in "More".
- Main content is a single column by default.
- Convert wide tables into stacked cards or labelled key-value rows.
- Keep important actions reachable without horizontal scrolling.
- Use sticky bottom action bars only when they help complete a task,
  and ensure they do not cover content.
- Support safe-area padding on modern phones.
- Never require hover to reveal an action.
Navigation by role
Company - Overview - Contract Posts - Find Providers - Bids &
Offers - Contracts - Messages - Notifications - Company Profile

Driver - Overview - Find Work - My Bids - Offers - Contracts -
Messages - My Documents - Profile

Vehicle Owner - Overview - My Vehicles - Find Contracts - My Bids -
Offers - Contracts - Messages - Documents - Profile

Admin - Overview - Users - Verification - Contract Posts - Reports -
Audit Logs - Settings

Use role-specific navigation. Do not show links that the current role
cannot use.
4. Core Component Design
Build reusable components and use them across every portal. Avoid
separate visual implementations of the same component in different role
folders.
4.1 Buttons
Variants: - Primary: Cyber Yellow background, Onyx text. - Dark:
Onyx/Charcoal background, white text. - Secondary: transparent or
charcoal background with subtle border. - Danger: red treatment for
destructive actions. - Ghost: minimal surface for low-priority
actions.

Rules: - Pill shape. - Minimum touch target 44×44px. - Include hover,
focus-visible, active, disabled, and loading states. - Use a subtle
hover scale (maximum 1.02--1.03); do not cause layout shift. - Active
press may scale to 0.97. - Never use a button for navigation if a
semantic link is appropriate. - Destructive actions require
confirmation.
4.2 Inputs and forms
- Use solid charcoal input surfaces, not transparent glass for every
  field.
- Labels remain visible above inputs; placeholders are examples, not
  labels.
- Show required fields clearly.
- Show inline validation beside the relevant field.
- Preserve entered values when server validation fails.
- Group long forms into logical sections or a stepper.
- On mobile, use one column and full-width controls.
- Use correct input types, autocomplete attributes, and mobile
  keyboard hints.
- Clearly show upload progress and file restrictions.
- Do not rely only on red borders to indicate errors.
4.3 Cards and panels
- Standard card: charcoal surface, subtle border, 20--24px radius.
- Glass card: bg-white/10, backdrop-blur-xl, thin white border;
  reserve for highlighted stats, hero overlays, or floating panels.
- Avoid placing dense tables or long forms inside highly transparent
  glass.
- Cards should have clear titles, concise metadata, and one primary
  action.
- Do not make an entire card clickable if it contains multiple
  independent controls.
4.4 Status badges
Use consistent status labels: - Pending - Verified - Rejected - Expiring
soon - Expired - Open - Shortlisted - Negotiating - Accepted -
Withdrawn - Active - Completed - Cancelled

Each badge includes readable text and a consistent semantic colour/icon.
Do not use yellow for every status; reserve it for pending/attention and
brand emphasis.
4.5 Tables and data lists
- Desktop tables use clear column headers, row spacing, and restrained
  dividers.
- Provide sorting and filtering only when useful.
- Include empty, loading, and error states.
- On mobile, transform tables into stacked cards with labelled values.
- Keep row actions visible and touch accessible.
- Avoid tiny icon-only actions without accessible labels.
4.6 Modals, drawers, and alerts
- Use modals for short decisions, confirmations, or focused tasks.
- Use full-height or near-full-height drawers on mobile when
  appropriate.
- Keep dialog titles and primary/secondary actions clear.
- Trap keyboard focus, support Escape where safe, and return focus to
  the trigger.
- Use toast notifications for brief success/failure feedback;
  important business state changes must also be visible on the page.
4.7 Chat
- Chat list and conversation view use the same dark surfaces.
- Distinguish sent and received messages with clear alignment and
  accessible contrast.
- Show sender, timestamp, delivery/read state where useful.
- Message composer stays usable above the mobile keyboard.
- Use a clear attachment preview and upload progress.
- Do not use glass effects that reduce message readability.
5. DRIVAIR-Specific UX Patterns
5.1 Contract marketplace
A contract post card should show: - Contract title and service
category. - Company name and verification state. - Location. - Contract
duration and start date. - Required number of drivers/vehicles. - Budget
range and price period, if disclosed. - Application deadline. - Primary
action: View details / Submit bid.

Post detail page: - Keep the requirements easy to scan. - Put the bid
form in a clearly labelled section. - Explain the price period
(weekly/monthly/yearly/total) beside the amount. - Show the deadline and
post status. - Never imply that the lowest bid automatically wins.
5.2 Bid submission and comparison
Provider bid form: - Proposed amount. - Price period. - Vehicle
selection if relevant. - Short proposal message. - Clear edit/withdraw
rules.

Company bid comparison: - Compare price, period, provider type,
experience, verification, availability, and relevant vehicle details. -
Do not rank providers only by lowest price. - Show missing or unverified
documents clearly. - Confirm before accepting a bid. - Explain that
acceptance creates a contract.
5.3 Direct hiring
- Search filters should be simple and removable.
- Show verified status, availability, experience, location, and
  relevant vehicle details.
- Use a clear "Send direct offer" action.
- Offer form must show service, duration, location, proposed amount,
  and price period.
- Clearly distinguish "Offer sent", "Negotiating", "Accepted",
  "Rejected", and "Expired".
5.4 Documents and verification
- Show document type, masked document number, issue/expiry date, and
  verification status.
- Show expiry warnings in advance.
- Provide a clear re-upload action for rejected or expired documents.
- Explain rejection reasons in plain language.
- Do not expose full document numbers in list views.
- Make document requirements conditional on applicable provider,
  vehicle category, service, and state.
5.5 Contracts
- Display contract number, both parties, service, duration, agreed
  price, and status.
- Use a readable contract detail view.
- Make the source clear: accepted bid or direct hire.
- Provide a print/download option only when the document generation
  feature exists.
- Confirm before cancellation or termination and record the reason.
5.6 Dashboard
Dashboards should answer: 1. What needs my attention? 2. What is
happening now? 3. What should I do next?

Use a small number of meaningful summary cards. Avoid decorative charts
without actionable information. Examples: - Company: Open posts, new
bids, pending offers, active contracts. - Driver: Available
opportunities, submitted bids, new offers, active contracts, documents
needing attention. - Vehicle owner: Active vehicles, new opportunities,
submitted bids, offers, documents expiring soon. - Admin: Pending
verifications, flagged accounts, open reports, active users.
6. Landing Page Visual Direction
The public landing page may use the strongest version of the
Hyper-Saturated Fluid design.
Hero
- Cyber Yellow is the dominant hero surface.
- Deep Onyx text.
- Massive left-aligned headline, short supporting copy, and two clear
  CTAs.
- Use an asymmetric liquid bottom edge or large organic corner radius.
- Add one glassmorphic floating marketplace preview showing a
  realistic contract/bid summary.
- Keep the hero uncluttered.
Suggested headline: Move business forward. Hire direct.

Suggested supporting text: Find trusted drivers and vehicle owners,
compare contract offers, and manage every agreement in one place.

Primary CTA: Get started Secondary CTA: Explore how it works
Following sections
1. Dark "void" section explaining the problem DRIVAIR solves.
2. Three clear workflow cards: Post a contract, Compare bids, Hire
   directly.
3. Marketplace preview with sample driver/vehicle cards.
4. Trust and verification section.
5. Role-based "For companies / For drivers / For vehicle owners"
   section.
6. Final yellow CTA section.
7. Dark footer with navigation, contact, legal links, and social links.
Use liquid transitions between selected major sections, not every card
or content block. Do not add fake partner logos, awards, ratings, user
counts, or testimonials. Only show verified real proof.
7. Responsive Breakpoints and Layout Rules
Use Tailwind breakpoints consistently. Suggested targets:
  Range                               Layout behaviour
  <640px                            Phone: one column, drawer/bottom
nav, stacked cards, full-width
actions

  640–767px                         Large phone: one/two-column cards
as space permits

  768–1023px                        Tablet: collapsible sidebar,
flexible grids

  1024–1279px                       Small desktop: sidebar and
two/three-column content
1280px+                           Desktop: full dashboard layout with
controlled max content width
Responsive acceptance requirements: - No page-level horizontal overflow
at 320px viewport width. - All forms usable at 320--375px. - Buttons and
inputs have at least 44px touch targets. - Long titles and addresses
wrap safely. - Tables have a mobile card layout or deliberate scroll
container. - Dialogs fit within the viewport and remain scrollable. -
Chat composer remains visible when the mobile keyboard opens. - Images
preserve aspect ratio and do not distort. - Sticky headers/actions do
not hide focused fields or content. - Test portrait and landscape phone
orientation.

Do not rely only on device names; test the layout at multiple actual
viewport widths.
8. Accessibility and Usability Requirements
Target WCAG 2.2 AA where practical.
- Maintain sufficient text/background contrast.
- Every input has a programmatic label.
- Every icon-only button has an accessible name.
- All actions are keyboard accessible.
- Focus indicators are clearly visible.
- Do not communicate state by colour alone.
- Respect prefers-reduced-motion.
- Avoid flashing, parallax, and continuous movement that distracts.
- Use semantic headings in logical order.
- Use descriptive link text.
- Announce important asynchronous success/error messages to assistive
  technology.
- Ensure validation messages explain how to fix the issue.
- Do not use tiny text for essential details.
- Avoid hover-only menus and interactions.
9. Motion and Interaction
Use motion to clarify state, not decorate every interaction.
- Entrance: subtle upward movement and fade, using
  cubic-bezier(0.22, 1, 0.36, 1).
- Hover: slight elevation or scale; keep movement restrained.
- Button press: transform: scale(0.97).
- Glass float: optional, slow and subtle, only on non-critical
  decorative hero elements.
- Loading: skeletons for content areas and spinners for short actions.
- Respect reduced-motion settings by removing non-essential
  animations.
- Do not animate large dashboard sections repeatedly.
- Avoid animations that delay user actions.
10. Tailwind Implementation Guidance
Use CSS variables as the source of truth and map Tailwind utilities to
them. Example global CSS:
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --color-brand: #FDE047;
  --color-brand-hover: #FACC15;
  --color-canvas: #0A0A0A;
  --color-surface: #171717;
  --color-elevated: #202020;
  --color-subtle: #262626;
  --color-text: #FFFFFF;
  --color-text-secondary: #B8B8B8;
  --color-border: rgba(255, 255, 255, 0.12);
  --radius-card: 24px;
  --radius-glass: 32px;
  --radius-pill: 9999px;
}

html {
  font-family: 'Inter', sans-serif;
  background: var(--color-canvas);
  color: var(--color-text);
}

body {
  min-width: 320px;
  margin: 0;
  background: var(--color-canvas);
}

:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
Tailwind utility examples (adapt to the installed Tailwind version):
// Primary CTA
<button className="min-h-11 rounded-full bg-[#FDE047] px-6 py-3 font-semibold text-[#0A0A0A] transition hover:scale-[1.02] hover:bg-[#FACC15] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FDE047]">
  Create contract
</button>

// Standard dashboard card
<section className="rounded-3xl border border-white/10 bg-[#171717] p-5 sm:p-6">
  ...
</section>

// Highlight glass card — use selectively
<section className="rounded-[32px] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
  ...
</section>

// Responsive card grid
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
  ...
</div>
Do not copy these snippets blindly if the project uses a different
Tailwind version. Keep tokens centralised and reusable.
11. Implementation Plan for the Existing DRIVAIR App
Apply the design system globally without breaking existing business
logic.
Phase A --- Audit before changing
1. Inspect the existing frontend folder and installed dependencies.
2. Identify current routes, portal layouts, shared components, and
   styling setup.
3. Identify all pages for Company, Driver, Vehicle Owner, Admin, and
   Public.
4. List duplicated components and inconsistent styles.
5. Do not delete or replace working features.
6. Report the current state and propose a safe sequence of UI changes.
Phase B --- Foundation
1. Add global font and design tokens.
2. Configure Tailwind theme/utilities for brand colours and radii.
3. Create shared typography, spacing, button, input, card, badge,
   modal, table, and empty-state components.
4. Add responsive breakpoints and focus/reduced-motion rules.
5. Establish consistent icon sizing and button labels.
Phase C --- Shared layouts
1. Build/update the public layout.
2. Build/update the authenticated desktop shell.
3. Add mobile drawer or bottom navigation.
4. Add role-aware navigation.
5. Add responsive page containers and headers.
6. Verify all routes still work.
Phase D --- Apply to all pages
Apply the shared design system in this order:
1. Authentication and onboarding.
2. Company dashboard and contract posting.
3. Marketplace search and provider profiles.
4. Bid submission and bid comparison.
5. Direct hiring and offer management.
6. Chat messenger.
7. Driver portal.
8. Vehicle owner portal and vehicle management.
9. Documents and verification.
10. Contract management.
11. Admin portal.
12. Public landing page and informational pages.
The landing page can be visually expressive. Internal pages should be
visually consistent but task-focused.
Phase E --- Responsive and UX QA
1. Test every route at 320px, 375px, 768px, 1024px, and 1440px.
2. Check for horizontal overflow.
3. Check every form, modal, dropdown, table, navigation menu, and chat
   view.
4. Test keyboard navigation and visible focus.
5. Test loading, empty, success, error, disabled, and permission-denied
   states.
6. Verify that no business logic, API payload, route guard, or
   permission was changed by styling work.
7. Fix layout issues before declaring completion.
12. Definition of Done
The global design system is complete only when:
- [ ] All portals use the same brand tokens and typography.
- [ ] All pages use shared component styles.
- [ ] Company, Driver, Vehicle Owner, Admin, and Public layouts are
  covered.
- [ ] Desktop, tablet, and mobile layouts work.
- [ ] No horizontal page overflow at 320px.
- [ ] Forms remain clear and easy to complete on mobile.
- [ ] Tables become readable mobile cards or controlled scroll
  regions.
- [ ] Navigation is usable with touch and keyboard.
- [ ] Buttons, inputs, badges, dialogs, and feedback states are
  consistent.
- [ ] Status is not communicated by colour alone.
- [ ] Motion respects reduced-motion preferences.
- [ ] Existing application functionality and API behaviour remain
  intact.
- [ ] No fake trust claims, partner logos, ratings, or metrics have
  been introduced.
13. Prompt for the IDE Agent
Paste this into the IDE agent after placing this file in the repository
as DESIGN_SYSTEM.md:
You are the senior product designer and frontend engineer for DRIVAIR.

Read README.md and DESIGN_SYSTEM.md fully before making changes.

Goal:
Apply the DRIVAIR Hyper-Saturated Fluid design system consistently across the entire existing application: Public, Company, Driver, Vehicle Owner, and Admin portals. The app must be mobile-first, responsive, accessible, and easy to use.

Mandatory workflow:
1. Inspect the existing repository and identify the frontend stack, routes, layouts, components, and current styling approach.
2. Do not rewrite the application or remove working features.
3. First report the current UI structure and a page-by-page implementation plan.
4. Implement the design tokens and global typography first.
5. Create reusable shared components and portal layouts.
6. Apply the design system to every existing page, not only the landing page or dashboard.
7. Preserve existing API calls, backend contracts, validation, permissions, route behaviour, and business logic.
8. Use Cyber Yellow (#FDE047), Deep Onyx (#0A0A0A), Charcoal (#171717), and white as defined in DESIGN_SYSTEM.md.
9. Use glassmorphism selectively. Never sacrifice text contrast or form/table readability for visual effects.
10. Use liquid organic shapes mainly on the landing page and selected visual transitions. Keep data-heavy internal pages clean and structured.
11. Implement mobile navigation and responsive layouts for all roles.
12. Test at 320px, 375px, 768px, 1024px, and 1440px widths.
13. Ensure no horizontal page overflow, touch targets are at least 44px, and keyboard focus is visible.
14. Include loading, empty, error, success, disabled, and permission-denied states.
15. Respect prefers-reduced-motion.
16. Do not invent partner logos, customer counts, awards, testimonials, ratings, or trust claims.
17. Do not mark the task complete until all application routes have been reviewed and responsive-tested.

Work in phases:
A. Audit existing UI.
B. Design tokens and shared components.
C. Shared responsive layouts and navigation.
D. Apply design to every portal and page.
E. Responsive, accessibility, and regression QA.

After each phase, report:
- files changed,
- pages/components completed,
- responsive widths tested,
- functionality preserved,
- issues remaining,
- next phase.

Start with Phase A only. Do not make large unreviewed changes.
Final Design Rule
DRIVAIR should look bold at first glance and feel effortless during
everyday work. Use the Cyber Yellow liquid hero to make the brand
memorable; use disciplined dark surfaces, clear forms, strong status
communication, and mobile-first layouts to make the actual marketplace
reliable.