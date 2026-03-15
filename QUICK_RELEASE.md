# Quick Release Guide

## One-Command Release

When you're ready to release a new iteration, just run:

```bash
# For bug fixes and small improvements
npm run release:patch

# For new features
npm run release:minor

# For breaking changes / major updates
npm run release:major
```

That's it! The command will:
1. ✅ Bump the version in `package.json`
2. ✅ Rebuild the app
3. ✅ Automatically inject the new version into the header
4. ✅ Everything is ready to deploy

## Where to See the Version

**Header (top-right corner)**
- Between the currency symbol (£, $, kr, etc.) and the Settings gear icon
- Shows as a small gray badge: `v0.1.0`

## Version History

Your releases will automatically show here. Current version: **v0.1.0**

## Example Workflow

```bash
# 1. You just finished adding a new feature (smart product comparison)
npm run release:minor
# → Version bumps to 0.2.0
# → App rebuilds automatically
# → Header now shows "v0.2.0"

# 2. Later, you find and fix a bug
npm run release:patch
# → Version bumps to 0.2.1
# → Header now shows "v0.2.1"

# 3. Commit and deploy
git add .
git commit -m "Release v0.2.1"
git push origin main
```

## What Gets Updated

- ✅ `package.json` version field
- ✅ App header version badge
- ✅ Build output with new version

## Notes

- No need to manually edit the version anywhere
- No hardcoded version strings to update
- Version is read once at build time
- Zero overhead at runtime
