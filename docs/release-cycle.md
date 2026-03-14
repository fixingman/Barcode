# Release Cycle

Barcode follows a structured release process. Every release moves through six phases.
This document is the single source of truth for what "done" means before shipping.

---

## Versioning

**Semantic Versioning**: `MAJOR.MINOR.PATCH`

| Bump | When |
|------|------|
| `PATCH` | Bug fixes, copy corrections, visual tweaks — no new surface |
| `MINOR` | New user-facing features, backwards-compatible |
| `MAJOR` | Breaking changes, major UX restructuring, data model changes |

Pre-release tags: `0.3.0-alpha`, `0.3.0-beta`, `0.3.0-rc.1`
`0.x.x` = pre-stable. `1.0.0` = first production-ready release.

---

## Phases

```
Development → Feature Freeze → Pre-Release Checks → RC → Release → Post-Release Cleanup
```

### Phase 1 — Development (ongoing)

- All work lands on `main`.
- Every meaningful change gets a line in `CHANGELOG.md` under `[Unreleased]`.
- Use categories: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.
- No constraints on refactoring or tech debt during this phase.

### Phase 2 — Feature Freeze

- Cut a branch: `release/X.Y.Z`
- No new features from this point. Only bug fixes and hardening.
- Announce internally: "X.Y.Z is in freeze."
- Open a freeze checklist issue (GitHub Issue or local note) linking to this document.

### Phase 3 — Pre-Release Checks

Run all four gates below. Each must be signed off before RC.

---

#### Gate A — Consistency

Goal: the product feels like one thing made by one person.

**UI/UX**
- [ ] All new screens follow the 8px grid (no ad-hoc spacing values)
- [ ] Typography uses defined tokens only — no hardcoded font sizes or weights
- [ ] Colors use defined tokens only — no hardcoded hex values outside the token file
- [ ] Touch targets ≥ 44×44 pt on all interactive elements
- [ ] Icon set is uniform — no mixing of different icon families
- [ ] Error, empty, and loading states exist for every new data-driven screen
- [ ] Tones of voice in all copy are consistent (review design-heuristics skill)

**Code**
- [ ] Linter and formatter pass with zero warnings
- [ ] Naming conventions consistent across the new code (files, functions, variables)
- [ ] No duplicate logic — verify no parallel implementations of the same thing
- [ ] API response shapes consistent with existing patterns
- [ ] New tests follow the same structure as existing tests

---

#### Gate B — Privacy

Goal: only collect what is needed, protect what is collected.

**Data inventory**
- [ ] List every new piece of user data this version touches (collected, stored, transmitted)
- [ ] Confirm each item has a documented purpose ("we collect X because Y")
- [ ] Verify no PII appears in logs, analytics events, or crash reports
- [ ] Confirm data that is no longer needed is deleted on schedule

**Third-party**
- [ ] Audit any new SDK/library added this cycle for its data collection practices
- [ ] Confirm no new SDK sends data to a third party without user awareness
- [ ] Review permissions requested — drop any that are no longer needed

**User control**
- [ ] Users can access, export, or delete their data if applicable
- [ ] Privacy policy is up to date if the data model changed

---

#### Gate C — Performance

Goal: the new version is not slower than the previous one on any tracked metric.

**Baselines** (define these once the stack is chosen, replace the examples below)
- Startup time (cold launch)
- Time to interactive
- Frame rate on scroll/animation (target ≥ 60 fps)
- Bundle/binary size
- Memory usage at steady state
- Network payload per core user journey

**Checks**
- [ ] Run baseline measurement on the RC build
- [ ] Compare against previous release baseline — no regression above 10% on any metric
- [ ] All new images and assets are compressed/optimized
- [ ] No blocking operations on the main thread in new code
- [ ] No memory leaks in new screens (check with profiler)
- [ ] Network requests are batched or debounced where appropriate

---

#### Gate D — Security

Goal: no new attack surface; no known vulnerabilities shipped.

**Dependencies**
- [ ] Run dependency vulnerability scan (`npm audit`, `cargo audit`, `flutter pub audit`, etc.)
- [ ] All high/critical CVEs are resolved or explicitly accepted with justification
- [ ] No dependency added without a review of its maintenance status

