# 🗺️ Frontend Refactoring Roadmap

## 🎯 Mission: Clean Architecture Following Apple Podcasts Pattern

```
┌────────────────────────────────────────────────────────────────┐
│  CURRENT STATE: 😵 Messy (3 API folders, duplicates)          │
│                                                                │
│  TARGET STATE:  ✨ Clean (1 API folder, DRY, best practices)  │
└────────────────────────────────────────────────────────────────┘
```

---

## 📊 Migration Progress Tracker

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ PHASE 1: FOUNDATION                                  [0/5]   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   ☐ Setup clean folder structure
   ☐ Create src/api/client.ts
   ☐ Create src/api/types.ts
   ☐ Create src/queries/client.ts
   ☐ Create src/queries/keys.ts

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ PHASE 2: MIGRATE SPEAKERS                            [0/5]   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   ☐ Create src/api/endpoints/speakers.ts
   ☐ Create src/queries/hooks/speakers.ts
   ☐ Update speaker screens
   ☐ Test speaker functionality
   ☐ Delete old speaker files

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ PHASE 3: MIGRATE COLLECTIONS                         [0/5]   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   ☐ Create src/api/endpoints/collections.ts
   ☐ Create src/queries/hooks/collections.ts
   ☐ Update collection screens
   ☐ Test collection functionality
   ☐ Delete old collection files

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ PHASE 4: MIGRATE LECTURES                            [0/5]   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   ☐ Create src/api/endpoints/lectures.ts
   ☐ Create src/queries/hooks/lectures.ts
   ☐ Update lecture screens
   ☐ Test lecture functionality
   ☐ Delete old lecture files

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ PHASE 5: MIGRATE USER FEATURES                       [0/3]   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   ☐ Migrate favorites (endpoints + hooks)
   ☐ Migrate playback position (endpoints + hooks)
   ☐ Migrate streaming (endpoints + hooks)

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ PHASE 6: CLEANUP & VALIDATION                        [0/3]   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   ☐ Delete all old folders
   ☐ Update all imports
   ☐ Final testing

OVERALL PROGRESS: ░░░░░░░░░░░░░░░░░░░░░░░░░░ 0/26 (0%)
```

---

## 🏗️ Architecture Transformation

### BEFORE (Current Mess):
```
src/
├── api/endpoints/              ← NEW files (wrong location)
├── services/api/               ← OLD files (duplicate)
├── hooks/api/                  ← OLD hooks (scattered)
├── repositories/               ← OLD pattern (legacy)
└── queries/                    ← NEW files (incomplete)

PROBLEM: 5 folders doing the same thing! 😵
```

### AFTER (Clean Structure):
```
src/
├── api/                        ← SINGLE SOURCE OF TRUTH
│   ├── client.ts              ← HTTP client
│   ├── types.ts               ← Centralized types
│   └── endpoints/
│       ├── speakers.ts
│       ├── collections.ts
│       ├── lectures.ts
│       ├── favorites.ts
│       ├── playback.ts
│       └── streaming.ts
│
└── queries/                    ← TANSTACK QUERY LAYER
    ├── client.ts              ← Query config
    ├── keys.ts                ← Query keys
    └── hooks/
        ├── speakers.ts
        ├── collections.ts
        ├── lectures.ts
        ├── favorites.ts
        └── playback.ts

SOLUTION: 2 folders, clear separation! ✨
```

---

## 🎯 Step-by-Step Workflow

### Phase 1: Foundation (Day 1)

**Time Estimate: 1 hour**

```bash
# Step 1.1: Create folders
mkdir -p src/api/endpoints
mkdir -p src/queries/hooks

# Step 1.2: Move APIClient
mv src/services/api/core/APIClient.ts src/api/client.ts

# Step 1.3: Create types file
touch src/api/types.ts

# Step 1.4: Create query config
touch src/queries/client.ts
touch src/queries/keys.ts
```

**Files Created:**
- ✅ `src/api/client.ts`
- ✅ `src/api/types.ts`
- ✅ `src/queries/client.ts`
- ✅ `src/queries/keys.ts`

**What You'll Have:**
- Clean folder structure
- Centralized HTTP client
- TanStack Query configuration ready

---

### Phase 2: Migrate Speakers (Day 1-2)

**Time Estimate: 2 hours**

**2.1: Create Speaker Endpoint**
```typescript
// File: src/api/endpoints/speakers.ts
import { apiClient } from '../client';

