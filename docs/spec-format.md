# Spec Format

Specs use Markdown with YAML front matter.

## Front matter fields
- `spec_id` (string, required): unique identifier for the spec
- `title` (string, optional): human-friendly name
- `features` (array): list of feature objects
  - `id` (string): feature identifier
  - `accept` (array|string): acceptance criteria snippets

## Example
```markdown
---
spec_id: ingest.sensor
title: Sensor ingestion pipeline
features:
  - id: ingest.validate-schema
    accept:
      - Reject packets missing fields
      - Emit structured error telemetry
---

## Summary
Describe the goal and constraints.
```

## Best practices
- Keep `spec_id` globally unique and stable.
- Write concise acceptance criteria.
- Use sections in the Markdown body for context, risks, and open questions.
