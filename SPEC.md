# SafeCycle - Spécification Technique

## 1. Concept & Vision

SafeCycle est une application de suivi menstrual qui place la vie privée au centre de son architecture. Toutes les données sont chiffrées localement avec AES-256-GCM, aucune account requis, aucun serveur cloud. L'application offre une expérience minimaliste et non-genrée pour les personnes atteintes de pathologies (SOPK, endométriose) ou cherchant simplement un suivi sans hyper-focalisation sur la fertilité.

## 2. Design Language

### Aesthetic Direction
Minimaliste scandinave épurée - inspiré des applications de bien-être premium comme Oura ou Simple. Tons neutres chaleureux, aucune surcharge visuelle.

### Color Palette
- **Background Primary**: `#F5F1EB` (beige chaud)
- **Background Secondary**: `#EDE8E0` (beige plus foncé)
- **Surface**: `#FFFFFF` (cartes)
- **Text Primary**: `#2D2A26` (brun très foncé)
- **Text Secondary**: `#6B6560` (brun moyen)
- **Accent Primary**: `#C4A77D` (or rosé)
- **Accent Secondary**: `#E8D5C4` (rose poudré)
- **Success**: `#7D9C7D` (vert sauge)
- **Warning**: `#D4A574` (terracotta clair)
- **Danger**: `#C17B7B` (rose désert)

### Typography
- **Headings**: `DM Serif Display` - élégant, lisible
- **Body**: `Inter` - moderne, excellent readability sur mobile
- **Monospace**: `JetBrains Mono` - pour les données chiffrées/technique

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64
- Border radius: 12px (cards), 8px (buttons), 20px (pills)
- Max content width: 420px (mobile-optimized)

### Motion Philosophy
- Transitions: 200ms ease-out (micro), 400ms ease-out (page)
- No jarring animations - everything feels calm and intentional
- Subtle scale on press (0.98) for tactile feedback
- Staggered fade-in for list items (50ms delay)

### Visual Assets
- Icons: Lucide React (outline style, 1.5px stroke)
- No illustrations - pure geometric shapes
- Privacy badge: shield icon avec lock

## 3. Layout & Structure

### Navigation
Bottom tab navigation avec 4 tabs:
1. **Accueil** - Vue calendrier/ Aujourd'hui
2. **Suivi** - Journal des entrées
3. **Statistiques** - Tendances et corrélations
4. **Paramètres** - Mode, confidentialité, achat

### Page Structure
- Safe area aware (notch/home indicator)
- Header compact avec titre de page
- Content scrollable avec pull-to-refresh
- Bottom nav fixe, 64px height
- Cards avec 16px padding, 12px radius

### Responsive Strategy
Mobile-first (375px - 428px optimal)
Pas de desktop optimization - focus mobile pure

## 4. Features & Interactions

### Mode de Suivi
4 modes sélectionnables dans Paramètres:
- **Simple**: Cycle standard, notifications minimales
- **SOPK**: Adapté aux cycles irréguliers, hyperandrogenisme
- **Endométriose**: Suivi douleur, symptômes spécifiques
- **Contraception**: Suivi méthode contraceptive, alertes rappel

### Fonctionnalités Core

#### Calendrier (Accueil)
- Vue mois avec indicateurs de flux (léger/moyen/fort)
- Jours fertiles marqués (optionnel, désactivable)
- Tap sur jour = voir détails/ajouter entrée
- Swipe gauche/droite pour changer de mois

#### Journal (Suivi)
- Liste chronologique inversée des entrées
- Chaque entrée: date, flux, symptômes, notes
- Quick-add floating button
- Swipe-to-delete avec confirmation

