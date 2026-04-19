#!/bin/bash
# ============================================================
# SafeCycle — Pre-Submission Checklist
# Lance avant chaque `eas submit --platform ios`
# Usage : ./pre-submit-check.sh
# ============================================================

set -euo pipefail

PASS=0
FAIL=0
WARN=0

green() { echo "  ✅  $1"; PASS=$((PASS+1)); }
red()   { echo "  ❌  $1"; FAIL=$((FAIL+1)); }
warn()  { echo "  ⚠️   $1"; WARN=$((WARN+1)); }
sep()   { echo ""; echo "── $1 ──────────────────────────────────"; }

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║  SafeCycle — Pre-Submission Check                 ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# ── Vérifier qu'on est dans le bon dossier ────────────────────────────────────
if [ ! -f "app.json" ]; then
  echo "❌ Lance depuis le dossier mobile/"
  exit 1
fi

# ══════════════════════════════════════════════════════
sep "1. SÉCURITÉ — Secrets"
# ══════════════════════════════════════════════════════

# google-service-account.json ne doit pas être tracké
if git ls-files --error-unmatch google-service-account.json &>/dev/null 2>&1; then
  red "google-service-account.json est tracké par git → RÉVOQUE LA CLÉ IMMÉDIATEMENT"
else
  green "google-service-account.json non tracké par git"
fi

# .env ne doit pas être tracké
if git ls-files --error-unmatch .env &>/dev/null 2>&1; then
  warn ".env est tracké par git (clés RC publiques — risque modéré mais mauvaise pratique)"
else
  green ".env non tracké par git"
fi

# Vérifier que les clés RC sont présentes dans .env
if [ -f ".env" ]; then
  if grep -q "EXPO_PUBLIC_RC_APPLE_KEY=appl_" .env 2>/dev/null; then
    green "Clé RevenueCat Apple présente dans .env"
  else
    red "EXPO_PUBLIC_RC_APPLE_KEY manquante ou invalide dans .env"
  fi
else
  red ".env introuvable — les clés RevenueCat ne seront pas incluses dans le build"
fi

# ══════════════════════════════════════════════════════
sep "2. CONFIDENTIALITÉ"
# ══════════════════════════════════════════════════════

if [ -f "PrivacyInfo.xcprivacy" ]; then
  green "PrivacyInfo.xcprivacy présent"

  if grep -q "NSPrivacyTracking" PrivacyInfo.xcprivacy; then
    green "NSPrivacyTracking déclaré dans PrivacyInfo.xcprivacy"
  else
    red "NSPrivacyTracking manquant dans PrivacyInfo.xcprivacy"
  fi

  if grep -q "NSPrivacyAccessedAPITypes" PrivacyInfo.xcprivacy; then
    green "NSPrivacyAccessedAPITypes déclaré"
  else
    warn "NSPrivacyAccessedAPITypes absent — vérifie si des APIs système sont utilisées"
  fi
else
  red "PrivacyInfo.xcprivacy manquant — REJET GARANTI depuis mai 2024"
fi

# ══════════════════════════════════════════════════════
sep "3. PERMISSIONS"
# ══════════════════════════════════════════════════════

FACEID=$(python3 -c "import json; d=json.load(open('app.json')); print(d['expo']['ios']['infoPlist'].get('NSFaceIDUsageDescription',''))" 2>/dev/null || echo "")
if [ -n "$FACEID" ] && [ "$FACEID" != "None" ]; then
  green "NSFaceIDUsageDescription présente : '$FACEID'"
else
  warn "NSFaceIDUsageDescription absente — nécessaire si Face ID est utilisé"
fi

HEALTH=$(python3 -c "import json; d=json.load(open('app.json')); print(d['expo']['ios']['infoPlist'].get('NSHealthShareUsageDescription','ABSENT'))" 2>/dev/null || echo "ABSENT")
if [ "$HEALTH" = "ABSENT" ]; then
  green "NSHealthShareUsageDescription absente — HealthKit non utilisé (correct)"
else
  warn "NSHealthShareUsageDescription présente — Apple scrutinisera l'usage HealthKit (Guideline 5.1.1)"
fi

# ══════════════════════════════════════════════════════
sep "4. IN-APP PURCHASE"
# ══════════════════════════════════════════════════════

if grep -q "restorePurchases" App.tsx 2>/dev/null; then
  green "restorePurchases() implémenté dans App.tsx"
else
  red "restorePurchases() absent — bouton Restaurer requis pour IAP non-consommable (Guideline 3.1.1)"
fi

if grep -q "REVENUECAT_APPLE_KEY\|RC_APPLE_KEY" App.tsx 2>/dev/null; then
  green "Clé RevenueCat Apple référencée dans App.tsx"
else
  red "Référence clé RevenueCat Apple introuvable dans App.tsx"
fi

# ══════════════════════════════════════════════════════
sep "5. CONFIGURATION EAS"
# ══════════════════════════════════════════════════════

