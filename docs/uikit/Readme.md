# Game UI Playbook (Mid-core / Casual / Hypercasual)

Version: **v0.2.0**  
Format: **index.html + playbook.css + playbook.js** (no build step)

## What’s inside
- A categorized UI component catalog (88 items):
  - Navigation & screen flow
  - Popups / overlays / dialogs
  - Feedback & notifications
  - Lists & virtualized scrolling
  - Core controls
  - Economy / meta progression
  - Social / competitive
  - Monetization
  - Gameplay HUD patterns
  - Visual effects & utility

## Media policy
- All media in `assets/` is **generated** (PNG + GIF) to keep this playbook:
  - easy to maintain,
  - safe for internal sharing,
  - free from third-party licensing constraints.

## How to extend
1. Add a new card in `index.html` (copy an existing `.ui-card`).
2. Generate or add:
   - `assets/img/<slug>.png`
   - `assets/gif/<slug>.gif`
3. Add keywords to `data-text` so Search can find it.

## Changelog
- **v0.2.0**
  - Reworked to match the uploaded playbook format (separate CSS/JS).
  - Added per-component media (PNG + GIF) for every catalog item.
  - Search filters both the navigation and the cards.
