# Versioning Guide for Barcode

## Overview

Barcode uses **Semantic Versioning** (MAJOR.MINOR.PATCH). The version is:
- **Defined once** in `package.json`
- **Automatically injected** into the app at build time
- **Displayed in the header** (top-right, between currency symbol and Settings button)

## How It Works

The version is automatically read from `package.json` during the build process:

1. **Build time:** `vite.config.ts` reads the version from `package.json`
2. **Injection:** Vite defines a global constant `__APP_VERSION__`
3. **Runtime:** App displays it in the header via `v{__APP_VERSION__}`

## Bumping the Version

### Automated (Recommended)

Use the provided script:

```bash
# Patch release (0.1.0 → 0.1.1): bug fixes, small improvements
./bump-version.sh patch

# Minor release (0.1.0 → 0.2.0): new features, backwards compatible
./bump-version.sh minor

# Major release (0.1.0 → 1.0.0): breaking changes, significant overhaul
./bump-version.sh major
```

### Manual

Edit `package.json`:

```json
{
  "name": "barcode",
  "version": "0.2.0"  // ← Change this
}
```

## Release Workflow

Once you've bumped the version:

```bash
# 1. Bump version
./bump-version.sh minor

# 2. Build
npm run build

# 3. Verify version displays correctly
npm run dev
# → Check header shows new version badge

# 4. Commit changes
git add .
git commit -m "Release v0.2.0"

# 5. Deploy
# (your deployment command here)
```

## Version Scheme

Use this scheme to decide what version to bump:

| Type | Example | When to Use |
|------|---------|------------|
| **Patch** | 0.1.0 → 0.1.1 | Bug fixes, small tweaks, performance improvements |
| **Minor** | 0.1.0 → 0.2.0 | New features, additions (backwards compatible) |
| **Major** | 0.1.0 → 1.0.0 | Breaking changes, major overhaul, significant redesign |

## Recent Versions

### v0.1.0 (Current)
- Initial release
- Core grocery list management
- Multi-provider support
- Receipt scanning with OCR
- Price comparison & products catalog
- Multi-language support (English, Swedish, Norwegian, Danish)
- Wabi-sabi aesthetic design

### Future Versions (Planned)

**v0.2.0** - Product Variants & Bulk Operations
- Manual product variant creation UI
- Bulk price updates for multiple products
- Smart shopping recommendations

**v0.3.0** - Price History & Alerts
- Price change tracking over time
- Price drop alerts
- Weekly price reports

## Files Involved

| File | Purpose |
|------|---------|
| `package.json` | **Single source of truth** for version |
| `vite.config.ts` | Reads version and injects `__APP_VERSION__` |
| `src/vite-env.d.ts` | TypeScript declaration for `__APP_VERSION__` |
| `src/App.tsx` | Displays version in header |
| `bump-version.sh` | Script to automate version bumping |

## Troubleshooting

**Version not updating in app?**
- Clear build cache: `rm -rf dist`
- Rebuild: `npm run build`
- Check that changes to `package.json` were saved

**Script won't run?**
- Make it executable: `chmod +x bump-version.sh`
- Ensure you're in the project root directory

**TypeScript error about `__APP_VERSION__`?**
- Check `src/vite-env.d.ts` exists with the correct declaration
- Restart TypeScript server in your editor
