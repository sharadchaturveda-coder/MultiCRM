# Spec-Driven Development Foundation

## 🎯 Core Philosophy

**Spec-Driven Development (SDD)** is a structured, intent-centric process that replaces reactive code generation with progressive specification.
It transforms AI-assisted development from prompt-and-output into a multi-phase reasoning discipline.

**Central doctrine:** "Specifications define truth. Code merely fulfills it."

SDD formalizes how AI agents should think — prioritizing intent, structure, and traceability over instant implementation. Every action must refer to documented intent before generating code.

## Fundamental Principles

### Intent-Driven Development
Every system begins with an explicit declaration of **what it must achieve** before defining how.

- Specifications are canonical
- Implementation is derivative
- Intent drives execution

### Rich Specification Creation
Specifications are not notes; they are structured documents with guardrails and internal logic. They represent a mental architecture that guides downstream actions.

### Multi-Step Refinement
Work evolves through structured, verifiable phases: requirements → design → task planning → execution.

- No single "generate" moment
- Progressive refinement replaces improvisation
- Each stage reviewed, revised, and validated

### AI-Integrated Interpretation
The workflow assumes advanced AI comprehension — capable of reading, reasoning about, and cross-referencing specifications.

## Development Phases
| Phase | Focus | Key Activities |
|-------|-------|----------------|
| **0-to-1 Development** | Generate from scratch | Generate specs, plan implementation, build production applications |
| **Creative Exploration** | Parallel implementations | Explore multiple solutions, experiment with architectures |
| **Iterative Enhancement** | Modernization | Add features iteratively, refactor legacy systems |

## Purpose
This document defines how AI agents should begin work on this repository. It establishes the order of operations, required artifacts, and rules for creating and evolving specifications.

---

## Workflow Entry Point

When starting a new feature or product initiative, always begin with the **/specify** command.

1. **/specify**  
   - Input: high-level description (user prompt).  
   - Output: `spec.md` in a new feature folder.  
   - Contents: user stories, entities, acceptance criteria, [NEEDS CLARIFICATION] markers.  
   - Rule: no implementation details at this stage. Only WHAT and WHY.

2. **/plan**  
   - Input: `spec.md`.  
   - Output: `plan.md` plus supporting docs.  
   - Contents: technical architecture, rationale, data models (`data-model.md`), API/event contracts (`contracts/`), quickstart scenarios (`quickstart.md`).  
   - Rule: enforce constitutional gates (simplicity, anti-abstraction, test-first).  
   - Do not write code. Only system-level design and contracts.

3. **/tasks**  
   - Input: `plan.md`, `data-model.md`, `contracts/`.  
   - Output: `tasks.md`.  
   - Contents: executable task breakdown, parallelizable groups marked [P].  
   - Rule: generate tasks before code. Tests must be defined first.

---

## Required Documents for Each Feature

- `spec.md` – PRD specification (WHAT/WHY).  
- `plan.md` – Implementation plan (HOW at system level).  
- `data-model.md` – Entities, schemas, and relationships.  
- `contracts/` – API and event definitions, with test scenarios.  
- `tasks.md` – Executable task list derived from the plan.  
- `research.md` – Context from research agents (tech options, compliance, integration notes).  
- `quickstart.md` – Minimal validation guide to test builds quickly.  

---

## Clarification Protocol

- Use `[NEEDS CLARIFICATION: question]` for any ambiguity.  
- Never invent details if not in the prompt or spec.  
- These markers must be resolved before `plan.md` is finalized.  

---

## Acceptance Criteria for Specs

- All requirements testable and measurable.  
- No [NEEDS CLARIFICATION] markers remain before implementation.  
- Traceability: each feature in `plan.md` must link to a requirement in `spec.md`.  

---

## Constitutional Principles

- **Library-First**: every feature is a reusable component/library first.  
- **CLI Interfaces**: each library must expose CLI or API contracts.  
- **Test-First**: no code before tests exist and fail (Red → Green → Refactor).  
- **Simplicity**: ≤3 projects per initial feature unless justified.  
- **Anti-Abstraction**: use framework features directly; avoid over-engineering.  
- **Integration-First Testing**: prefer real environments over mocks.  

---

## First Feature: Universal CRM Core

The initial feature initiative is the **Universal CRM Core**.  
- Location: `specs/001-universal-crm-core/`  
- Seed document: `spec.md` (already drafted separately).  
- This will form the foundation for hotel, school, and F&B vertical extensions.

---

## Evolution

- Updating a feature = editing `spec.md` → regenerating `plan.md` and `tasks.md`.  
- New features = new folders under `specs/###-feature-name/`.  
- All changes must maintain traceability and constitutional compliance.

---

## Instructions for AI Agents

- Read **this document** before attempting to generate anything.  
- Always start from `spec.md`.  
- If `spec.md` doesn’t exist, create it first.  
- Never skip steps. Specification → Plan → Tasks → Code.
