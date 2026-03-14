# Skill: Design Heuristics

Apply this skill whenever the user asks for UI/UX review, design feedback, screen critique, design guidance, or when creating/evaluating any visual interface. Also apply when discussing colors, typography, spacing, buttons, navigation, forms, cards, accessibility, motion, or Figma implementation.

---

## CORE PRINCIPLES (Always Apply)

### Before creating any screen:
1. Define visual hierarchy — what does the user see FIRST? SECOND? THIRD?
2. One primary action per screen — never compete with 2 CTAs of equal weight
3. White space is not waste — it's clarity
4. Consistency over creativity — if the design system defines a pattern, follow it
5. Mobile-first — start from the smallest viewport and expand

### The 4 Pillars of Visual Design:
- **Hierarchy**: Size, weight, color, position, spacing
- **Contrast**: Min 4.5:1 ratio for normal text (WCAG AA); 3:1 for large text (≥18px bold or ≥24px)
- **Alignment**: Everything aligns to something. Use 8px grid for all spacing
- **Proximity**: Related elements together (8-12px), unrelated apart (24-32px+). Space between groups ≥ 2× space within groups

### Mobile Golden Rules:
- Touch targets: min 44×44px (Apple HIG) / 48×48dp (Material). Spacing between targets: min 8px
- Circular buttons: width === height, cornerRadius = width/2. NEVER oval
- Safe areas: top (44px iOS / 24dp Android), bottom home indicator (34px iOS)
- Primary actions in the bottom half (thumb zone)
- Min text: body 16px, caption 12px, screen title 20-28px

---

## UX LAWS

| Law | Rule |
|---|---|
| **Fitts's** | Larger + closer = faster. Primary CTA largest, full-width on mobile. Destructive actions smaller and far from main CTA |
| **Hick's** | Max 5 bottom nav items, max 5-7 form fields visible, 1 primary + max 2 secondary actions per screen |
| **Jakob's** | Use familiar patterns. Back button top-left. Pull to refresh. Swipe left to delete. Search icon = magnifying glass |
| **Miller's** | Group data in chunks ≤7. Phone/card numbers in groups. OTP = individual fields |
| **Von Restorff** | Primary CTA = ONLY element with accent color on screen. Others outlined or ghost |
| **Serial Position** | Most important at first or last position. Middle is forgotten |
| **Doherty** | Visual feedback <100ms. Loading state if >400ms. Screen transition 200-500ms |
| **Aesthetic-Usability** | Beautiful = perceived as easier. Generous spacing, consistent border-radius, max 3 colors + neutrals |
| **Peak-End** | Invest in success screens — user remembers first + last moment. Animate the confirmation |
| **Zeigarnik** | Show progress. "Step 2 of 4". Profile completion %. Never hide progress in multi-step flows |
| **Tesler's** | System absorbs complexity. Autocomplete, smart defaults, auto-formatting. Never make user type what the system can infer |
| **Postel's** | Accept flexible input formats (phone with/without dashes), display in correct format |

---

## GESTALT PRINCIPLES

| Principle | Rule |
|---|---|
| **Proximity** | Within group: 8-12px. Between groups: 24-32px. Label→Input: 4-8px. Sections: 32-48px |
| **Similarity** | All primary buttons: same color, border-radius, weight. All cards: same radius, shadow, padding |
| **Continuity** | Consistent left margin. Carousel: clip last item at ~30% to invite scroll |
| **Closure** | Cards don't need borders — background + padding creates container perception |
| **Figure-Ground** | Modal: 50-60% overlay. Dropdown: level 2 shadow. FAB: pronounced shadow |
| **Common Region** | Related info inside same card/container. Never mix unrelated content in one card |
| **Symmetry** | Consistent padding (if left=24px, right=24px). Equal distribution in bottom nav |
| **Common Fate** | Elements in same group animate together. Skeleton shimmer moves in same direction |

**Elevation shadows:**
- Level 1 (cards/inputs): `0 1px 3px rgba(0,0,0,0.08)`
- Level 2 (dropdowns): `0 4px 12px rgba(0,0,0,0.12)`
- Level 3 (modals/bottom sheets): `0 8px 24px rgba(0,0,0,0.16)`
- Level 4 (FAB): `0 12px 32px rgba(0,0,0,0.20)`

---

## LAYOUT & SPACING (8px Grid)

**Spacing scale:** 2 / 4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64px

**Screen margins:** Mobile: 16-24px sides. Tablet: 24-32px, max-width 600px. Desktop: max-width 1200px

