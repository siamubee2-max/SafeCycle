#!/bin/bash
# ============================================================
# SafeCycle — Purge secrets from git history
# ⚠️  À exécuter UNE SEULE FOIS, puis supprimer ce fichier.
# ⚠️  Préviens tous tes collaborateurs : ils devront faire
#     `git pull --rebase` après le force-push.
# ============================================================

set -e

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║  SafeCycle — Purge des secrets du dépôt git       ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# ── Étape 0 : Vérifier qu'on est dans le bon dossier ─────────────────────────
if [ ! -f "app.json" ] || [ ! -f "App.tsx" ]; then
  echo "❌ Lance ce script depuis le dossier mobile/ de SafeCycle."
  exit 1
fi

# ── Étape 1 : Vérifier que git-filter-repo est installé ──────────────────────
if ! command -v git-filter-repo &>/dev/null; then
  echo "⚙️  git-filter-repo non trouvé. Installation via pip..."
  pip3 install git-filter-repo --break-system-packages 2>/dev/null || pip install git-filter-repo
fi

echo "✅ git-filter-repo disponible."
echo ""

# ── Étape 2 : Supprimer les fichiers du tracking git ────────────────────────
echo "▸ Suppression de google-service-account.json du suivi git..."
git rm --cached google-service-account.json 2>/dev/null && echo "  ✅ google-service-account.json retiré du staging" || echo "  ℹ️  Déjà absent du staging"

echo "▸ Suppression de .env du suivi git..."
git rm --cached .env 2>/dev/null && echo "  ✅ .env retiré du staging" || echo "  ℹ️  Déjà absent du staging"

# ── Étape 3 : Mettre à jour .gitignore ───────────────────────────────────────
echo ""
echo "▸ Mise à jour de .gitignore..."

GITIGNORE=".gitignore"

if ! grep -q "google-service-account.json" "$GITIGNORE" 2>/dev/null; then
  echo "" >> "$GITIGNORE"
  echo "# Secrets — ne jamais committer" >> "$GITIGNORE"
  echo "google-service-account.json" >> "$GITIGNORE"
  echo "  ✅ google-service-account.json ajouté à .gitignore"
fi

if ! grep -q "^\.env$" "$GITIGNORE" 2>/dev/null; then
  echo ".env" >> "$GITIGNORE"
  echo "  ✅ .env ajouté à .gitignore"
fi

# ── Étape 4 : Purger l'historique git complet ─────────────────────────────────
echo ""
echo "▸ Purge de l'historique git (réécriture complète)..."
echo "  ⚠️  Cette opération est irréversible sur ce clone."
echo ""

# Purger les deux fichiers de tout l'historique
git filter-repo \
  --path google-service-account.json --invert-paths \
  --path .env --invert-paths \
  --force

echo ""
echo "✅ Historique purgé."

# ── Étape 5 : Commit du .gitignore mis à jour ─────────────────────────────────
echo ""
echo "▸ Commit des changements .gitignore..."
git add .gitignore
git commit -m "security: remove secrets from tracking and gitignore them

- google-service-account.json → gitignored (private key)
- .env → gitignored (API keys)
History rewritten with git-filter-repo to remove these files entirely." 2>/dev/null || echo "  ℹ️  Rien à committer (déjà propre)"

# ── Étape 6 : Force push ──────────────────────────────────────────────────────
echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║  PROCHAINE ÉTAPE : Force-push                     ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "  Lance manuellement (après avoir vérifié) :"
echo ""
echo "  git push origin --force --all"
echo "  git push origin --force --tags"
echo ""
echo "  ⚠️  Puis va IMMÉDIATEMENT révoquer la clé Google :"
echo "  https://console.cloud.google.com/iam-admin/serviceaccounts"
echo "  → Projet gen-lang-client-0428833510"
echo "  → play-store-deploy@... → Manage Keys → Delete key"
echo ""
echo "  ⚠️  Regénère un nouveau JSON et place-le localement"
echo "  sans jamais le committer."
echo ""
echo "✅ Script terminé."
