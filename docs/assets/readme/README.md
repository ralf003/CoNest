# README icon assets

Icon paths are vendored from [Lucide](https://github.com/lucide-icons/lucide/tree/951813ce76a859d4d8b145366972cbb237147a4e/icons), pinned to commit `951813ce76a859d4d8b145366972cbb237147a4e`. Copyright and licensing terms (ISC, plus MIT for inherited Feather icons) are preserved in [LICENSE-lucide](LICENSE-lucide).

The upstream paths retain their 24 × 24 coordinate grid. CoNest adds a 48 × 48 colored tile, 12 px inset, 1.75 px stroke, round caps and round joins. The two branch badges use the same upstream `git-branch` geometry at a 2 px stroke before scaling.

| Asset | Upstream icon |
| --- | --- |
| `connections.svg` | `waypoints` |
| `loops.svg` | `workflow` |
| `components.svg` | `blocks` |
| `memory.svg` | `database` |
| `studio.svg` | `panels-top-left` |
| `start.svg` | `terminal` |
| `branches.svg` | `git-branch` |
| `docs.svg` | `book-open` |
| `contribute.svg` | `code-xml` |
| `package.svg` | `package` |
| `lock.svg` | `lock-keyhole` |
| `archive.svg` | `archive` |

Keep heading text native: no inline image before H2 text. Feature icons sit in their own centered paragraph above titles. Documentation icons sit in dedicated table cells with `valign="middle"`; the image also uses `align="absmiddle"` to avoid a text-baseline offset. Test GitHub-sanitized HTML in light/dark themes and at mobile widths after changing markup.