**Default viewport:** 393×852px (iPhone 15 Pro)

**Auto-layout rules:**
- EVERYTHING uses auto-layout — no manually positioned elements except overlays
- Set FILL on child ONLY AFTER appending child to auto-layout parent
- Full-width button: layoutSizingHorizontal = FILL, height FIXED 48-56px

**Safe areas:**
- iOS: status bar 47px (Dynamic Island) / 44px (notch); home indicator 34px bottom
- NEVER place interactive elements in safe areas

---

## TYPOGRAPHY

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| display-xl | 40px | 700 | 48px | Hero |
| heading-xl | 28px | 600 | 36px | Screen title |
| heading-lg | 24px | 600 | 32px | Section title |
| heading-md | 20px | 600 | 28px | Card title |
| body-lg | 16px | 400 | 24px | Body, inputs |
| body-md | 14px | 400 | 20px | Labels |
| body-sm | 12px | 400 | 16px | Caption, helper |

**Rules:**
- Max 2 font families per project (1 sans-serif + 1 mono if needed)
- Max 3 weights. Regular + SemiBold = minimum set. NEVER Light/Thin on mobile
- Line height = font-size × 1.3-1.5, rounded to multiple of 4
- Sentence case everywhere. UPPERCASE only for overlines (≤3 words)
- Body minimum 16px. Caption minimum 12px. NEVER smaller
- Recommended fonts: Inter, SF Pro (iOS), Roboto (Android), DM Sans, Plus Jakarta Sans
- Large values: use tabular numbers (tnum or monospace font)

---

## COLOR SYSTEM

**Required semantic colors:**
| Token | Light | Dark | Use |
|---|---|---|---|
| accent | #276EF1 | #5B8DEF | CTAs, links, focus |
| positive | #0E8345 | #34C759 | Success |
| warning | #F6BC2F | #FFD60A | Alerts |
| negative | #DE1135 | #FF453A | Errors, delete |

**Neutral palette (light):** #1A1A1A (headings) → #333 (body) → #666 (secondary) → #999 (placeholder) → #CCC (borders) → #E5E5E5 (subtle borders) → #F0F0F0 (card bg) → #FFF (background)

**Dark mode:**
- NEVER #FFFFFF text — use #E0E0E0
- NEVER #000000 background — use #121212
- Elevation = lighter backgrounds: #121212 → #1E1E1E → #252525 → #2C2C2C

**Contrast (WCAG 2.2 AA):**
- Normal text (<18px): 4.5:1 minimum
- Large text (≥18px bold or ≥24px): 3:1 minimum
- FORBIDDEN: #CCC on #FFF (1.6:1), yellow on white (1.07:1)

**Opacity for states:** Hover: 90% / Pressed: 80% / Focused: 100% + 2px ring / Disabled: 40% / Selected bg: accent 8-12%

**Max per screen:** 1 accent + 1 background + 1-2 neutrals + status colors when needed

---

## BUTTONS & CTAs

**Hierarchy (mandatory):**
- Primary: Filled solid accent — MAX 1 PER SCREEN
- Secondary: Outlined accent — max 2
- Tertiary: Ghost/text — as many as needed

**Sizes:** XSmall 32px / Small 36px / Medium 44px / Large 48-56px

**Circular buttons:** width === height. cornerRadius = size/2. FIXED sizing on BOTH axes. NEVER HUG on circular button.

**States:** Default / Hover / Pressed (scale 0.97-0.98) / Focused (2px accent ring) / Disabled (40% opacity, same size) / Loading (spinner replaces text, size unchanged)

**Labels:** Verb + noun. "Send Payment" not "OK". "Delete Account" not "Yes". Max 3-4 words.

**Positioning:** Primary CTA in bottom half (thumb zone). Cancel (ghost) left, Confirm (filled) right in modals.

**Icons in buttons:** Left = reinforces meaning. Right = direction/progression. Icon-only = only for universally recognized actions.

---

## FORMS & INPUTS

**Anatomy:** Label (14px SemiBold, above field) → Input (48px height, 16px font min) → Helper text (12px)

**Spacing:** Label→Input: 4-8px. Input→Helper: 4px. Field→Field: 16-20px. Group→Group: 32px

**States:** Default (1px neutral border) / Hover (darker border) / Focused (2px accent border + accent label) / Error (2px red border + ⚠ icon + error message) / Disabled (neutral-100 bg, neutral-400)

