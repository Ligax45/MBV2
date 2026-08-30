---

name: code-review
description: "Review MBV2 changes since a fixed point (commit, branch, tag, or merge-base) across three independent axes: Standards (MBV2 conventions + Fowler smells), Spec (issue/spec alignment), and Correctness (bugs, security, NestJS/Angular checklists). Runs all available reviews in parallel sub-agents. Use when reviewing a branch, PR, or WIP changes on the MiamBookV2 mono-repo."
---

---

# Code Review

Review the diff between `HEAD` and a fixed point supplied by the user across three independent axes:

- **Standards**: does the code conform to this repo's documented coding standards and architectural conventions?
- **Spec**: does the code faithfully implement the originating issue / specification, without missing requirements or unnecessary scope?
- **Correctness**: does the implementation actually behave correctly, including edge cases, failure paths, regressions, security boundaries, and concurrency?

All three axes run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their findings.

Respond in **French** when presenting findings to the user, unless they explicitly ask for English.

---

## MBV2 mono-repo

This skill is configured for the **MiamBookV2** mono-repo. Two independent packages:

| Package | Path | Role |
|---------|------|------|
| Backend | `backend/` | NestJS API REST, MikroORM, PostgreSQL/Supabase |
| Frontend | `frontend-angular/` | Angular 21, PrimeNG, proxy `/api` → `:3333` |

### Detecting which package(s) the diff touches

Inspect changed file paths in the diff:

- `backend/**` → run backend validation
- `frontend-angular/**` → run frontend validation
- Both → run validation in **both** packages

### Validation commands (MBV2)

Run from the **package root**, not the mono-repo root.

**Backend** (`cd backend`):

| Check | Command |
|-------|---------|
| Lint | `npm run lint` |
| Tests | `npm run test` |
| Build (includes typecheck) | `npm run build` |

**Frontend** (`cd frontend-angular`):

| Check | Command |
|-------|---------|
| Lint | `UNAVAILABLE` — no ESLint script configured |
| Tests | `npm run test` |
| Build (includes typecheck) | `npm run build` |

Run only the checks relevant to the changed package(s). Do not skip a package whose files appear in the diff.

### MBV2 conventions document

The primary standards source for this project is:

`docs/conventions.md`

Read it in step 3 and pass its contents to the Standards sub-agent. It documents NestJS layered modules, Angular patterns, API/auth/ORM rules, and file naming — based on what the repo actually does.

---

## Core Review Principles

These principles apply to every axis.

### Evidence over speculation

A finding must be evidence-based and actionable.

Use this evidence hierarchy:

1. Executed tool output
2. Repository source code
3. Tests
4. Explicit project documentation
5. Explicit issue/spec
6. Reasonable inference

Never present an inference as a fact.

Do not report:

- subjective style preferences
- hypothetical problems without a plausible failure mode
- refactoring ideas that do not materially improve the change
- issues already enforced by tooling
- pre-existing issues unrelated to the diff
- duplicate findings describing the same underlying problem

Prefer **fewer high-confidence findings over many speculative findings**.

Never claim that:

- a test fails unless it was actually run
- a function is called unless the repository confirms it
- an API supports something unless its contract was inspected
- a behaviour is required unless it is stated or evidenced
- a regression exists without identifying how the change causes it

If evidence is insufficient, say so.

### Review the change, not the entire repository

Review the changed code first.

Unchanged code may be inspected when necessary to establish:

- a bug caused by the change
- an invariant violated by the change
- an API or type contract
- a regression
- a caller/callee relationship
- relevant architectural context
- relevant test coverage

Do not report pre-existing issues unless the change makes them newly relevant or demonstrably worse.

For significant changed functions/modules, inspect relevant:

- callers
- interfaces and types
- tests
- configuration
- adjacent implementation
- database/API contracts

### Findings

Every finding should contain:

- severity: `BLOCKER`, `HIGH`, `MEDIUM`, or `LOW`
- confidence: `HIGH`, `MEDIUM`, or `LOW`
- exact file and line/hunk where possible
- the smallest relevant code fragment, preferably no more than 2 lines
- a concrete explanation of the problem
- the failure mode or consequence
- a practical recommendation when appropriate

