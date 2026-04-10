# Design System Strategy: The Luminescent Academy

## 1. Overview & Creative North Star
The "Creative North Star" for this design system is **"The Digital Curator."** 

Moving away from the rigid, spreadsheet-like density of traditional educational platforms, this system treats information as a curated exhibition. We prioritize white space, soft geometry, and tactile depth. By blending the precision of a modern dashboard with the approachability of a high-end lifestyle app, we create an environment that feels less like "work" and more like "progress."

To break the "template" look, we utilize **Intentional Asymmetry**. Dashboards should not be perfectly mirrored grids; instead, use varied card widths and "floating" 3D elements that break out of container bounds to create a sense of life and motion.

---

## 2. Colors
Our palette is a sophisticated interplay of soft pastels and deep, authoritative ink tones.

*   **Primary (`#575a93`) & Secondary (`#31638a`):** These represent focus and stability. Use them for active states and primary calls to action.
*   **Tertiary (`#7d5817`):** Used sparingly to draw the eye to critical "warm" highlights like progress milestones or specialized job alerts.
*   **Neutral Surfaces:** Use `surface` (`#f8f9fa`) as the canvas, with `surface-container-lowest` (`#ffffff`) for elevated interactive cards.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. All separation must be achieved through background shifts. For example, a `surface-container-low` card sitting on a `surface` background creates a clear boundary through tonal contrast alone. 

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, fine-paper layers.
1.  **Level 0 (Base):** `surface`
2.  **Level 1 (Sections):** `surface-container-low`
3.  **Level 2 (Active Cards):** `surface-container-lowest` (White)

### The "Glass & Gradient" Rule
For floating menus or high-impact 3D illustrations, apply a "Glassmorphism" effect. Use a semi-transparent `surface-container-lowest` with a `backdrop-blur` of 20px. 

### Signature Textures
Main CTAs (like "Upgrade to Pro") should use a subtle linear gradient from `primary` to `primary-container`. This adds a "soul" to the component that flat colors cannot replicate.

---

## 3. Typography
We use **Plus Jakarta Sans** as our sole typeface. Its modern, geometric skeleton provides the clarity needed for an educational platform while maintaining a friendly, premium character.

*   **Display Scale:** Use `display-md` for high-impact motivational headers. These should be set with tight letter-spacing (-0.02em) to feel editorial.
*   **Headline & Title:** These are your "Anchors." Use `headline-sm` for card titles to ensure immediate scannability.
*   **Body & Label:** Use `body-md` for general content. `label-sm` is reserved for metadata—it should be set in Uppercase with +0.05em tracking to differentiate it from body text.

---

## 4. Elevation & Depth
In this system, depth is "felt" through color, not "seen" through lines.

*   **The Layering Principle:** Depth is achieved by stacking surface tokens. A `surface-container-highest` navigation bar provides a natural "shelf" for the main content area.
*   **Ambient Shadows:** When an element must float (e.g., a hovered course card), use an extra-diffused shadow. 
    *   *Spec:* `0px 20px 40px rgba(45, 51, 53, 0.06)` (using a tinted version of `on-surface`).
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use `outline-variant` at 15% opacity. Never use a 100% opaque border.
*   **Glassmorphism:** Use semi-transparent white overlays on top of pastel illustrations to create a sense of "frosted glass" depth, allowing the vibrant colors of the 3D assets to bleed through the UI.

---

## 5. Components

### Buttons
*   **Primary:** Rounded `full`. Background: `primary`. Text: `on-primary`. No shadow at rest; slight `surface-tint` glow on hover.
*   **Secondary:** Rounded `full`. Background: `secondary-container`. Text: `on-secondary-container`.
*   **Tertiary:** Transparent background. Text: `primary`. Rounded `sm`. Use for low-emphasis actions like "View All."

### Cards (Dashboard)
*   **Style:** Corner radius `md` (1.5rem) or `lg` (2rem). 
*   **Separation:** No dividers. Content is separated using the Spacing Scale (e.g., `spacing-4` between header and content).
*   **Job Feed Card:** Use `surface-container-highest` for the background to denote it as a feed item distinct from the background.

### Input Fields
*   **Search Bar:** Rounded `full`. Background: `surface-container`. No border. Placeholder text: `on-surface-variant`.
*   **Selection Chips:** Rounded `full`. Use `tertiary-container` for active selection to provide a "vibrant" pop of color against the cool background.

### 3D-Style Illustrations
*   **Placement:** These should overlap container edges (using negative margins) to break the "boxed-in" feel. 
*   **Interaction:** Use subtle hover animations (e.g., translateY -5px) to emphasize their tactile nature.

---

## 6. Do's and Don'ts

### Do:
*   **DO** use whitespace as a functional tool. If a card feels crowded, increase the padding using `spacing-6`.
*   **DO** use the `rounded-lg` (2rem) scale for large content blocks to maintain the "Soft Minimalism" aesthetic.
*   **DO** ensure that 3D icons have consistent lighting sources (top-left) to feel like they belong in the same physical space.

### Don't:
*   **DON'T** use black (#000000) for text. Always use `on-surface` (`#2d3335`) to keep the interface soft.
*   **DON'T** use 1px lines to separate list items. Use vertical spacing or a subtle `surface-container-low` background on every other item.
*   **DON'T** crowd the sidebar. Every icon should have a minimum of `spacing-3` clear space around it.
*   **DON'T** use high-saturation "neon" colors. Stick to the tonal pastel values provided in the palette tokens to ensure a "High-End Editorial" feel.