**Rules:**
- Label ALWAYS visible above field (never placeholder-only)
- Placeholder = format example, NOT a label substitute
- Input font ≥ 16px (prevents iOS auto-zoom)
- Choose 1 height for entire form — NEVER mix
- Validate onBlur (not onChange) except passwords and search
- Error: red + ⚠ icon + descriptive text (never color-only)

**Special inputs:**
- PIN/OTP: Individual fields, 48×56px each, 8-12px gap, auto-focus to next
- Password: 👁 toggle on right, strength indicator bar
- Search: 🔍 leading, X clear button on right

---

## NAVIGATION

**Bottom nav:** 3-5 items (never more). Height 56-83px. Icon 24px + label 10-12px. Active: filled icon + accent. Min touch target 48×48px per item.

Standard layout: Home (1) | Search (2) | Main action (3) | Activity (4) | Profile (5)

**Top header:** Height 44-56px. ← back top-left with 44×44px target. Max 2 action icons right.

**Tabs:** Below header, sticky. 2px accent indicator. Swipeable content.

**Drawer:** 80% width max 320px. 50-60% overlay. Open: swipe left edge or ☰.

**Gestures:** Swipe right = back (iOS stack). Swipe down = close modal. Swipe left on item = delete. Pull down = refresh. ALL gestures need button alternative.

**Navigation transitions:** Push forward: SLIDE_IN LEFT 350ms GENTLE. Pop back: SLIDE_IN RIGHT 350ms GENTLE. Modal open: SLIDE_IN BOTTOM 350ms GENTLE. Tab switch: DISSOLVE 250ms GENTLE.

---

## CARDS & LISTS

**Card rules:**
- All cards in same list: same border-radius (12-16px), same padding (16-24px), same shadow
- Gap between cards: 12-16px
- Press feedback: scale 0.98 + opacity 0.9
- Max 3-4 lines of text per card. Max 2 actions per card.
- NEVER: different padding/radius on cards of the same type

**List item:** Height 56px (1 line) / 72px (2 lines). Horizontal padding 16px. Leading: avatar 40-48px / icon 24px. Divider: 1px inset (aligned with text, not full-width).

**Empty states:** Centered illustration (120-160px) + descriptive title + subtitle with action suggestion + optional secondary CTA.

**Skeleton loading:** Shape mirrors real content. Color neutral-200 + shimmer. Shimmer left→right, 1.5-2s loop. ALWAYS prefer skeleton over spinner for page loading.

---

## FEEDBACK & STATES

**Fundamental rule:** Every action receives visual response in <100ms. Loading if >400ms. Never silent.

| Action duration | Feedback |
|---|---|
| <300ms | Immediate visual change only |
| 300ms-2s | Inline spinner in button |
| 2-10s | Progress bar + descriptive text |
| >10s | Progress bar + time estimate + "notify when ready" |

**Toasts/Snackbars:** Bottom (above bottom nav), 16px margin. 48-56px height. Auto-dismiss 3-5s. Max 1 action ("Undo"). Max ~60 chars. Types: ✓ success (green) / ✕ error (red) / ⚠ warning (yellow) / ℹ info (neutral).

**Confirmation modals:** Use for destructive/irreversible actions. Title = clear question. Description = consequence. Cancel ghost left, Destructive red right. Overlay 50-60%. NEVER "Yes"/"No" labels.

**Success screens:** Animated check (scale 0→1.2→1.0, 400-600ms). Show essentials (amount, recipient). Post-success CTAs. Invest design here — user remembers endings.

**Error screens:** Illustration + plain language (WHAT happened + WHY + WHAT to do) + recovery CTA.

**Loading patterns:** Spinner for buttons/inline. Skeleton for content pages. Progress bar for uploads/known progress (4-8px height, pill border-radius).

---

## MOTION & TRANSITIONS (M3 System)

**Default:** GENTLE easing at 350ms for ALL transitions unless specified otherwise.

**M3 Easing → Figma:**
- Emphasized → GENTLE (screen transitions, important moves)
- Emphasized Decelerate → EASE_OUT (elements entering)
- Emphasized Accelerate → EASE_IN (elements exiting)
- Standard → EASE_IN_AND_OUT (utility, tabs, toggles)
- Linear → LINEAR (spinners, skeleton shimmer)

**Duration tokens:**
- 50-100ms: Press feedback, hover states
- 150-200ms: Tooltips, toggles, checkboxes
- 250-300ms: Tab switches, small expansions
- 350ms ⭐: Screen transitions (default)
- 400-500ms: Complex transitions, modals
- 500-700ms: Success screens, celebrations
- Exit is always ~50ms faster than enter

