# SafeCycle — Checklist Production Store Submission
# Dernière mise à jour : 2026-04-09

---

## ✅ FIXES APPLIQUÉS (code)

| Fichier | Changement |
|---|---|
| `mobile/app.json` | ❌ Supprimé NSHealthShare/Update (rejet Apple 5.1.1) |
| `mobile/App.tsx` | mediaPlaybackRequiresUserAction=true |
| `mobile/App.tsx` | Guard dev sur clés RC manquantes |
| `mobile/.env` | Clé RC Apple ✅ + Clé RC Google ✅ |

---

## 🍎 APPLE APP STORE

### ✅ Configuration technique — OK pour build
- [x] Bundle ID : `store.inferencevision.safecycle`
- [x] `ITSAppUsesNonExemptEncryption: false`
- [x] PrivacyInfo.xcprivacy présent
- [x] 7 langues (CFBundleLocalizations)
- [x] Clé RC Apple : `appl_FdMMGmpyChMApyNIOqnksqqYVKb` ✅
- [x] Produit iOS : `SafeCycle Lifetime` (`safecycle_lifetime_001`) créé dans RevenueCat
- [x] EAS submit config : ascAppId=6761807718, teamId=SPLML3CN76

### ⚠️ App Store Connect — à compléter manuellement
- [ ] Catégorie : **Health & Fitness** (principale) + Lifestyle (secondaire)
  - ⚠️ NE PAS mettre "Medical"
- [ ] Age Rating : 12+
- [ ] Privacy Policy URL : https://inferencevision.store/safecycle/privacy
- [ ] Générer un App Store Connect API Key dans RevenueCat
  → https://app.revenuecat.com/projects/5b9013d2/apps → iOS app → API Key
  → https://appstoreconnect.apple.com/access/integrations/api → Générer clé

### Notes App Review (copier-coller dans App Store Connect)
```
DEMO ACCOUNT
No account required. Tap "Start Securely" on the welcome screen.
All health data is stored locally on device — zero-knowledge architecture.

TEST INSTRUCTIONS
1. Tap "Start Securely" on the onboarding screen
2. Navigate to Journal tab → log symptoms, mood, energy
3. Navigate to Dashboard to see cycle phase
4. Navigate to Insights for AI wellness analysis

IN-APP PURCHASE TEST
- Product: SafeCycle Lifetime (store.inferencevision.safecycle.lifetime)
- Tap the Settings icon (top-right profile avatar) → Settings → "Get SafeCycle Lifetime"
- Use Sandbox Apple ID for testing

NOTES
Not a medical device. SafeCycle provides general wellness information.
All user data stays on device — no PII is sent to our servers.
Gemini API is called server-side with no user identifier attached.
```

### Build iOS
```bash
cd mobile
eas build --platform ios --profile production
eas submit --platform ios
```

---

## 🤖 GOOGLE PLAY STORE

### ⚠️ BLOCANT CRITIQUE — Service Account JSON manquant

RevenueCat Android a besoin d'un Service Account JSON Google Cloud pour valider les achats.

#### Étape 1 : Créer le Service Account (Google Cloud Console)
1. Aller sur https://console.cloud.google.com
2. Sélectionner le projet lié à ton compte Google Play
3. IAM & Admin → Service Accounts → Create Service Account
4. Nom : `revenuecat-safecycle`
5. Rôle : **aucun rôle** à cette étape
6. Créer → Aller dans l'onglet "Keys" → Add Key → JSON → Télécharger le fichier

#### Étape 2 : Lier dans Google Play Console
1. Aller sur https://play.google.com/console
2. Setup → API access → Link to Google Cloud project
3. Grant access au service account → Permission : **Financial data (readonly)**

#### Étape 3 : Uploader dans RevenueCat
1. Aller sur https://app.revenuecat.com/projects/5b9013d2/apps/app34b43d8b64
2. Section "Service Account Credentials JSON"
3. Drag & drop le fichier JSON téléchargé à l'étape 1

#### Étape 4 : Créer le produit dans Google Play Console
1. Aller sur https://play.google.com/console → SafeCycle → Monetize → Products → In-app products
2. Create product :
   - Product ID : `store.inferencevision.safecycle.lifetime`
   - Name : SafeCycle Lifetime
   - Price : 19,99 USD
   - Status : Active

#### Étape 5 : Importer dans RevenueCat
1. https://app.revenuecat.com/projects/5b9013d2/product-catalog/products
2. "Import from Google Play" → sélectionner `store.inferencevision.safecycle.lifetime`
3. Lier à l'entitlement `safecycle Pro`
4. Lier au package `$rc_lifetime` dans l'offering `default`

### ✅ Configuration Android déjà en place
- [x] Package : `store.inferencevision.safecycle`
- [x] Clé RC Google : `goog_CQBNZqaFxXGKUKinwbdajmGARxo` ✅
- [x] `android.permissions: []` (minimal)
- [x] versionCode: 1
- [x] adaptive-icon configuré

### Google Play Console — à compléter
- [ ] Fiche créée dans Play Console
- [ ] Service Account JSON uploadé dans RevenueCat
- [ ] Produit lifetime créé dans Play Console
- [ ] Data Safety questionnaire rempli :
  ```
  Données collectées : Historique achats (RevenueCat uniquement)
    - Liées à l'identité : NON
    - Usage : Fonctionnement de l'app
  Données NON collectées : santé, localisation, contacts, messages
  Chiffrement en transit : OUI
  Suppression possible : OUI
  ```
- [ ] Politique de confidentialité : https://inferencevision.store/safecycle/privacy
- [ ] Build interne uploadé (AAB)
- [ ] Testé sur track Interne → Fermé → Production

### Build Android
```bash
cd mobile
eas build --platform android --profile production
# Télécharger le .aab depuis expo.dev et uploader manuellement dans Play Console
# OU :
eas submit --platform android
```

---

## 🔑 Récapitulatif des clés

| Service | Clé | Statut |
|---|---|---|
| RevenueCat iOS | `appl_FdMMGmpyChMApyNIOqnksqqYVKb` | ✅ Production |
| RevenueCat Android | `goog_CQBNZqaFxXGKUKinwbdajmGARxo` | ✅ Clé OK, Service Account ⚠️ |
| EAS Project | `92a5d3d3-eb9e-489c-92dd-63db087c728c` | ✅ OK |
| Apple ASC App | `6761807718` | ✅ OK |
| Apple Team | `SPLML3CN76` | ✅ OK |