#### Entrée Journal
- Date picker (défaut: aujourd'hui)
- Flux: None / Spotting / Light / Medium / Heavy
- Symptômes: checklist multi-select
  -通用: Crampes, Fatigue, Maux de tête, Sensibilité poitrine, Gonflement, Acne, Changement d'humeur, Insomnie
  - SOPK: Pilosité accrue, Perte de cheveux, Difficulté poids
  - Endométriose: Douleur pelvienne, Douleur lombaire, Douleur intercourse, Nausées
- Notes: textarea libre (chiffré)
- Sauvegarde automatique au blur

#### Statistiques
- Longueur cycle moyen (derniers 6 mois)
- Longueur phase lutéale
- Graphique tendance longueur cycle (ligne)
- Corrélations: symptômes vs phase cycle (si assez de données)
- Mode predictions ON/OFF (IA locale)

#### Paramètres
- Mode de suivi (Simple/SOPK/Endométriose/Contraception)
- Notifications: reminders, prédictions, rappels médicament
- Confidentialité: Voir données exportées, Supprimer toutes les données
- Achat: Upgrade vers Lifetime (19.99$)
- Langue: FR/EN

### États

#### Empty States
- Pas de données: Illustration simple + "Commencez votre premier suivi"
- Pas de statistiques: "Ajoutez 3 cycles pour voir vos tendances"

#### Loading States
- Skeleton screens pour listes
- Spinner discret pour sauvegardes

#### Error States
- Erreur sauvegarde: Toast en bas, retry automatique
- Chiffrement échoué: Alerte modale, données non sauvegardées

## 5. Component Inventory

### Button
- Variants: primary (filled), secondary (outline), ghost
- States: default, hover (opacity 0.9), active (scale 0.98), disabled (opacity 0.5)
- Sizes: sm (32px), md (44px), lg (52px)

### Card
- Background: white
- Shadow: 0 2px 8px rgba(0,0,0,0.06)
- Border-radius: 12px
- Padding: 16px

### TabBar
- Background: white
- Border-top: 1px solid #EDE8E0
- Active tab: icon #C4A77D, text #2D2A26
- Inactive: icon/text #6B6560

### CalendarCell
- Size: 44x44px minimum
- Today: ring 2px #C4A77D
- Selected: filled #C4A77D, text white
- Has entry: dot indicator below
- Flow indicators: 1-3 dots colored by intensity

### SymptomPill
- Background: #EDE8E0 (unselected), #E8D5C4 (selected)
- Border-radius: 20px
- Padding: 8px 16px
- Text: 14px

### Input
- Height: 48px
- Border: 1px solid #EDE8E0
- Focus: border #C4A77D
- Border-radius: 8px

### Toast
- Position: bottom, 80px from bottom nav
- Background: #2D2A26 (dark)
- Text: white
- Auto-dismiss: 3s

## 6. Technical Approach

### Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **State**: React Context + useReducer
- **Storage**: IndexedDB (local only) + encryption
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Icons**: Lucide React

### Data Model

```typescript
interface CycleEntry {
  id: string;
  date: string; // ISO date
  flow: 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
  symptoms: string[];
  notes: string; // encrypted
  createdAt: number;
  updatedAt: number;
}

interface CyclePhase {
  startDate: string;
  endDate: string | null;
  type: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
}

interface UserSettings {
  mode: 'simple' | 'sopk' | 'endometriosis' | 'contraception';
  notifications: {
    reminders: boolean;
    predictions: boolean;
    medication: boolean;
  };
  language: 'fr' | 'en';
  hasPro: boolean;
}
```

### Encryption Strategy
1. PBKDF2 pour dériver clé depuis passphrase (optionnel pour déverrouillage)
2. AES-256-GCM pour chiffrer notes
3. Clé stockée dans IndexedDB (local only)
4. Aucune donnée sent to any server

### Storage Structure
```
IndexedDB: "safecycle-db"
  - "entries" store: CycleEntry[]
  - "settings" store: UserSettings
  - "encryption-key" store: CryptoKey
```

### API Design
Aucune API externe - 100% local
Toutes les opérations sont des fonctions React synchrones avec IndexedDB

### Predictions (Local AI-lite)
-算法 de calcul cycle moyen sur 6 mois
- Prédiction ovulation: jour 14 avant luteal phase (ajustable)
- Confidence basada sur consistency des cycles passés
