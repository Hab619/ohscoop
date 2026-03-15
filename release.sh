#!/bin/bash
# ================================================================
# OhScoop — Personal Update Script
# by cybertrickz | cybertrickz.info
#
# Usage:
#   ./release.sh patch    → 2.0.0 to 2.0.1 (bug fixes)
#   ./release.sh minor    → 2.0.0 to 2.1.0 (new features)
#   ./release.sh major    → 2.0.0 to 3.0.0 (big changes)
#   ./release.sh          → just builds the zip, no version bump
# ================================================================

PLUGIN_FILE="ohscoop-recipe-card.php"
PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_SLUG="ohscoop-recipe-card"

cd "$PLUGIN_DIR"

# ── Get current version ─────────────────────────────────────────────
CURRENT=$(grep "Version:" "$PLUGIN_FILE" | grep -v "Requires" | head -1 | sed "s/.*Version: *//;s/ *//g")
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  OhScoop Release Tool"
echo "  Current version: $CURRENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Bump version if argument provided ──────────────────────────────
if [ -n "$1" ]; then
    MAJOR=$(echo "$CURRENT" | cut -d. -f1)
    MINOR=$(echo "$CURRENT" | cut -d. -f2)
    PATCH=$(echo "$CURRENT" | cut -d. -f3)

    case "$1" in
        major) MAJOR=$((MAJOR+1)); MINOR=0; PATCH=0 ;;
        minor) MINOR=$((MINOR+1)); PATCH=0 ;;
        patch) PATCH=$((PATCH+1)) ;;
        *)
            echo "  ❌ Unknown bump type: $1"
            echo "     Use: patch | minor | major"
            exit 1
            ;;
    esac

    NEW_VERSION="$MAJOR.$MINOR.$PATCH"
    echo "  Bumping → $NEW_VERSION"
    echo ""

    # Update version in main plugin file
    sed -i "" "s/Version:           $CURRENT/Version:           $NEW_VERSION/" "$PLUGIN_FILE" 2>/dev/null || \
    sed -i    "s/Version:           $CURRENT/Version:           $NEW_VERSION/" "$PLUGIN_FILE"

    # Update OHSCOOP_VERSION constant
    sed -i "" "s/define( 'OHSCOOP_VERSION', '$CURRENT' )/define( 'OHSCOOP_VERSION', '$NEW_VERSION' )/" "$PLUGIN_FILE" 2>/dev/null || \
    sed -i    "s/define( 'OHSCOOP_VERSION', '$CURRENT' )/define( 'OHSCOOP_VERSION', '$NEW_VERSION' )/" "$PLUGIN_FILE"

    # Update readme.txt stable tag and version
    sed -i "" "s/Stable tag: $CURRENT/Stable tag: $NEW_VERSION/" readme.txt 2>/dev/null || \
    sed -i    "s/Stable tag: $CURRENT/Stable tag: $NEW_VERSION/" readme.txt

    # Update README.md badge
    sed -i "" "s/Version-$CURRENT/Version-$NEW_VERSION/" README.md 2>/dev/null || \
    sed -i    "s/Version-$CURRENT/Version-$NEW_VERSION/" README.md

    echo "  ✅ Version bumped to $NEW_VERSION in:"
    echo "     → $PLUGIN_FILE"
    echo "     → readme.txt"
    echo "     → README.md"
    echo ""
    VERSION_TO_USE="$NEW_VERSION"
else
    VERSION_TO_USE="$CURRENT"
    echo "  ℹ️  No bump — building v$CURRENT"
    echo ""
fi

# ── Build zip ───────────────────────────────────────────────────────
DIST_DIR="$PLUGIN_DIR/../ohscoop-releases"
mkdir -p "$DIST_DIR"

ZIP_NAME="${PLUGIN_SLUG}-v${VERSION_TO_USE}.zip"
ZIP_PATH="$DIST_DIR/$ZIP_NAME"
LATEST_PATH="$DIST_DIR/${PLUGIN_SLUG}-latest.zip"

# Clean any old zip
rm -f "$ZIP_PATH" "$LATEST_PATH"

# Zip — exclude dev files
zip -r "$ZIP_PATH" . \
    --exclude "*.DS_Store" \
    --exclude "*.git*" \
    --exclude "*node_modules*" \
    --exclude "*.zip" \
    --exclude "./release.sh" \
    --exclude "*/__MACOSX*" \
    -q

# Also keep a "latest" copy for easy re-upload
cp "$ZIP_PATH" "$LATEST_PATH"

echo "  ✅ Zip built:"
echo "     → $ZIP_PATH"
echo "     → $LATEST_PATH  (always points to latest)"
echo ""

# ── Done ────────────────────────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Done! To install:"
echo ""
echo "  1. WordPress Admin"
echo "  2. Plugins → Add New → Upload Plugin"
echo "  3. Upload: $ZIP_NAME"
echo "  4. Click 'Replace current with uploaded'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