**Transition patterns:**
| Pattern | Figma | Use |
|---|---|---|
| Container Transform | SMART_ANIMATE | Card → detail page |
| Shared X-Axis forward | SLIDE_IN LEFT | CTA → next screen |
| Shared X-Axis back | SLIDE_IN RIGHT | Back button |
| Shared Y-Axis | SLIDE_IN BOTTOM | Modal / bottom sheet |
| Fade Through | DISSOLVE | Tab switches |
| Fade | DISSOLVE as OVERLAY | Tooltips, dialogs |

**Motion anti-patterns:** >700ms for routine transitions. Bounce in financial/medical apps. Inconsistent directions. Loading animation blocking interaction. Animation without communicative purpose.

---

## MICRO-INTERACTIONS (Dan Saffer Framework)

Every micro-interaction has: Trigger → Rules → Feedback → Loops

**Key catalog:**
- Toggle: Knob slides 150-200ms, track changes color, haptic light
- Like: Scale 1.0→1.3→1.0, outline→filled, 300-400ms
- Button press: Scale 1.0→0.97, opacity 0.9 on touch-down. SIZE NEVER CHANGES
- Input focus: Border neutral→2px accent 150ms, label animates up, keyboard rises
- Skeleton→content: Fade out skeleton 150ms, staggered fade-in content 200ms +30-50ms each

**"Delightful but dismissible" principle:** If the user does this 50x/day and the animation would irritate → remove it. Animation should be pleasant the 1st time, invisible the 100th.

**When NOT to use:** On everything (fatigue). On very frequent scroll. In final checkout steps. Bounces in financial/medical apps.

---

## ACCESSIBILITY (WCAG 2.2)

**POUR principles:** Perceivable / Operable / Understandable / Robust

**Contrast:**
- Normal text (<18px): 4.5:1 (AA) → 7:1 (AAA)
- Large text: 3:1 (AA)
- UI components, icons: 3:1

**Color is NEVER the only indicator:** Error = red + ⚠ icon + text. Status = color + symbol + label. Charts = colors + patterns + labels.

**Touch targets:** WCAG 2.2 AA minimum 24×24px. Recommended 44×44px. Ideal 48×48dp.

**Focus:** Visible 2px accent ring with 2px offset. Focus trap in modals. Tab order follows visual order top→bottom, left→right.

**Text:** Min body 16px (prevents iOS zoom), min caption 12px. NEVER weight 100/200/300 at <18px.

**Color blindness (8% of men):** Red+green must have additional differentiator. Test with Color Blind Figma plugin.

**Motion:** Respect `prefers-reduced-motion`. Replace slides/scales with fades or cuts. Keep essential feedback. NEVER flash >3x/second.

**Forms:** Every input has associated visible label. Required fields: asterisk + aria-required. Errors announced by screen reader (aria-live). Correct autocomplete attributes.

---

## NIELSEN'S 10 HEURISTICS

1. **Visibility of system status** — Loading indicators, progress, active states. Never silent.
2. **Match with real world** — User language, not system jargon. Familiar metaphors. Human error messages.
3. **User control & freedom** — Back/close on every screen. Undo for destructive actions. Cancel mid-flow.
4. **Consistency & standards** — Same action = same visual everywhere. One CTA color. Consistent terminology.
5. **Error prevention** — Masks for formatted fields. Confirmation before destructive. Smart defaults. Inline validation.
6. **Recognition over recall** — Visible labels. Icons with text labels. Recent history. Help without leaving screen.
7. **Flexibility & efficiency** — Shortcuts for frequent actions. Gestures. Quick actions. Repeat last action.
8. **Aesthetic & minimalist design** — Every element has purpose. Max 3-4 info blocks/screen. Breathing room.
9. **Help recover from errors** — Formula: WHAT happened + WHY + WHAT to do. Recovery action button. Near the field.
10. **Help & documentation** — Tooltips for complex fields. Contextual help. Onboarding for new features.

**Severity scale:** 0=not an issue / 1=cosmetic / 2=minor / 3=major (fix before launch) / 4=catastrophic (fix immediately)

---

## ANTI-PATTERNS — NEVER DO THESE

