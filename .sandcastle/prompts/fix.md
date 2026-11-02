# Role

You are fixing a failing verification on branch `{{SOURCE_BRANCH}}` (issue #{{ISSUE_NUMBER}}). Nobody is watching.

# What failed

{{FAILURES}}

# Instructions

1. Read the failure output carefully. Reproduce it by running the failing command yourself.
2. Fix the root cause in the code. Never skip, delete, or weaken tests or lint rules to make them pass. If a pre-existing test is legitimately outdated by this issue's intended change, update it and explain why in the commit message.
3. Re-run ALL verify commands until green:

{{VERIFY_COMMANDS}}

4. Commit the fix (e.g. `fix: make typecheck pass (#{{ISSUE_NUMBER}})`). Do not push.

When everything passes and is committed, output exactly: `<promise>COMPLETE</promise>`
