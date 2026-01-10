# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Changelog Master is a changelog tracking and notification system. It monitors software changelogs from any source, provides AI-powered analysis using Gemini, generates text-to-speech audio summaries, and sends email and SMS notifications when new versions are detected.

## Development Commands

```bash
# Start both frontend and backend (recommended for development)
npm run dev:all

# Run frontend only (Vite dev server on port 5173)
npm run dev

# Run backend only (Express server on port 3001)
npm run dev:server

# Build for production
npm run build

# Preview production build
npm run preview
```

**Important:** Always use `npm run dev:all` during development. The backend is required for audio caching, analysis storage, chat persistence, and email functionality.

## Architecture

### Frontend (React + Vite)
- Entry: `src/main.tsx` → `src/App.tsx`
- Components in `src/components/` with barrel export via `index.ts`
- Custom hooks in `src/hooks/`: `useChangelog` (data fetching + source management), `useAudio` (TTS playback), `useTheme` (dark/light mode)
- Services in `src/services/`: `geminiService` (AI analysis), `ttsService` (text-to-speech), `changelogService` (fetch/parse), `cacheService` (IndexedDB), `emailService` (notifications)
- TypeScript types in `src/types/index.ts`

### Backend (Express + SQLite)
- Single file: `server/index.ts` contains all API routes
- SQLite database stored at `data/audio.db`
- Uses `node-cron` for scheduled version checks

### Key Data Flow
1. Frontend fetches changelog via backend proxy (`/api/sources/:id/changelog`)
2. Analysis cached in SQLite (`analysis_cache` table), keyed by version
3. TTS audio cached in SQLite (`audio_cache` table), keyed by text hash + voice
4. Chat conversations persisted in `chat_conversations` and `chat_messages` tables

### Database Tables
- `changelog_sources` - URLs to monitor (id, name, url, is_active, last_version, last_checked_at)
- `changelog_history` - Version detection history (version, source_id, detected_at, notified)
- `analysis_cache` - Cached AI analyses keyed by version
- `audio_cache` - Cached TTS audio keyed by text_hash + voice
- `chat_conversations` / `chat_messages` - Chat history persistence
- `settings` - User preferences (key-value store)

### Cron Scheduler
The monitoring system uses `node-cron` with configurable intervals (5min, 15min, hourly, 6hr, daily, weekly, biweekly). When a new version is detected:
1. Save version to `changelog_history`
2. Analyze changelog with Gemini
3. Generate audio summary with TTS
4. Send email with HTML summary + audio attachment
5. Mark version as notified

## Environment Variables

Required in `.env`:
- `VITE_GEMINI_API_KEY` - Gemini API key for AI analysis and TTS

Optional - Email (Resend):
- `RESEND_API_KEY` - For email notifications
- `NOTIFY_EMAIL` - Recipient email address

Optional - SMS (Twilio):
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number (sender)
- `NOTIFY_PHONE` - Recipient phone number

Optional - Other:
- `VITE_CHANGELOG_CACHE_DURATION` - Cache duration in ms (default: 3600000)
- `VITE_VOICE_PREFERENCE` - Default TTS voice (default: Charon)

## API Endpoints

Backend runs on port 3001. Key endpoint groups:
- `/api/sources/*` - CRUD for changelog sources
- `/api/analysis/*` - Cached AI analysis
- `/api/audio/*` - TTS audio cache
- `/api/chat` - Gemini-powered Q&A
- `/api/conversations/*` - Chat history persistence
- `/api/monitor/*` - Cron job status and manual triggers
- `/api/settings/*` - User preferences
- `/api/send-*` - Email notifications

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4
- Backend: Express.js 5, better-sqlite3
- AI: `gemini-3-flash-preview` (analysis), `gemini-2.5-flash-preview-tts` (audio)
- Email: Resend API
- SMS: Twilio API
- Scheduling: node-cron
