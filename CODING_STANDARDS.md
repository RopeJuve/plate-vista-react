# Coding Standards

Judgement calls a reviewer checks by reading the code. Lint, typecheck and tests already enforce the rest. Each rule points to the source that owns the detail; read that source instead of copying it here.

## Structure

- Follow the `structure-feature-code` skill (`.claude/skills/structure-feature-code/SKILL.md`): small components, logic in hooks, rules in pure modules, and the file locations it lays down.

## UI changes

- Visual choices follow `DESIGN.md`: Overview (the two materials, the single print motion), Colors and Typography (their Named Rules), Components (reuse the chit, step row, lamp and hazard hatch before inventing new ones) and Do's and Don'ts.
- Product behaviour follows `PRODUCT.md`: Product Principles (one order, one truth: every surface names a state the same way) and Accessibility & Inclusion. Use Users and Operating Context to decide who the screen is for and where it is used.

## API contract

- The API's payments contract (`docs/payments-contract.md` in `RopeJuve/plate-vista-api`) decides REST and realtime shapes; `docs/PROTOCOL.md` covers the rest of the realtime protocol. When the contract and this repo disagree, the contract wins.
- msw handlers (`src/mocks/handlers/`), fixtures and types must match the contract. Do not invent a field, status or path in a mock that the API does not send.

## Tests

- Test through what the user sees and does, with Testing Library. A test should fail when visible behaviour breaks and keep passing when only the implementation changes; do not test component internals or hook state directly.