A `HIGH` or `BLOCKER` finding should normally require `HIGH` confidence and a concrete failure mode.

Do not inflate severity because a problem is theoretically possible.

---

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point (a commit SHA, branch name, tag, `main`, `HEAD~5`, etc.). If they didn't specify one, ask for it.

Capture the diff command once:

```text
git diff <fixed-point>...HEAD
```

Use three-dot syntax so the comparison is against the merge-base.

Also note the list of commits:

```text
git log <fixed-point>..HEAD --oneline
```

Before going further:

1. Confirm the fixed point resolves:

   ```text
   git rev-parse <fixed-point>
   ```

2. Confirm the diff is non-empty.
3. Capture the diff once and reuse it for all review axes.

A bad ref or empty diff should fail here, not inside the parallel sub-agents.

---

### 2. Identify the spec source

Look for the originating spec, in this order:

1. **User-provided context** — description in the chat, pasted requirements, or a file path the user passed as an argument.
2. **Issue references in commit messages** (`#123`, `Closes #45`) — fetch via `gh issue view <number>` if GitHub CLI is available and the repo has a remote.
3. A spec file under `docs/specs/`, `docs/`, or `.scratch/` matching the branch name or feature.
4. **Ask the user in French** where the spec is: _« Quelle est la spec ou le besoin attendu pour cette review ? »_
5. If they say there isn't one, the **Spec** sub-agent will skip and report `no spec available`.

Do **not** block the review waiting for an issue tracker setup. Proceed with Standards and Correctness even when no spec is found.

Treat the spec as explicit requirements, not as permission to invent requirements.

If the spec conflicts with an explicit, current repository invariant or contract, flag the conflict rather than blindly implementing the spec.

Never infer missing requirements as if they were explicitly specified.

---

### 3. Identify the standards sources

Look for anything in the repo that documents how code should be written, in this order:

1. **`docs/conventions.md`** — primary MBV2 conventions (always read this).
2. `backend/README.md` — architecture backend, migrations, variables d'environnement.
3. `README.md` — stack, structure mono-repo.
4. `frontend-angular/README.md` — conventions frontend si présentes.
5. `.cursor/rules/` — règles agent (ex. `prepare-commit.mdc`).
6. Lint/type configuration (`backend/eslint.config.mjs`, `tsconfig.json` de chaque paquet).

On top of whatever the repo documents, the Standards axis always carries the smell baseline below: a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing.

Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation. Like any standard here, skip anything tooling already enforces.

Never report a smell solely because the pattern exists. There should be evidence that it causes meaningful complexity, coupling, duplication, change amplification, or loss of clarity.

Each smell reads _what it is_ → _how to fix_; match it against the diff:

- **Mysterious Name**: a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code**: the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy**: a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps**: the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches**: the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change**: one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

---

### 4. Identify and run project validation

Follow the **MBV2 mono-repo** section above. Determine which package(s) the diff touches, then run the relevant commands from each package root.

Identify the smallest relevant commands for:

- tests
- typecheck (via `build` when no dedicated script exists)
- lint
- build

Run the relevant commands before final aggregation.

Do not blindly run expensive or destructive commands when they are clearly unrelated to the change.

Record the result of every command **per package**:

- `PASS`
- `FAIL`
- `NOT RUN`
- `UNAVAILABLE`

Example when both packages changed:

```text
Backend — Lint: PASS | Tests: PASS | Build: PASS
Frontend — Lint: UNAVAILABLE | Tests: NOT RUN | Build: PASS
```

Never claim a check passed unless it was actually executed.

A validation failure is itself a review finding when it is caused by the change.

Tests are evidence, not proof of correctness. Passing tests do not suppress a correctness finding when the implementation demonstrably violates a contract or has an uncovered failure mode.

---

### 5. Spawn the review sub-agents in parallel

Run the available review axes independently and in parallel.

Each sub-agent must receive:

- the exact fixed point
- the captured diff
- the commit list
- relevant repository context
- relevant validation results
- only the instructions and sources needed for its own axis

The axes must not be merged during analysis.

---

## Standards sub-agent

The Standards sub-agent prompt should include:

- the full diff command
- the commit list
- the contents of `docs/conventions.md`
- any additional standards-source files found in step 3
- the full smell baseline from step 3

