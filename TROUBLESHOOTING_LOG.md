# Sleep Diary App - Development Log

## Project Info
- **Firebase Project**: sleep-diary-5b72f
- **GitHub Repo**: tomasbb0/sleep-diary (public)
- **Live URL**: https://tomasbb0.github.io/sleep-diary/
- **Unlock Time**: 4:30 AM daily

## Key Files
- `index.html` - Main HTML with auth screens, modals, splash screens
- `styles.css` - All styling including animations
- `app.js` - Complete application logic
- `sw.js` - Service worker for PWA
- `manifest.json` - PWA manifest (black theme)
- `icon-192.png` / `icon-512.png` - Black/white moon icons for iOS

## Features Implemented
1. 15-question sleep diary matching paper form
2. Firebase Auth (Google, Apple, Email)
3. Firestore database for entries
4. Streak gamification system
5. History view with session ranges ("seg → ter, 13/14 jan")
6. Splash screen with moon zoom animation
7. Welcome back splash for returning users
8. Name collection modal for users without names
9. Refresh button (↻) to force update cached version
10. PWA with black/white moon icon

## Bugs Fixed (Jan 2025)
- **Navigation bug**: Removed `showQuestion(0)` from `renderQuestions()`, moved to `startNewSession()` only
- **Async loading bug**: Wrapped `checkSessionAvailability()` inside `.then()` chain
- **Syntax error**: Fixed unclosed `.then(() => {` block
- **Moon pixelation**: Added `shape-rendering: geometricPrecision` and scale 200x
- **Wheel picker visibility**: Made highlight transparent

## Key Functions
- `loadUserName()` - Checks Firestore first, then Firebase auth displayName
- `saveUserName(name)` - Stores name in Firestore
- `formatSessionRange(nightDate)` - Returns "seg → ter, 13/14 jan" format
- `forceRefresh()` - Clears caches, unregisters SW, hard reload

## Deploy Command
```bash
cd /Users/tomasbatalha/Downloads/sleep-diary
git add -A && git commit -m "message" && git push
```
