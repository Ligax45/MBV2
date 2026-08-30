---
name: handoff
description: Create a compact, actionable handoff for another agent to continue the current task.
argument-hint: "What should the next session focus on?"
disable-model-invocation: true
---

Create a handoff document for a fresh agent that will continue the current task.

The handoff must be concise and actionable. Do not summarize the conversation chronologically. Capture the current state of the work.

Include these sections:

# Objective

What the user is trying to accomplish.

# Current Status

What has been completed and what is currently working.

# Remaining Work

Concrete work that is still required.

# Decisions

Important technical or product decisions already made.
Include the reasoning only when it is necessary to avoid revisiting a decision.

# Constraints

Requirements, limitations, conventions, or user preferences that the next agent must respect.

# Known Issues

Bugs, blockers, failed approaches, uncertainties, or unresolved questions.

# Relevant Artifacts

Reference existing artifacts instead of duplicating their contents.
Include paths or URLs for:

- specs
- plans
- ADRs
- issues
- commits
- relevant source files
- diffs

# Suggested Skills

List skills that the next agent should consider calling with the Skill tool.

Separate them into:

- Required
- Recommended

Only suggest skills that are directly relevant to the remaining work.

# Next Action

Describe the single most useful first action the next agent should take.

# User Intent

Capture the user's latest intended outcome and any important expectations.

Rules:

- Do not duplicate information already stored in other artifacts.
- Prefer references to existing artifacts over copying their contents.
- Do not invent missing information.
- Clearly distinguish facts, decisions, assumptions, and unresolved questions.
- Preserve important technical details needed to continue the work.
- Redact sensitive information such as API keys, passwords, tokens, secrets, and personally identifiable information.
- If the user provided arguments, use them to determine what information is most relevant to the next session.
- Save the handoff document to the user's OS temporary directory, not the current workspace.
- Use a unique filename containing a timestamp.
- After saving the document, report the absolute path to the created file.
