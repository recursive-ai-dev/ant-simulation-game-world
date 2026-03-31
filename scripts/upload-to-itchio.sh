#!/bin/bash
# Upload script for itch.io
# Requires: butler (https://itch.io/docs/butler/)

set -e

echo "🔨 Building production bundle..."
npm run build

echo ""
echo "📦 Preparing itch.io upload..."

# Check if butler is installed
if ! command -v butler &> /dev/null; then
    echo "❌ butler is not installed."
    echo "Install it from: https://itch.io/docs/butler/"
    echo "Or run: npm install -g butler"
    exit 1
fi

# Check if logged in to butler
if ! butler status &> /dev/null; then
    echo "❌ Not logged in to butler."
    echo "Run: butler login"
    echo "Then visit: https://itch.io/user/oauth"
    exit 1
fi

# Get itch.io username from user
echo ""
echo "Enter your itch.io username:"
read -r ITCH_USERNAME

# Get game page slug from user
echo "Enter your game page slug (e.g., ant-sim-emergence):"
read -r GAME_SLUG

if [ -z "$ITCH_USERNAME" ] || [ -z "$GAME_SLUG" ]; then
    echo "❌ Username and game slug are required."
    exit 1
fi

echo ""
echo "🚀 Uploading to itch.io..."
echo "Target: ${ITCH_USERNAME}/${GAME_SLUG}:html5"

# Upload the dist folder as html5 build
butler push dist/ "${ITCH_USERNAME}/${GAME_SLUG}:html5" \
    --userversion "$(node -p "require('./package.json').version")"

echo ""
echo "✅ Upload complete!"
echo "Your game is now live at: https://${ITCH_USERNAME}.itch.io/${GAME_SLUG}"
echo ""
echo "Next steps:"
echo "1. Visit your game page to configure details"
echo "2. Add screenshots and cover art"
echo "3. Set the game genre and tags"
echo "4. Configure pricing (optional donations)"
