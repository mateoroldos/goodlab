---
description: Goodlab project router.
disable-model-invocation: true
---

# Goodlab

Use this router when working on GoodLab research, series, episodes, or visuals.

## Route

- Use `goodlab-research` to turn an idea into a source-backed brief in `docs/research`.
- Use `goodlab-series` to turn a brief or idea into a series arc.
- Use `goodlab-episode` to create or revise episode content.
- Use `goodlab-visual` to create or revise learning visuals, visual primitives, or episode scenes.

## Flow

Default to this path unless the user asks for a specific step:

```txt
idea -> research brief -> series plan -> episode -> visual -> implementation
```

Completion criterion: the selected skill matches the user's current work and no unrelated skill is loaded.
