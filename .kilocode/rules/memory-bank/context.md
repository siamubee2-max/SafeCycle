# Active Context: SafeCycle - Menstrual Cycle Tracker

## Current State

**Project Status**: ✅ Production-ready

SafeCycle is a Zero-Knowledge menstrual cycle tracking application with full local encryption. All data is stored in IndexedDB with AES-256-GCM encryption. No account required, no cloud server.

## Recently Completed

- [x] SafeCycle application built from scratch
- [x] Zero-knowledge encryption layer (AES-256-GCM via Web Crypto API)
- [x] IndexedDB storage layer with encryption key management
- [x] Complete UI component library (Button, Card, Calendar, FlowSelector, SymptomPill, etc.)
- [x] Home page with interactive calendar
- [x] Journal page with entry management
- [x] Statistics page with cycle trends and correlations
- [x] Settings page with mode selection, notifications, export, and Lifetime purchase flow
- [x] App context for state management
- [x] Multi-mode support: Simple, SOPK, Endométriose, Contraception
- [x] PWA manifest for installability
- [x] Build successful

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/lib/types.ts` | TypeScript types | ✅ |
| `src/lib/constants.ts` | Translations, colors, defaults | ✅ |
| `src/lib/utils.ts` | Date helpers, calculations | ✅ |
| `src/lib/encryption.ts` | AES-256-GCM encryption | ✅ |
| `src/lib/storage.ts` | IndexedDB wrapper | ✅ |
| `src/components/*.tsx` | UI components | ✅ |
| `src/context/AppContext.tsx` | State management | ✅ |
| `src/app/page.tsx` | Home/Calendar | ✅ |
| `src/app/journal/page.tsx` | Journal entries | ✅ |
| `src/app/statistics/page.tsx` | Stats & trends | ✅ |
| `src/app/settings/page.tsx` | Settings & purchase | ✅ |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **State**: React Context + useReducer
- **Storage**: IndexedDB (local only)
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Icons**: Lucide React
- **Language**: TypeScript (strict)

## Design System

- **Colors**: Beige palette (#F5F1EB, #EDE8E0), accent gold (#C4A77D)
- **Typography**: DM Serif Display (headings), Inter (body)
- **Layout**: Mobile-first, max-width 420px, bottom tab navigation

## Session History

| Date | Changes |
|------|---------|
| Initial | Next.js template created |
| 2026-03-31 | Built SafeCycle - Zero-Knowledge menstrual tracker |

## Pending Improvements

- [ ] Add mock data/demo entries for showcase
- [ ] Implement actual payment flow for Lifetime purchase
- [ ] Add more symptom tracking options
- [ ] Dark mode support
- [ ] Push notification implementation
