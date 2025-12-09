---
spec_id: ingest.sensor
title: Sensor ingestion pipeline
features:
  - id: ingest.validate-schema
    accept:
      - "Reject packets missing fields"
      - "Emit structured error telemetry"
---

## Summary
This spec describes how sensor payloads are validated and transformed before ingestion.

## Acceptance notes
- Schema validation must reject malformed messages
- Telemetry emitted for rejected packets
