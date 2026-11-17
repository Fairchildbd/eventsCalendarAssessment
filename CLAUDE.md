@AGENTS.md

## Code conventions

### Naming
- Never use single-letter or abbreviated names for variables, parameters, loop indexes or destructured values. This includes arrow-function parameters (`(event) =>`, never `(e) =>`). Use `index`, `key`, `value`, `reservation`, `listing`.
- Names carry meaning and units so no comment is needed: `priceCents`, `timeoutMs`, `sectionNumber`, `searchQuery`, `thumbnailUrl`, `isDisposed`. Rename an ambiguous field instead of explaining it.
- Name unit math with constants (`24 * HOUR_MS`), not repeated multiplications.
- Use normal React Native and TypeScript naming conventions. Do not adopt a naming style from a package. Name a function `use…` only if it is a hook.
- File names: components (`src/components`), screens (`src/screens`), navigators (`src/navigation`) and context providers (`src/store`) are PascalCase. Hooks, services, utils and other modules are camelCase. Route files in `src/app/` follow Expo Router.

### Comments
- Write no comments: no JSDoc, no inline comments, no JSX comments. Code must be legible on its own. If something seems to need a comment, find a better name or extract a well-named function.
- Keep only tooling directives (`eslint-disable`, `@ts-expect-error`) where a tool requires one.

### Code
- Use ordinary React and React Native patterns. Do not build patterns that sit outside React or React Native unless a package requires them.
- No `any`, and no `as` casts to get around types. Narrow `unknown` data with type guards. A cast is allowed only where a library's own types force it.
- Remove all dead code: unused exports, variables, parameters, styles, files and dependencies. Export only what another module imports. Remove a package when nothing imports it.
- Do not repeat code. Before adding a component, hook or helper, check `src/components`, `src/hooks` and `src/utils` for one that already does the job. Extract anything used more than once into a shared module, including constants, style blocks and layout patterns.
- Do not add behavior, fallbacks or edge-case handling the task did not ask for.

### Structure
- `src/assets` static files. `src/components` reusable UI that more than one screen uses, plus generic building blocks. `src/screens` one folder per screen (`EventsScreen/EventsScreen.tsx`), with the components only that screen uses in `components/` beside it. `src/navigation` navigators. `src/store` context providers. `src/hooks` custom hooks. `src/services` API calls and external integrations. `src/helpers` code that touches state, APIs or side effects (create only when needed). `src/utils` pure functions and constants. `src/types` shared types.
- Put a component in `src/components` only when more than one screen uses it or it is a generic building block. A component used by a single screen belongs in that screen's `components/` folder. Move it to `src/components` when a second screen needs it.
- Route files in `src/app/` are one-line re-exports of a screen or navigator.
- Do not keep screenshots, template leftovers or other files the app does not use.

### Tests
- Put tests in a `__tests__` folder next to the code they cover. Shared test helpers go in `__fixtures__`.
- Test hooks and providers with React Native Testing Library (`renderHook`).
- Use `it.each` for input and output cases.
- A test must not mutate shared fixtures and must not read source files to assert on their contents.
- Run tests with `npm test`.

### Before finishing
- Run `npm run typecheck`, `npm run lint` and `npm test`. All must pass.

### Git
- Do not commit or push. Stage files only when asked, and suggest a concise commit message.
- Do not add a `Co-Authored-By` line to commit messages.
