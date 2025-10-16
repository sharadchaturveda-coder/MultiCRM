# Universal LLM-Friendly Project Setup - Implementation Plan

## Core Files Added (Already Completed)
- [x] /context.json - Project manifest with entry points, meta, toolchain, directories
- [x] /docs/code-map.md - Static tree map with descriptions
- [x] /docs/dependency-map.md - Module relationships with import chains
- [x] /scripts/context-trace.js - Live dependency graph generator
- [x] /scripts/debug-all.sh - Sequential debug workflow pipeline
- [x] Context anchors in source files (@context, @depends, @exports)

## Metadata & Content Management
- [ ] Add YAML headers to all major Markdown files (meta/, specs/, docs/)
- [ ] Generate _summary.md companions for long documents (>500 tokens)
- [ ] /scripts/generate-summaries.js - Auto-generation script for summaries

## Context Management Tools
- [ ] /scripts/context-router.js - Incremental content loading librarian
- [ ] /scripts/context-health.js - Metadata validation and health scoring

## Advanced Context Features
- [ ] /context_cache/current_state.md - Working memory persistence
- [ ] /docs/context-index.json - Topic-based file mapping
- [ ] /docs/llm_protocol.md - Agent interaction protocol and prompts

## Documentation Updates
- [ ] Update /docs/_index.md with new scripts, usage, and navigation
- [ ] /.headers/ directory for header templates (optional
