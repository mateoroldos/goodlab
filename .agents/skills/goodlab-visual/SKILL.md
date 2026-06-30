---
description: Visual model design for Goodlab. Use when creating or revising learning visuals, src/lib/visuals primitives, episode-specific visual components, animation states, or episode visual explanations.
---

# Goodlab Visual

A visual earns its place by making an invisible mechanism easier to think with.

## Steps

1. Name the invisible thing.
   - Examples: inference flow, dependency tracking, scheduler work, module resolution, state changes.
   - Completion criterion: the visual explains something text or code alone does not already show.

2. Choose the bucket.
   - Use `src/lib/visuals/<name>` for reusable primitives such as code blocks, file trees, graphs, timelines, stacks, or state machines.
   - Use `src/lib/content/series/<series>/visuals` for custom episode or series scenes.
   - Promote an episode visual to `src/lib/visuals` only when reuse is likely and the API can stay small.
   - Completion criterion: the component lives at the narrowest reusable scope.

3. Compose before inventing.
   - Existing primitives can combine into richer scenes, such as code block plus file tree plus custom arrows.
   - Completion criterion: new components do not duplicate an existing primitive's job.

4. Design the states.
   - Prefer two or three meaningful states.
   - Prefer continuity when it helps the model; swap scenes when continuity would add noise.
   - Completion criterion: each state maps to a specific episode step or phase.

5. Check reversibility.
   - If the viewer can move backward, the visual should degrade or reverse without confusion.
   - Completion criterion: previous states remain understandable after forward and backward navigation.

6. Subtract.
   - Remove labels, elements, transitions, or states that do not improve understanding.
   - Completion criterion: the visual needs no legend to explain the main idea.

## Component Buckets

- `src/lib/components`: shared site UI.
- `src/lib/visuals`: reusable learning primitives.
- `src/lib/content/series/<series>/visuals`: episode-specific scenes.
