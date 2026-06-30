---
description: Research Goodlab lesson topics into source-backed briefs. Use when creating docs/research, investigating a software concept, or needing source-code references before a series or episode.
---

# Goodlab Research

Research turns an idea into a brief that can become a series or episode.

## Steps

1. Frame the question.
   - Name the mental model the viewer should leave with.
   - Completion criterion: the brief has one guiding question, not a topic bucket.

2. Gather sources.
   - Prefer official docs, open-source repo files, issues, PRs, talks, and canonical articles.
   - If the project is open source, include source-code references with paths or URLs.
   - Completion criterion: every important claim traces to a source or is marked as interpretation.

3. Extract the model.
   - Separate durable concepts from version-specific API details.
   - Capture felt problems, contrasts, traps, examples, and invisible mechanisms.
   - Completion criterion: the brief explains what clicks, what it is not, and why people get confused.

4. Draft candidates.
   - Propose series arcs, episode ideas, and visual candidates.
   - Keep each episode candidate to one conceptual move.
   - Completion criterion: every candidate can be used or rejected independently.

5. Save the brief.
   - Put research briefs in `docs/research/<topic>.md` unless the user chooses another path.
   - Completion criterion: the file is source-backed and ready to feed `goodlab-series` or `goodlab-episode`.

## Template

```md
# <Topic> Research Brief

## Question

What mental model should a viewer leave with?

## Sources

- Official docs: <url>
- Source code: <repo path or url>
- Issues/PRs: <url>
- Articles/talks: <url>

## Source Notes

Concrete findings from the sources.

## Mental Model

The durable explanation.

## Felt Problems

- <confusion this topic solves>

## Contrasts

- <this concept> vs <nearby concept>

## Traps

- <common misunderstanding>

## Visual Candidates

- <invisible mechanism worth visualizing>

## Series Candidates

- <possible arc>

## Episode Candidates

- `<number>`: <one idea>

## Open Questions

- <thing to verify>
```
