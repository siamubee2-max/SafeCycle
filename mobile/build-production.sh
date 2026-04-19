#!/bin/bash
# SafeCycle — Production Build Script
# Lance iOS et Android en séquence
# Usage: ./build-production.sh

set -e

# Charger NVM si disponible
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

cd "$(dirname "$0")"
echo ""
echo "╔════════════════════════════════════════╗"
echo "║  SafeCycle — Production Build          ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Vérifier qu'on est connecté à EAS
echo "▸ Vérification connexion EAS..."
eas whoami || (echo "❌ Non connecté à EAS. Lance: eas login" && exit 1)
echo ""

# ─── iOS ───────────────────────────────────────
echo "══════════════════════════════════════════"
echo "  📱 Build iOS (production)"
echo "══════════════════════════════════════════"
echo "  Tu vas être invité à entrer ton Apple ID"
echo "  Pour générer automatiquement:"
echo "  • Distribution Certificate"
echo "  • Provisioning Profile"
echo ""
eas build --platform ios --profile production
echo ""
echo "✅ Build iOS soumis. URL visible ci-dessus."
echo ""

# ─── Android ───────────────────────────────────
echo "══════════════════════════════════════════"
echo "  🤖 Build Android (production)"
echo "══════════════════════════════════════════"
eas build --platform android --profile production --non-interactive
echo ""
echo "✅ Build Android soumis."
echo ""

echo "╔════════════════════════════════════════╗"
echo "║  Suivi: https://expo.dev/builds        ║"
echo "╚════════════════════════════════════════╝"