Use this brief:

> Review ONLY the standards and design quality of the changed code against MBV2 conventions.
>
> Primary source: `docs/conventions.md` (NestJS layered modules, Angular standalone/signals, API/auth/ORM rules, file naming).
>
> Report:
>
> (a) every place the diff violates a documented repository standard: cite the standard source (file + rule);
>
> (b) any baseline smell you spot: name it and reference the smallest relevant hunk.
>
> Distinguish hard documented-standard violations from judgement calls. Baseline smells are always judgement calls. A documented repository standard overrides the smell baseline.
>
> Skip anything tooling enforces.
>
> Do not report correctness bugs, missing requirements, or unrelated pre-existing issues.
>
> Do not report a smell merely because its structural pattern exists. Report it only when there is evidence of meaningful complexity, coupling, duplication, change amplification, or loss of clarity.
>
> For every finding provide:
>
> - severity
> - confidence
> - file/line
> - minimal relevant code fragment
> - concise explanation
> - actionable recommendation
>
> Prefer fewer high-confidence findings over speculative observations.
>
> Under 500 words.

---

## Spec sub-agent

The Spec sub-agent prompt should include:

- the diff command
- the commit list
- the path or fetched contents of the spec
- relevant repository context

Use this brief:

> Review ONLY whether the change faithfully implements the originating specification.
>
> Report:
>
> (a) requirements the spec asked for that are missing or partial;
>
> (b) behaviour in the diff that wasn't asked for (scope creep);
>
> (c) requirements that look implemented but where the implementation does not faithfully satisfy the stated requirement.
>
> Quote or reference the smallest relevant spec passage for each finding.
>
> Do not invent requirements that are not stated or supported by repository evidence.
>
> Do not report style issues or general code-quality concerns.
>
> If the spec conflicts with an explicit current repository contract, report the conflict rather than assuming either side is automatically correct.
>
> For every finding provide:
>
> - severity
> - confidence
> - file/line
> - minimal relevant code fragment
> - relevant spec passage
> - concise explanation
> - actionable recommendation
>
> Prefer fewer high-confidence findings over speculative observations.
>
> Under 500 words.

If no spec exists, skip this sub-agent and report `no spec available`.

---

## Correctness / Risk sub-agent

The Correctness sub-agent should receive:

- the full diff
- the commit list
- relevant callers/callees
- relevant interfaces/types
- relevant tests
- relevant configuration
- relevant API/database contracts
- validation results

Use this brief:

> Review ONLY the behavioural correctness and risk of the changed code.
>
> Inspect the changed code and its relevant execution context.
>
> Look specifically for:
>
> - logic errors
> - incorrect assumptions
> - null/undefined/empty cases
> - boundary conditions
> - error handling failures
> - race conditions
> - concurrency issues
> - async/await mistakes
> - state inconsistencies
> - transaction boundary errors
> - authorization/authentication mistakes
> - validation gaps
> - incorrect caching or invalidation
> - resource leaks
> - retry/idempotency problems
> - backwards compatibility issues
> - API contract violations
> - incorrect database queries
> - timezone/date/number/encoding edge cases
> - security-sensitive behaviour
> - partial-failure scenarios
> - meaningful missing regression tests
>
> **MBV2 NestJS checklist** (when `backend/**` changed):
>
> - Use case delegates business logic — controller stays thin
> - Repository interface in `domain/`, impl in `infrastructure/` with `toDomain()` mapping
> - Domain entity separate from `*.orm-entity.ts`
> - Auth endpoints protected by correct guard (`JwtAuthGuard`, `OptionalJwtAuthGuard`, `RolesGuard`)
> - `@Roles()` matches the intended access level (`user | moderator | admin`)
> - Schema changes include a versioned MikroORM migration (`Migration{timestamp}_*.ts`)
> - Manual validation in use cases throws the right Nest exception (`BadRequestException`, `ForbiddenException`, `NotFoundException`)
> - API JSON stays camelCase; DB columns stay snake_case
> - No secrets or service-role keys in code or committed files
>
> **MBV2 Angular checklist** (when `frontend-angular/**` changed):
>
> - New/changed API calls go through `*-api.service.ts`; components use `*-data.service.ts` façade
> - `authInterceptor` still handles Bearer token and 401 refresh for protected routes
> - Route guards (`authGuard`, `roleGuard`) applied where access is restricted
> - Subscriptions cleaned up (or use `async` pipe / `takeUntilDestroyed`) — no memory leaks
> - Form values validated before API call; error states surfaced to the user
> - Frontend models (`*.model.ts`) stay in sync with API models (`*-api.model.ts`) and backend response shape
> - Mock data path (`useMockData`, `bouchon-*.data.ts`) not broken for offline dev
> - Signals/computed used consistently; no mixed imperative state that bypasses signals
>
> Cross-cutting (when both packages changed):
>
> - Backend endpoint contract matches frontend `*-api.service.ts` call (method, path, body, query params)
> - Auth flow consistent end-to-end (login, refresh, role checks, logout)
>
> Do not report style issues or speculative refactoring opportunities.
>
> For each finding:
>
> - identify the exact file and line/hunk
> - reference the smallest relevant code fragment
> - explain the concrete failure mode
> - explain why it can happen using repository evidence
> - provide a minimal reproduction scenario when possible
> - classify severity as BLOCKER / HIGH / MEDIUM / LOW
> - classify confidence as HIGH / MEDIUM / LOW
> - provide an actionable recommendation
>
> HIGH and BLOCKER findings require high confidence and a concrete failure mode.
>
> Do not claim a bug merely because a hypothetical input could exist. Establish that the input/state/path is plausible from the repository or specification.
>
> Review existing tests and determine whether they adequately protect meaningful behavioural changes.
>
> Do not demand tests for trivial implementation details.
>
> Prefer fewer high-confidence findings over many speculative findings.
>
> Under 600 words.

