---
description: Series plan Goodlab content. Use when turning research into a multi-episode arc, creating docs/series plans, splitting a topic, or checking whether episodes belong together.
---

# Goodlab Series

A series is an arc of conceptual moves, not a folder of related topics.

## Steps

1. Find the arc.
   - Start from a research brief when one exists.
   - Name the before/after shift for the viewer.
   - Completion criterion: the series has one clear learning journey.

2. Split into episodes.
   - Each episode teaches one idea, not one topic.
   - If an episode has two takeaways, split it.
   - Completion criterion: every episode has one conceptual move.

3. Sequence the pull.
   - Each episode should resolve its own tension and open the next door.
   - Completion criterion: removing or reordering an episode has an obvious effect on the arc.

4. Cut duplicates.
   - Merge or remove episodes that teach the same move with different labels.
   - Completion criterion: no episode exists only because the topic feels important.

5. Ask before wiring.
   - Before editing `src/lib/content/catalog.ts` or `series.ts`, ask whether the user wants a plan only or implementation too.
   - Completion criterion: file changes match the user's chosen scope.

## Series Plan Template

Save plans in `docs/series/<series-slug>.md` unless the user chooses another path.

```md
# <Series Title>

## Arc

Before: <current confusion>

After: <new model>

## Audience

<who this is for>

## Episodes

1. `<slug>` - <one conceptual move>

## Cut List

- <ideas rejected or merged, with why>

## Source Briefs

- `docs/research/<topic>.md`
```
