# Implementation Prompt: Meeting Metadata & Enhanced Summaries

## Context

You are working on a meeting recording application called Shadow Bot. Currently, recordings have transcripts and executive summaries. We need to add:

1. Auto-generated titles (editable)
2. AI-generated tags for search (editable)
3. Detailed summaries (comprehensive, lossless)

## Database Schema Changes

### [Recording](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/web/src/lib/status-utils.ts#10-17) model (packages/db/prisma/schema.prisma)
- **NOTE:** `title` field (String?) already exists but is not auto-populated yet
- No schema changes needed for Recording model

### Update [Transcript](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/web/src/lib/api/meeting.ts#29-33) model (packages/db/prisma/schema.prisma)
- Add `tags` field (String[], array of normalized tags)
- Add `detailedSummary` field (String?, comprehensive summary)

**Run migration after schema changes.**

---

## Implementation Requirements

### 1. Default Title Generation

**When:** Recording is created (in [apps/http/src/routes/v1/meeting.ts](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/http/src/routes/v1/meeting.ts), `/join` endpoint)
**Format:** "Meeting on [date], [day]" (e.g., "Meeting on 9th Feb, Monday")
**Library:** Use `date-fns` for formatting

### 2. AI Tag Generation

**When:** After executive summary is generated (in [apps/transcribe-service/src/index.ts](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/transcribe-service/src/index.ts))
**Input:** Transcript + Executive Summary
**Output:** 3-7 tags as JSON array

**Prompt to use:**

```
You are analyzing a meeting transcript to extract relevant tags for organization and search.

INSTRUCTIONS:
1. Generate 3-7 tags that capture the essence of this meeting
2. Include:
   - People mentioned (first names or full names if clear)
   - Main topics/themes discussed
   - Project names or product names
   - Key action areas (e.g., "planning", "review", "brainstorm")
3. Use lowercase with hyphens for multi-word tags (e.g., "product-roadmap")
4. Be specific, not generic (avoid "meeting", "discussion", "important")
5. Return ONLY a JSON array of strings, nothing else

TRANSCRIPT:
${transcript}

SUMMARY:
${JSON.stringify(summary)}

Return format: ["tag1", "tag2", "tag3"]
```

**After generation:**

- Parse the JSON response
- Normalize tags using the normalization function (see below)
- Save to `Transcript.tags` field

### 3. Tag Normalization

Create utility function `normalizeTag(tag: string): string` that:

1. Converts to lowercase
2. Replaces spaces with hyphens
3. Removes special characters (keep only a-z, 0-9, hyphens)
4. Collapses multiple hyphens into one
5. Trims leading/trailing hyphens

Create utility function `normalizeTags(tags: string[]): string[]` that:

1. Normalizes each tag
2. Removes empty strings
3. Removes duplicates

**Use this normalization:**

- When saving AI-generated tags
- When saving user-edited tags
- When searching by tags

### 4. Detailed Summary Generation

**When:** After executive summary is generated (in [apps/transcribe-service/src/index.ts](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/transcribe-service/src/index.ts))
**Input:** Full transcript

**Prompt to use:**

```
You are creating a comprehensive, detailed summary of a meeting transcript.

GOAL: Condense the transcript while preserving ALL information, including:
- Main discussion points
- Side conversations and interruptions
- Background context and tangential remarks
- Specific names, dates, numbers, and commitments
- Tone and sentiment where relevant

RULES:
1. Write in chronological order
2. Use clear, concise language (remove filler words like "um", "uh")
3. Preserve the substance of every statement
4. Include details that might seem minor (e.g., "Someone asked to close the window")
5. Format as readable paragraphs, not bullet points
6. Do NOT editorialize or add your own interpretation

TRANSCRIPT:
${transcript}

Write the detailed summary:
```

**Save to:** `Transcript.detailedSummary` field

### 5. API Endpoint for Editing

**Location:** [apps/http/src/routes/v1/meeting.ts](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/http/src/routes/v1/meeting.ts)
**Endpoint:** `PATCH /:id`
**Body:** `{ title?: string, tags?: string[] }`
**Validation:**

- Title: 1-200 characters
- Tags: Max 20 tags
- Normalize tags before saving

**Logic:**

1. Verify user owns the recording
2. Normalize tags if provided
3. Update `Recording.title` and/or `Transcript.tags`
4. Return updated recording

### 6. Search Enhancement

**Location:** [apps/http/src/routes/v1/meeting.ts](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/http/src/routes/v1/meeting.ts)
**Endpoint:** `GET /`
**Query params:**

- `tags` (comma-separated, e.g., "alex,mobile-app")
- `search` (text search on title)

**Logic:**

1. Normalize tag query params
2. Filter recordings where `Transcript.tags` contains ALL specified tags (use PostgreSQL `hasEvery`)
3. Filter by title using case-insensitive contains

### 7. Frontend Updates

**Location:** [apps/web/src/components/meeting-library.tsx](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/web/src/components/meeting-library.tsx)

**Display:**

- Show `recording.title` (make it editable on click)
- Show `recording.transcript.tags` as chips/badges
- Make tags editable (chip input component)

**API Client:**

- Add `updateRecording(id, { title?, tags? })` to [apps/web/src/lib/api/meeting.ts](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/web/src/lib/api/meeting.ts)

---

## Important Notes

1. **Tag Storage:** Tags go in [Transcript](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/web/src/lib/api/meeting.ts#29-33) model, NOT [Recording](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/web/src/lib/status-utils.ts#10-17), because they're only generated after transcription/summarization
2. **Title Storage:** Title goes in [Recording](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/web/src/lib/status-utils.ts#10-17) model because it's set immediately on creation
3. **Normalization:** ALWAYS normalize tags before saving (both AI-generated and user-edited)
4. **Error Handling:** If tag generation fails, save empty array (don't block the workflow)
5. **Performance:** Add GIN index on `Transcript.tags` for fast searches
6. **Cost:** Detailed summary adds ~1 extra LLM call per meeting

---

## Testing Checklist

- [ ] Default title generated on recording creation
- [ ] Tags normalized correctly (lowercase, hyphens, no duplicates)
- [ ] AI generates specific tags (not generic)
- [ ] Detailed summary preserves all information
- [ ] User can edit title and tags via API
- [ ] Search filters by tags correctly
- [ ] Frontend displays and allows editing

---

## File Locations Summary

- Schema: [packages/db/prisma/schema.prisma](file:///home/falguni/Desktop/small-projects/shadow-bot/packages/db/prisma/schema.prisma)
- Tag generation: [apps/transcribe-service/src/index.ts](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/transcribe-service/src/index.ts)
- Tag utils: `apps/transcribe-service/src/utils/tag-utils.ts` (create new)
- API endpoints: [apps/http/src/routes/v1/meeting.ts](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/http/src/routes/v1/meeting.ts)
- Frontend: [apps/web/src/components/meeting-library.tsx](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/web/src/components/meeting-library.tsx)
- API client: [apps/web/src/lib/api/meeting.ts](file:///home/falguni/Desktop/small-projects/shadow-bot/apps/web/src/lib/api/meeting.ts)