**Code**
- [ ] No secrets, API keys, or credentials committed to the repo (run `git log --all -S "key"` or use a secrets scanner)
- [ ] All user inputs validated and sanitized before use
- [ ] All user inputs are treated as untrusted — no direct interpolation into queries, commands, or HTML
- [ ] Authentication and authorization untouched or explicitly reviewed if changed
- [ ] Sensitive data is not stored in plain text (local storage, logs, cache)
- [ ] OWASP Top 10 spot-check for any new user-facing surface

**Transport**
- [ ] All network calls use HTTPS
- [ ] Certificate pinning in place if required
- [ ] No sensitive data in URL parameters

---

### Phase 4 — Memory & Skills Review

Before cutting the RC tag, review the project's own knowledge files.
These drift silently and cause incorrect AI-assisted decisions if left stale.

**CLAUDE.md**
- [ ] Are build/run commands still accurate?
- [ ] Are test commands still accurate?
- [ ] Does the architecture overview reflect what was actually built?
- [ ] Are any "not yet defined" sections now defined and need filling in?
- [ ] Remove any notes that are no longer true

**`.claude/skills/*.md`**
- [ ] Does `design-heuristics.md` reflect the current design system tokens and decisions?
- [ ] If a design decision was made that deviates from the skill, document the exception
- [ ] If a new reusable process or pattern emerged this cycle, consider extracting it into a skill

**Changelog and version**
- [ ] `CHANGELOG.md` — move `[Unreleased]` content into the versioned section
- [ ] Bump version in source (package file, pubspec, manifest, etc.)
- [ ] Update the diff link at the bottom of CHANGELOG.md

---

### Phase 5 — Release

```bash
# After all gates pass and CHANGELOG is finalized
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

- Publish the release on GitHub with the CHANGELOG entry as release notes
- Notify users in-app via the version indicator and changelog modal (see UI spec below)

---

### Phase 6 — Post-Release Cleanup

Run this pass in the first few days after release, before the next development cycle starts.
This keeps the codebase from accumulating permanent debt.

**Code health**
- [ ] Search for `TODO` and `FIXME` — resolve, escalate, or delete each one
- [ ] Remove all code that was commented out during development
- [ ] Remove feature flags for features that shipped
- [ ] Delete dead code (unreachable branches, unused exports, orphaned files)

**Dependencies**
- [ ] Update non-security dependencies that were deferred during freeze
- [ ] Remove dependencies no longer used

**Tests**
- [ ] Ensure test coverage didn't drop vs the previous release
- [ ] Delete tests that test deleted code
- [ ] Add regression tests for any bugs that were fixed in this cycle

**Baselines**
- [ ] Record the new performance baseline for the next cycle's comparison

---

## Version in the UI

The version string and changelog are surfaced to users as follows:

### Version indicator
- Displayed in a low-hierarchy position: app footer, settings screen, or about page
- Format: `v1.2.3` or `Version 1.2.3`
- Tapping/clicking opens the Changelog modal

### Changelog modal
- Lists releases from newest to oldest
- Each release shows: version number, date, and the same categories from `CHANGELOG.md`
- New-since-last-open items are visually marked (e.g., a dot or "New" badge)
- The modal dismisses cleanly and marks all as seen (persist to local storage)

### "What's new" badge
- On first launch after an update, show a badge on the version indicator
- Badge disappears once the user opens the changelog modal
- Do not use a full-screen interstitial for this — it breaks flow

---

## Hotfix Process

For critical bugs or security issues on a released version:

1. Branch from the release tag: `git checkout -b hotfix/X.Y.Z+1 vX.Y.Z`
2. Fix only the critical issue — nothing else
3. Run Gate D (Security) and Gate C (Performance baseline, abbreviated)
4. Run Memory & Skills review for any affected docs
5. Release as `X.Y.(Z+1)`, tag immediately
6. Merge hotfix back into `main`

---

## Audit Triggers

Beyond the scheduled release gates, certain events always trigger an immediate review:

| Event | Immediate action |
|-------|-----------------|
| New third-party SDK added | Full Gate B (Privacy) for that SDK |
| New user input surface added | Gate D input validation section |
| Authentication flow changed | Full Gate D |
| Data schema migrated | Gate B data inventory update |
| Performance regression reported | Gate C full run |
| Security CVE disclosed for a dependency | Patch or mitigate before next release, regardless of cycle |
