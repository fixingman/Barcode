#!/bin/bash

# Bump version script for Barcode
# Usage: ./bump-version.sh patch|minor|major
# Example: ./bump-version.sh minor

set -e

VERSION_TYPE=${1:-patch}

# Get current version
CURRENT_VERSION=$(grep '"version"' package.json | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)

echo "Current version: $CURRENT_VERSION"

# Use npm version to bump (this updates package.json and creates git tag if in a git repo)
npm version $VERSION_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(grep '"version"' package.json | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)

echo "✅ Version bumped from $CURRENT_VERSION to $NEW_VERSION"
echo ""
echo "Next steps:"
echo "  1. Build: npm run build"
echo "  2. Commit: git add . && git commit -m 'Release v$NEW_VERSION'"
echo "  3. Deploy"
