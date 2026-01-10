# Lessons Learned: Email + SMS Notification System

This document captures the debugging journey and mistakes made while building the email and SMS notification system for Changelog Master.

## Summary of Issues

Building a notification system that sends emails with audio attachments and SMS messages resulted in multiple bugs:
1. Duplicate emails being sent
2. Missing audio attachments
3. SMS messages containing full content instead of short announcements

## Issue 1: Duplicate Emails

### What Happened
Users received two emails when triggering notifications - one with the audio attachment and one without.

### Root Cause
**Overly aggressive retry logic.** The code had fallback logic that would retry sending the email without the attachment if the first attempt "failed":

```typescript
// BAD: This caused duplicate emails
if (!response.ok) {
  // First email might have actually been sent despite error response
  console.log('[Email] API rejected email, trying without attachment...');
  delete emailPayload.attachments;
  // This sends a SECOND email
  const retryResponse = await fetch('https://api.resend.com/emails', ...);
}
```

The problem: Some API errors don't mean the email wasn't sent. The Resend API might return an error response but still deliver the email, resulting in two emails being received.

### The Fix
Remove all retry/fallback logic. If the email fails, just fail - don't try to "help" by sending another one:

```typescript
// GOOD: Simple, no duplicates
if (!response.ok) {
  console.error('[Email] Resend API error:', response.status, errorText);
  return false;  // Just fail, don't retry
}
```

### Lesson
**Don't add "helpful" retry logic without understanding the failure modes.** Email APIs may have partial success states. It's better to fail cleanly and let the user retry manually than to risk sending duplicate notifications.

---

## Issue 2: Missing Audio Attachments

### What Happened
Emails arrived without the audio file attached, even though the audio was being generated successfully.

### Root Causes (Multiple)

#### 2a. Attachment Size Limit Too Low
Initial limit was 1MB, but generated audio files were larger:

```typescript
// BAD: Too restrictive
const MAX_ATTACHMENT_SIZE = 1 * 1024 * 1024; // 1MB

// GOOD: Allow reasonable size for audio
const MAX_ATTACHMENT_SIZE = 3 * 1024 * 1024; // 3MB
```

#### 2b. Missing Content Type
The Resend API attachment was missing the explicit `type` field:

```typescript
// BAD: Missing type field
emailPayload.attachments = [{
  filename: 'summary.wav',
  content: base64Content,
}];

// GOOD: Explicit content type
emailPayload.attachments = [{
  filename: 'summary.wav',
  content: base64Content,
  type: 'audio/wav',
}];
```

#### 2c. Filename with Spaces
The version string "Claude Code 1.0.65" created filenames with spaces:

```typescript
// BAD: Spaces in filename
filename: `claude-code-${data.version}-summary.wav`
// Results in: "claude-code-Claude Code 1.0.65-summary.wav"

// GOOD: Replace spaces with hyphens
filename: `claude-code-${data.version.replace(/\s+/g, '-')}-summary.wav`
// Results in: "claude-code-Claude-Code-1.0.65-summary.wav"
```

#### 2d. Insufficient Logging
Without proper logging, it was impossible to diagnose why attachments weren't being added:

```typescript
// GOOD: Detailed logging for debugging
console.log('[Email] Audio buffer:', audioBuffer ? `${audioBuffer.length} bytes` : 'NULL');
console.log('[Email] Base64 content length:', base64Content.length, 'chars');
console.log('[Email] Attachment added with filename:', filename);
```

### Lesson
**When dealing with file attachments, validate everything:** size limits, content types, filenames, and add comprehensive logging to diagnose issues.

---

## Issue 3: Long SMS Messages

### What Happened
SMS notifications contained the full TL;DR summary (150-200 words) instead of a short announcement.

### Root Cause
The SMS message was using the full analysis content:

```typescript
// BAD: Full content in SMS
const message = `New ${data.version} released!\n\n${data.tldr}`;

// GOOD: Short announcement only
const message = `${data.version} released`;
```

### Lesson
**SMS and email have different constraints.** SMS should be ultra-short (under 160 chars ideally). Design notification content separately for each channel.

---

## Issue 4: Settings Not Syncing Between Components

### What Happened
The Header's email button didn't respect SMS settings from the SettingsPanel.

### Root Cause
The Header component called the email API directly without access to the SettingsPanel's state. Settings were stored in the backend database but the Header had no way to read them.

### The Fix
Use localStorage as a bridge between components:

```typescript
// In SettingsPanel - save to localStorage when settings change
const handleSmsNotificationsChange = async (enabled: boolean) => {
  setSmsNotificationsEnabled(enabled);
  localStorage.setItem('smsNotificationsEnabled', enabled.toString());
  await saveSetting('smsNotificationsEnabled', enabled.toString());
};

// In emailService - read from localStorage
const smsEnabled = localStorage.getItem('smsNotificationsEnabled') === 'true';
```

### Lesson
**Plan how state will flow between components before building.** If multiple components need access to the same settings, decide upfront whether to use:
- React Context
- localStorage
- URL parameters
- Backend API calls

---

## Issue 5: Old Code Running in Docker

### What Happened
After fixing bugs in the code, the old buggy behavior persisted.

### Root Cause
Docker containers cache the built image. Code changes require rebuilding:

```bash
# This doesn't pick up code changes
docker-compose up

# This rebuilds with new code
docker-compose down && docker-compose up --build
```

### Lesson
**Always rebuild Docker containers after code changes.** Consider adding this to your workflow or using volume mounts for development.

---

## General Lessons

### 1. Add Logging First
Before debugging, add comprehensive logging. Without logs, you're guessing:
```typescript
console.log('[Module] Step description:', relevantData);
```

### 2. Keep Notification Logic Simple
Don't add "smart" features like automatic retries or fallbacks for notifications. Users prefer one failed notification over two duplicate ones.

### 3. Test Each Channel Separately
Test email without SMS, then SMS without email, then both together. This isolates issues.

### 4. Validate External API Payloads
When sending data to external APIs (Resend, Twilio), log the exact payload being sent. Many issues come from malformed requests.

### 5. Consider Message Size Limits
- Email attachments: Check API limits (Resend allows 40MB but large files cause timeouts)
- SMS: Keep under 160 characters for single-segment messages
- TTS input: Longer text = larger audio files = potential attachment issues

### 6. Sanitize Dynamic Content in Filenames
Never use user-provided or dynamic strings directly in filenames without sanitization:
```typescript
const safeFilename = rawName.replace(/[^a-zA-Z0-9.-]/g, '-');
```

---

## Checklist for Future Notification Systems

- [ ] Define max attachment size based on email provider limits
- [ ] Add explicit content-type to all attachments
- [ ] Sanitize filenames (no spaces, special characters)
- [ ] Keep SMS under 160 characters
- [ ] Add logging for every step of the notification flow
- [ ] Test with Docker rebuild after every code change
- [ ] Don't add retry logic that could cause duplicates
- [ ] Plan state sharing between components upfront
- [ ] Test each notification channel in isolation