| # | Anti-Pattern | Fix |
|---|---|---|
| AP-01 | Oval/cylindrical button (using HUG on circular) | FIXED width = FIXED height, cornerRadius = size/2 |
| AP-02 | Color soup (different color per button) | 1 accent for ALL primary. Hierarchy by style only |
| AP-03 | Inconsistent card padding | Choose 1 padding value for all cards of same type |
| AP-04 | Mixed border-radius (8px, 16px, 4px, 12px) | Max 2 values + pill. Choose and stick to it |
| AP-05 | Illegible text (#CCC on white, 10px body, Light weight) | Min 16px body, 4.5:1 contrast, weight 400+ |
| AP-06 | Two filled primary CTAs | Only 1 filled. Others outlined or ghost |
| AP-07 | Primary CTA at top of screen on mobile | CTA always in bottom half (thumb zone) |
| AP-08 | Generic button labels ("OK", "Yes", "Submit") | Verb + noun: "Send Payment", "Delete Account" |
| AP-09 | No loading feedback (screen freezes) | Visual feedback <100ms. Loading if >400ms |
| AP-10 | Modal without exit (no X, no overlay tap) | X + Cancel button + overlay tap + swipe down |
| AP-11 | Elements floating loose on Figma canvas | Everything inside Section → Frame hierarchy |
| AP-12 | FILL before appendChild in auto-layout | Append child first, THEN set FILL |
| AP-13 | Same color for background + card + button | Distinct elevation layers in dark mode |
| AP-14 | Bottom nav icons without labels | Icon + label always |
| AP-15 | Excessive animation (everything bounces) | 300ms transitions, micro-interactions only where needed |
| AP-16 | No typographic hierarchy (all 16px Regular) | Min 3 different sizes with clear weight contrast |
| AP-17 | Card with too much information | Max 3-4 lines text, key info only, "View →" for rest |

---

## SELF-REVIEW CHECKLIST

### Visual:
- [ ] Only 1 primary CTA (filled)?
- [ ] Circular buttons ACTUALLY circular (width=height, cornerRadius=size/2)?
- [ ] Only 1 accent color on screen?
- [ ] Consistent border-radius on all elements of same type?
- [ ] Uniform padding on cards/containers?
- [ ] Clear typographic hierarchy (≥3 different sizes/weights)?
- [ ] Text contrast ≥4.5:1?

### Functional:
- [ ] CTA in thumb zone (bottom half)?
- [ ] Button labels descriptive (verb + noun)?
- [ ] All components have press feedback?
- [ ] Loading states for actions >400ms?
- [ ] Modals have ≥2 ways to close?
- [ ] Back button on all sub-screens?
- [ ] No action uses color as only indicator?

### Figma Technical:
- [ ] Everything in auto-layout?
- [ ] No elements floating on canvas?
- [ ] FILL applied AFTER appendChild?
- [ ] Fonts loaded before use (loadFontAsync)?
- [ ] Colors in normalized RGB (0-1), not hex?
- [ ] Reactions use `actions` (plural) and `setReactionsAsync`?
- [ ] Durations in reactions in SECONDS (0.35), not ms?
- [ ] `getNodeByIdAsync` not `getNodeById`?
- [ ] `overflowDirection` uses 'HORIZONTAL' not 'HORIZONTAL_SCROLLING'?
- [ ] Layers named with prefix convention (Screen/, Section/, Card/, etc.)?

---

## FIGMA EXECUTION QUICK REFERENCE

```javascript
// Circular button — correct
const SIZE = 56;
btn.resize(SIZE, SIZE);
btn.cornerRadius = SIZE / 2;
btn.primaryAxisSizingMode = 'FIXED';
btn.counterAxisSizingMode = 'FIXED';

// Auto-layout FILL — correct order
parent.layoutMode = 'VERTICAL';
parent.appendChild(child);              // 1. Append FIRST
child.layoutSizingHorizontal = 'FILL'; // 2. THEN set FILL

// Colors — normalized RGB
frame.fills = [{ type: 'SOLID', color: { r: 0.153, g: 0.431, b: 0.945 } }];

// Fonts — load before use
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });

// Reactions — correct format
await node.setReactionsAsync([{
  trigger: { type: 'ON_CLICK' },
  actions: [{                          // plural: actions
    type: 'NODE',
    destinationId: targetNode.id,
    navigation: 'NAVIGATE',
    transition: { type: 'SLIDE_IN', direction: 'LEFT', duration: 0.35, easing: { type: 'GENTLE' } }
  }]
}]);

// Overflow scroll
frame.overflowDirection = 'HORIZONTAL'; // NOT 'HORIZONTAL_SCROLLING'

// Flow starting point
figma.currentPage.flowStartingPoints = [{ nodeId: startFrame.id, name: 'Flow' }];
```
