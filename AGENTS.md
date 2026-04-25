# AGENTS.md

## Project overview
This is a React frontend portfolio project with an interactive family tree and photo album.

## Working rules
- Prefer minimal diffs over broad rewrites.
- Preserve existing UX unless the task explicitly asks for UI changes.
- Do not add new production dependencies without approval.
- Do not rewrite store, selectors, or components unless necessary.
- If a task is complex, inspect the codebase and propose a plan before editing.

## Data model rules
- The current app model is the canonical internal representation.
- Import/export formats should be adapted to the app model, not the other way around.
- GEDCOM is an interchange format only.
- Do not redesign the project around GEDCOM.

## GEDCOM rules
- Support only the subset that maps to the existing app model.
- Ignore notes, sources, extra media attachments, and custom tags.
- Import/export one primary photo only.
- Do not serialize UI-only or app-only state into GEDCOM.

## Verification
- Run build after code changes.
- Run lint/tests if configured.
- If something cannot be verified automatically, say so clearly.

## Response format
After changes, report:
1. files changed
2. what changed
3. verification results
4. risks
5. manual checks remaining