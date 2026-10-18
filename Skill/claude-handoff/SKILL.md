---
name: claude-handoff
description: Prepare compact, copy-ready task handoffs for Claude in the browser, then review and integrate Claude's response into the current workspace.
---

# Claude Handoff

Use this skill when the user asks to involve Claude to reduce Codex context use, get an independent analysis, or work on a task in parallel through Claude's website.

## Limits

- Claude's website is a separate session. Do not claim to open it, send messages, read its response, or access the user's Claude account.
- The user must paste the handoff into Claude and bring Claude's response back. Claude cannot see local workspace files unless the user provides or uploads them.
- Do not suggest exposing API keys, passwords, private tokens, or other secrets in a handoff.
- Keep the user's original scope, permissions, and requested outcome. Handoff does not grant Claude or Codex extra authorization.

## Prepare a handoff

1. Use the current task and workspace to determine the smallest useful context. Include exact file paths, relevant excerpts, observed behavior, constraints, and decisions already made. Do not dump unrelated conversation or whole files when a focused excerpt is enough.
2. If Claude needs files it cannot access, name the exact files for the user to attach or paste. Never imply those files were sent automatically.
3. Write a self-contained prompt with the requested outcome, essential context, constraints, and a concrete response format. Ask Claude to state assumptions and distinguish verified facts from suggestions. Bound the requested output to what the task needs.
4. Present the prompt in one copy-ready code block and tell the user to paste it into [Claude](https://claude.ai/new). Do not include a long explanation around it.
5. If important task details are missing and cannot be inferred, ask for them before building the handoff. Otherwise prepare it directly.

## Integrate Claude's response

When the user brings back Claude's output, inspect it against the current workspace and the original request. Treat it as an external proposal: verify file names, APIs, assumptions, and code behavior before applying changes. Make the agreed changes in the workspace, preserve unrelated edits, and report what was verified. If the user returns only a summary, ask for the patch or relevant details needed to apply it accurately.

Use handoffs selectively. For a small task that is faster to complete directly, keep working in Codex instead of adding a manual round trip.
