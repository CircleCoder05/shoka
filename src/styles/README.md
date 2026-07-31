# Style architecture

The style layer is split by responsibility so a theme can change without editing Vue components.

- `foundation/`: design tokens, theme palettes, mixins, breakpoints, and shared motion.
- `pages/`: route-level shells that are not owned by a single Vue component.
- `sfc/`: one external Sass module per Vue component, mirroring the source tree.
- `main.scss`: the single global entry point; keep broad selectors and resets here.

## Adding a theme

1. Add a theme selector such as `html[data-theme='sepia']` to
   `foundation/_themes.scss` and override semantic `--theme-*` variables.
2. Add the theme name to `AVAILABLE_THEMES` in `src/stores/theme.js`.
3. Keep component selectors theme-neutral. A component should consume semantic
   variables such as `--theme-surface` and `--theme-text`, not add a new
   `html.<theme>` override.

Component-specific colors that are part of content meaning may remain local.
Reusable appearance, spacing, breakpoints, loading indicators, and card shells
belong in `foundation/`.
