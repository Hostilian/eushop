---
name: obsidian-knowledge-memory
description: Obsidian knowledge graph memory & CLI connector (pablo-mano/Obsidian-CLI-skill). Persistent vault integration, knowledge items, and context linking across AI agent sessions.
---

# Obsidian Knowledge Memory Engine

This skill implements the **pablo-mano/Obsidian-CLI-skill** memory pattern for persistent knowledge graphs across AI sessions.

## Knowledge Graph Memory Architecture
1. **Persistent Memory Vault**:
   - Location: `.agents/knowledge/` and `CHANGELOG.md`.
   - Markdown documents with structured frontmatter metadata.
2. **Knowledge Items (KI)**:
   - Summaries of architectural decisions, regulatory rules, API contracts, and debugging solutions.
3. **Cross-Session Retrieval**:
   - At session start, check KI indexes before doing redundant research.
   - Reference KIs when designing features or diagnosing errors.
