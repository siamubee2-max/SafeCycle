# SafeCycle — Mobile App (Expo)

Wrapper natif iOS/Android pour la PWA SafeCycle.
Architecture : **Expo WebView + RevenueCat IAP**.

## Structure

```
mobile/
├── App.tsx          ← App principale (WebView + RevenueCat)
├── app.json         ← Config Expo (Bundle ID, icon, splash)
├── eas.json         ← Profils EAS Build (dev / preview / production)
├── .env.example     ← Variables d'environnement (copier → .env.local)
└── assets/          ← Icon 1024x1024 + splash + adaptive-icon
```

## Configuration initiale

### 1. Variables d'environnement
```bash
cp .env.example .env.local
```
Remplir :
- `EXPO_PUBLIC_WEB_APP_URL` : URL de la PWA hébergée (ex: `https://inferencevision.store/safecycle`)
- `EXPO_PUBLIC_RC_APPLE_KEY` : Clé API RevenueCat iOS (depuis app.revenuecat.com)
- `EXPO_PUBLIC_RC_GOOGLE_KEY` : Clé API RevenueCat Android

### 2. EAS (Expo Application Services)
```bash
npm install -g eas-cli
eas login
eas build:configure   # Génère automatiquement les credentials iOS
```

Mettre à jour `eas.json` → section `submit.production` avec votre Apple ID et Team ID.

### 3. RevenueCat — Product ID à créer dans App Store Connect
```
store.inferencevision.safecycle.lifetime
Entitlement: lifetime
Type: Non-consommable
Prix: Tier 20 ($19.99)
```

### 4. Assets requis
- `assets/icon.png` → 1024×1024 px (fond #003634, logo SafeCycle blanc)
- `assets/splash.png` → 1284×2778 px (iPhone 15 Pro Max)
- `assets/adaptive-icon.png` → 1024×1024 px (pour Android)

---

## Développement local

```bash
# Depuis /zip — démarrer la PWA + proxy Gemini
npm run dev:full

# Cet IP local (remplacer dans .env.local)
EXPO_PUBLIC_WEB_APP_URL=http://192.168.x.x:3000

# Démarrer l'app Expo
cd mobile
npx expo start
```

Tester sur simulateur iOS : `npx expo run:ios`

---

## Builds EAS

```bash
# Build simulateur (développement)
eas build --platform ios --profile development

# TestFlight (distribution interne)
eas build --platform ios --profile preview
eas submit --platform ios  # → TestFlight automatique

# App Store (production)
eas build --platform ios --profile production
eas submit --platform ios
```

---

## Notes App Review

Pour la note reviewer Apple :
- L'app charge une PWA via WebView sur `inferencevision.store`
- Aucune donnée utilisateur n'est transmise à des serveurs tiers
- L'IA Gemini est appelée via un proxy sécurisé côté serveur (clé non exposée)
- Le Lifetime IAP est géré par RevenueCat (StoreKit 2)
- Compte de test Sandbox : créer dans App Store Connect → Users & Access → Sandbox Testers