if [ -f "eas.json" ]; then
  green "eas.json présent"

  DIST=$(python3 -c "import json; d=json.load(open('eas.json')); print(d['build']['production']['distribution'])" 2>/dev/null || echo "")
  if [ "$DIST" = "store" ]; then
    green "Production distribution: store ✓"
  else
    red "Production distribution n'est pas 'store' (valeur: '$DIST')"
  fi

  ASC_ID=$(python3 -c "import json; d=json.load(open('eas.json')); print(d['submit']['production']['ios'].get('ascAppId',''))" 2>/dev/null || echo "")
  if [ -n "$ASC_ID" ]; then
    green "ascAppId configuré : $ASC_ID"
  else
    red "ascAppId manquant dans eas.json → eas submit échouera"
  fi

  TEAM_ID=$(python3 -c "import json; d=json.load(open('eas.json')); print(d['submit']['production']['ios'].get('appleTeamId',''))" 2>/dev/null || echo "")
  if [ -n "$TEAM_ID" ]; then
    green "appleTeamId configuré : $TEAM_ID"
  else
    red "appleTeamId manquant dans eas.json"
  fi
else
  red "eas.json manquant"
fi

# ══════════════════════════════════════════════════════
sep "6. MÉTADONNÉES APP"
# ══════════════════════════════════════════════════════

VERSION=$(python3 -c "import json; d=json.load(open('app.json')); print(d['expo']['version'])" 2>/dev/null || echo "")
BUILD=$(python3 -c "import json; d=json.load(open('app.json')); print(d['expo']['ios'].get('buildNumber',''))" 2>/dev/null || echo "")
green "Version : $VERSION / buildNumber : $BUILD"

BUNDLE=$(python3 -c "import json; d=json.load(open('app.json')); print(d['expo']['ios']['bundleIdentifier'])" 2>/dev/null || echo "")
if [ -n "$BUNDLE" ]; then
  green "Bundle ID : $BUNDLE"
else
  red "Bundle ID manquant dans app.json"
fi

# Vérifier les métadonnées ASO locales
if [ -f "fastlane/metadata/en-US/description.txt" ]; then
  DESC_LEN=$(wc -c < fastlane/metadata/en-US/description.txt)
  if [ "$DESC_LEN" -le 4000 ]; then
    green "Description EN (${DESC_LEN} car.) dans la limite des 4000 car."
  else
    red "Description EN trop longue (${DESC_LEN} car. > 4000)"
  fi
fi

if [ -f "fastlane/metadata/en-US/name.txt" ]; then
  NAME_LEN=$(wc -c < fastlane/metadata/en-US/name.txt | tr -d ' ')
  if [ "$NAME_LEN" -le 30 ]; then
    green "Titre EN (${NAME_LEN} car.) dans la limite des 30 car."
  else
    red "Titre EN trop long (${NAME_LEN} car. > 30)"
  fi
fi

if [ -f "fastlane/metadata/en-US/subtitle.txt" ]; then
  SUB_LEN=$(wc -c < fastlane/metadata/en-US/subtitle.txt | tr -d ' ')
  if [ "$SUB_LEN" -le 30 ]; then
    green "Sous-titre EN (${SUB_LEN} car.) dans la limite des 30 car."
  else
    red "Sous-titre EN trop long (${SUB_LEN} car. > 30)"
  fi
fi

if [ -f "fastlane/metadata/en-US/keywords.txt" ]; then
  KW_LEN=$(wc -c < fastlane/metadata/en-US/keywords.txt | tr -d ' ')
  if [ "$KW_LEN" -le 100 ]; then
    green "Mots-clés EN (${KW_LEN} car.) dans la limite des 100 car."
  else
    red "Mots-clés EN trop longs (${KW_LEN} car. > 100)"
  fi
fi

# ══════════════════════════════════════════════════════
sep "7. CODE DYNAMIQUE (Guideline 2.5.2)"
# ══════════════════════════════════════════════════════

DYNAMIC_HITS=$( { grep -rn "dlopen\|dlsym" . \
  --include="*.ts" --include="*.tsx" --include="*.js" \
  --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null || true; } | wc -l | tr -d ' ' )
if [ "${DYNAMIC_HITS:-0}" = "0" ]; then
  green "Aucun appel dlopen/dlsym détecté"
else
  red "${DYNAMIC_HITS} appel(s) dlopen/dlsym détecté(s) — rejet immédiat Guideline 2.5.2"
fi

# ══════════════════════════════════════════════════════
sep "8. GOOGLE SERVICE ACCOUNT"
# ══════════════════════════════════════════════════════

if [ -f "google-service-account.json" ]; then
  warn "google-service-account.json présent localement (nécessaire pour eas submit android) — ne pas committer"
else
  warn "google-service-account.json absent — eas submit android échouera si planifié"
fi

# ══════════════════════════════════════════════════════
echo ""
echo "╔════════════════════════════════════════════════════╗"
printf  "║  Résultat : ✅ %2d  ⚠️  %2d  ❌ %2d                     ║\n" $PASS $WARN $FAIL
echo "╚════════════════════════════════════════════════════╝"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "🛑  $FAIL problème(s) bloquant(s) à corriger avant de soumettre."
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo "⚠️   $WARN avertissement(s) — à vérifier manuellement."
  exit 0
else
  echo "🚀  Tout est bon — tu peux lancer eas submit !"
  exit 0
fi