---

### 6. Aggregate

Present the reports under separate headings:

```text
## Standards

## Spec

## Correctness
```

Do **not** merge the axes into one conceptual score.

Do not allow a passing axis to mask a failing axis.

You may lightly clean formatting for readability, but preserve the substance of each finding.

### Deduplication

Do not merge findings merely because they occur in the same file.

However, if two findings describe the same underlying root cause and code location, mark them as related rather than presenting them as independent problems.

For example:

```text
Standards:
- duplicated validation logic

Correctness:
- duplicated validation can diverge and produce inconsistent behaviour

Related: same underlying duplication.
```

Keep the findings under their respective axes.

### Validation report

Include a separate validation section, **per package** when both are touched:

```text
## Validation

### Backend
- Lint: PASS / FAIL / NOT RUN / UNAVAILABLE
- Tests: PASS / FAIL / NOT RUN / UNAVAILABLE
- Build: PASS / FAIL / NOT RUN / UNAVAILABLE

### Frontend
- Lint: PASS / FAIL / NOT RUN / UNAVAILABLE
- Tests: PASS / FAIL / NOT RUN / UNAVAILABLE
- Build: PASS / FAIL / NOT RUN / UNAVAILABLE
```

Include failed command output only when it is useful to explain a finding.

---

## Final summary

End with a concise summary containing:

- total findings per axis
- the worst issue within each axis, if any
- validation status

Do not pick a single winner across axes.

For example:

```text
## Summary

Standards: 2 findings — worst: MEDIUM
Spec: 1 finding — worst: HIGH
Correctness: 2 findings — worst: BLOCKER

Validation:
- Backend — Lint: PASS | Tests: PASS | Build: PASS
- Frontend — Lint: UNAVAILABLE | Tests: NOT RUN | Build: PASS

Recommendation: DO NOT MERGE
```

The final recommendation should be based primarily on confirmed correctness/spec issues and validation failures, not on subjective smell findings alone.

Possible recommendations:

- `APPROVE`
- `APPROVE WITH NOTES`
- `CHANGES REQUESTED`
- `DO NOT MERGE`

---

## Why three axes

A change can pass one or two axes and fail another:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks project conventions → **Spec pass, Standards fail.**
- Code that follows the standards and implements the requested behaviour but contains a race condition or edge-case bug → **Standards pass, Spec pass, Correctness fail.**

Reporting them separately prevents one axis from masking another.

The goal is not to produce the largest number of findings.

The goal is to identify **real, actionable, evidence-backed problems with the smallest amount of noise possible**.
