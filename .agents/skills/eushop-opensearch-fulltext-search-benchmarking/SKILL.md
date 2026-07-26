---
name: eushop-opensearch-fulltext-search-benchmarking
description: Full-Text Search Benchmarking & OpenSearch Query Engine Skill for EUshop
---

# OpenSearch Full-Text Search & Benchmarking Engine

This skill optimizes food search queries, trigram indexes, and full-text relevance ranking.

## Standards
1. **Trigram Indexing**: Use PostgreSQL `pg_trgm` or OpenSearch trigram tokenizers for fuzzy food title matching.
2. **Allergen Filters**: Always exclude foods matching user allergen blacklist.
