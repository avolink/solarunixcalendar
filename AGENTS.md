<!-- BEGIN:avolink-rules -->
<!-- Sincronizado desde ~/DEV/AVOLINK.md por sync-agents-header.mjs.
     NO editar aqui: se sobrescribe. Cambie el original y vuelva a ejecutarlo.
     Estas reglas MANDAN sobre lo que diga el resto de este documento. -->

# AGENTS.md — Avolink Professional Development Rules

Always implement the best practices for Professional Development:

1) Context Mapping and Project Awareness (Graphify), Full Context with Images by Default. Make sure getting contex from graph, if it's outdated, haves no full context with images, or the graph is non-existent, generate it with Graphify and get context from it before making any change in the repo. Always use free open source tools and software unless explicitly asked for the developer.

2) Develop in English with a translations.json (unless developer says it's a web project meant to be optimized for an specific locale and language, e.g: Spanish), Translate Labels and Text from the translations.json only. Things like names, brands, emails, physical addresses and numbers should not be transalted, unless explicitly requested for a particular feature, like optimizing SEO/AEO/GEO. By default use TypeScript for Frontend, Python for automation and scripting, Rust for very heavy and/or critical tasks in the Backend.

3) Use aphostrophe "'" as Thousands Separator for presentation to human users, dot "." as decimal separator, comma "," as prhases separator in strings and paragraphs.

4) Version Control. Make sure GIT and GitHub are configured optimally, junk and private keys (.env) must be git ignored and never pushed. Make sure every change is added, commited with a meaninful comment about the changes made, and pushed to remote repo (if no remote repo configured, warn the user so they're aware of it and fix it asap). Deploys must be atomic and reversible within seconds at any traffic level — release directories plus a symlink flip, never editing the live root in place. Canary deploys are an addition on top of that, not a replacement: adopt them once the app sustains over 1'000 sessions a day on the main app's sensitive features and a failure signal is in place (a client-side error beacon tagged with the release, so the two cohorts can be compared). Below that threshold, deploying to everyone with instant rollback has the same blast radius and gives faster feedback. When a canary does go wrong, it buys time to stop the exposure and decide deliberately — fix forward, or roll back if necessary.

5) Unit Testing Strategies:
Adopt AI-Assisted TDD: Write the test specifications, interfaces, or high-level assertions manually first, then let the AI implement the logic—or write the logic and explicitly prompt the AI to find boundary conditions (null values, network drops, integer overflows).

Verify with Mutation Testing: Run mutation testing tools (like Stryker or Mutmut) on AI-generated tests. If the tool injects deliberate bugs into your code and the AI’s tests still pass, the generated assertions are superficial and need tightening.

Property-Based Testing Over Static Cases: Instruct the AI to write property-based tests (e.g., using Fast-Check or Hypothesis) rather than basic hardcoded examples. This forces the test suite to validate invariants across thousands of random inputs.

6) Quality Metrics & Governance.
Context Efficiency (Token-to-Code Ratio): Measure how many tokens are consumed per approved line of code. High ratios signal poor prompt framing or missing graph context.

Code Health (Static Analysis Cleanliness): Enforce strict linters (ESLint, Ruff) and type-checkers (TypeScript, MyPy) as mandatory CI gates before merging AI PRs.

Stability (AI Churn Rate): Track how frequently AI-generated functions are modified or hotfixed within 14 days of merging.

Test Quality (Assertion Density): Audit generated tests to ensure they assert state/return values rather than just invoking functions without checking outputs.

7) QA Procedures & CI/CD Integration.
Impact-Based Test Execution: Integrate AI into your CI/CD pipeline to analyze git diffs and prioritize or execute only the tests affected by the changed code path, cutting down build times.

Self-Healing UI Automation (With Audit Logs): Use AI-driven testing frameworks (like Playwright with AI plugins or Virtuoso) to automatically repair flaky CSS/XPath selectors when UI components update. Always require an automated Git log entry when a selector "heals."

Human-in-the-Loop (HITL) Gatekeeping: Maintain a strict boundary: AI can generate test scripts, draft pull requests, and propose bug fixes, but human engineers must sign off on authorization logic, data boundaries, and business rules.

<!-- END:avolink-rules -->

---

# AGENTS.md — solar-unix-calendar

> **Este proyecto todavia no esta documentado.** Aqui arriba estan las reglas
> de Avolink, que mandan igual; pero nadie ha escrito aun lo propio de este
> repositorio: que stack usa, como esta organizado, como se despliega, y que
> cosas no se deben tocar.
>
> Antes de hacer un cambio de fondo, **pregunte al usuario por ese contexto y
> escribalo aqui debajo**, en vez de deducirlo del codigo y trabajar a ciegas.
> Para un apaño rapido puede seguir sin esto; para un proyecto ya asentado, no.

## Lo propio de este proyecto

<!-- Escriba aqui: stack y por que se eligio, estructura del repositorio,
     comandos (arrancar, probar, desplegar), y CADA regla que exista porque ya
     costo un incidente —esas son las que de verdad hacen falta. -->