export const speakerEndpoints = {
  getAll: () => apiClient.get('/api/v1/speakers'),
  getById: (id: string) => apiClient.get(`/api/v1/speakers/${id}`),
  // ... other methods
};
```

**2.2: Create Speaker Hooks**
```typescript
// File: src/queries/hooks/speakers.ts
import { useQuery } from '@tanstack/react-query';
import { speakerEndpoints } from '@/api/endpoints/speakers';
import { queryKeys } from '@/queries/keys';

export function useSpeakers() {
  return useQuery({
    queryKey: queryKeys.speakers.list(),
    queryFn: speakerEndpoints.getAll,
  });
}

export function useSpeaker(id: string) {
  return useQuery({
    queryKey: queryKeys.speakers.detail(id),
    queryFn: () => speakerEndpoints.getById(id),
    enabled: !!id,
  });
}
```

**2.3: Update Components**
```typescript
// Before:
import { useGetSpeakers } from '@/hooks/api/useGetSpeakers';

// After:
import { useSpeakers } from '@/queries/hooks/speakers';
```

**2.4: Test**
- Open browse page → Should show speakers
- Click speaker → Should open detail page
- Go back → Should be instant (cached)

**2.5: Delete Old Files**
```bash
rm src/services/api/endpoints/speakerEndpoints.ts
rm src/hooks/api/useGetSpeakers.ts
rm src/repositories/SpeakerRepository.ts
```

---

### Phase 3: Migrate Collections (Day 2)

**Time Estimate: 2 hours**

Same process as speakers:
1. Create `src/api/endpoints/collections.ts`
2. Create `src/queries/hooks/collections.ts`
3. Update collection screens
4. Test functionality
5. Delete old files

---

### Phase 4: Migrate Lectures (Day 2-3)

**Time Estimate: 2 hours**

Same process as speakers and collections.

---

### Phase 5: Migrate User Features (Day 3)

**Time Estimate: 3 hours**

Migrate:
- Favorites
- Playback position
- Streaming

---

### Phase 6: Cleanup (Day 3)

**Time Estimate: 1 hour**

```bash
# Delete old folders
rm -rf src/services/api/
rm -rf src/hooks/api/
rm -rf src/repositories/

# Delete temporary files
rm -rf src/api/endpoints/*.api.ts
rm -rf src/queries/hooks/speakers/
rm -rf src/queries/hooks/collections/
```

**Final verification:**
```bash
# Should only have these API-related folders:
ls src/api/
# Output: client.ts  types.ts  endpoints/

ls src/queries/
# Output: client.ts  keys.ts  hooks/
```

---

## 📈 Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| API folders | 5 | 2 | **60% reduction** |
| Duplicate code | High | Zero | **100% DRY** |
| Import confusion | High | None | **Clear paths** |
| Maintainability | Low | High | **Easy updates** |
| Performance | Manual cache | Auto cache | **TanStack Query** |
| Bundle size | ~45KB | ~38KB | **15% smaller** |

---

## 🛡️ Safety Measures

### 1. Incremental Migration
- One entity at a time
- Test after each step
- Rollback if needed

### 2. Keep App Running
- No breaking changes
- Old code works until migrated
- Can pause and resume anytime

### 3. Git Commits
```bash
# After each phase:
git add .
git commit -m "Migrate speakers to new architecture"
```

### 4. Testing Checklist
After each entity:
- [ ] Browse page works
- [ ] Detail page works
- [ ] Caching works (back/forward instant)
- [ ] Error handling works
- [ ] Loading states work

---

## 🚀 Ready to Start?

### Quick Start Command:

```bash
# I'll create everything for you step by step
# Just say: "Let's start with Phase 1"
```

### What I'll Do:
1. ✅ Create clean folder structure
2. ✅ Move/create all necessary files
3. ✅ Provide code for each file
4. ✅ Update components one by one
5. ✅ Help you test each step
6. ✅ Delete old files when safe

### Time Commitment:
- **Total: ~3 days** (working a few hours per day)
- **Per phase: 1-3 hours**
- **Can pause anytime!**

---

## 📝 Next Action

Reply with one of:
1. **"Let's start"** - Begin Phase 1 immediately
2. **"Show me Phase 1 first"** - I'll create Phase 1 files for review
3. **"I have questions"** - Ask anything before we start

I'll guide you through every single step! 🎯
