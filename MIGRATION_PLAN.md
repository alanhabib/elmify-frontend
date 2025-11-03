# 🎯 Frontend Refactoring Plan - Apple Podcasts Pattern

## 📊 Current State Analysis

You currently have **3 separate API locations** causing confusion:

```
client/src/
├── api/endpoints/              ← NEW (I just created)
│   ├── speakers.api.ts
│   ├── collections.api.ts
│   └── lectures.api.ts
│
├── services/api/               ← OLD (Original)
│   ├── core/
│   │   ├── APIClient.ts       ✅ KEEP (Good implementation)
│   │   ├── userFavoritesAPI.ts
│   │   ├── playbackPositionAPI.ts
│   │   ├── streamingAPI.ts
│   │   └── analyticsAPI.ts
│   └── endpoints/
│       ├── speakerEndpoints.ts
│       ├── collectionEndpoints.ts
│       └── lectureEndpoints.ts
│
├── hooks/api/                  ← OLD (React Query hooks)
│   ├── useGetSpeakers.ts
│   ├── useGetCollections.ts
│   ├── useGetLectures.ts
│   ├── useUserFavorites.ts
│   ├── usePlaybackPosition.ts
│   └── useStreaming.ts
│
├── repositories/               ← OLD (Legacy pattern)
│   ├── BaseRepository.ts
│   ├── SpeakerRepository.ts
│   ├── CollectionRepository.ts
│   └── LectureRepository.ts
│
└── queries/                    ← NEW (I just created)
    ├── config/
    ├── keys/
    └── hooks/
```

**This is messy! Let's clean it up.** 🧹

---

## 🎯 Goal: Clean, Single-Responsibility Architecture

Following Apple Podcasts pattern with TanStack Query best practices:

```
client/src/
├── api/                        ← SINGLE SOURCE OF TRUTH
│   ├── client.ts              ← HTTP client (keep your APIClient)
│   ├── endpoints/
│   │   ├── speakers.ts
│   │   ├── collections.ts
│   │   ├── lectures.ts
│   │   ├── favorites.ts
│   │   ├── playback.ts
│   │   └── streaming.ts
│   └── types.ts               ← API response types
│
├── queries/                    ← TANSTACK QUERY LAYER
│   ├── client.ts              ← Query client config
│   ├── keys.ts                ← Centralized query keys
│   └── hooks/
│       ├── speakers.ts        ← All speaker hooks
│       ├── collections.ts     ← All collection hooks
│       ├── lectures.ts        ← All lecture hooks
│       ├── favorites.ts       ← Favorites hooks
│       └── playback.ts        ← Playback hooks
│
└── [DELETE]
    ├── services/api/           ← DELETE (duplicate)
    ├── hooks/api/              ← DELETE (moving to queries/)
    └── repositories/           ← DELETE (replaced by api/)
```

---

## 📋 Migration Steps (Step-by-Step)

### Phase 1: Setup New Structure ✅

**Step 1.1: Create clean API layer**
- [x] Create `src/api/client.ts` (use existing APIClient)
- [ ] Create `src/api/types.ts` (centralize types)
- [ ] Create `src/api/endpoints/` folder

**Step 1.2: Create TanStack Query layer**
- [ ] Create `src/queries/client.ts`
- [ ] Create `src/queries/keys.ts`
- [ ] Create `src/queries/hooks/` folder

---

### Phase 2: Migrate API Endpoints (One by One)

We'll migrate **one entity at a time** to avoid breaking the app.

#### **Step 2.1: Migrate Speakers** 🎯

**2.1.1: Create new API endpoint**
```bash
File: src/api/endpoints/speakers.ts
```

**2.1.2: Create new query hooks**
```bash
File: src/queries/hooks/speakers.ts
```

**2.1.3: Update components to use new hooks**
- Update `app/(modals)/speaker/[id].tsx`
- Update `components/speakers/SpeakersSection.tsx`

**2.1.4: Delete old files**
- Delete `services/api/endpoints/speakerEndpoints.ts`
- Delete `hooks/api/useGetSpeakers.ts`
- Delete `repositories/SpeakerRepository.ts`

#### **Step 2.2: Migrate Collections** 🎯

**2.2.1: Create new API endpoint**
```bash
File: src/api/endpoints/collections.ts
```

**2.2.2: Create new query hooks**
```bash
File: src/queries/hooks/collections.ts
```

**2.2.3: Update components**
- Update `app/(modals)/collection/[id].tsx`

**2.2.4: Delete old files**
- Delete `services/api/endpoints/collectionEndpoints.ts`
- Delete `hooks/api/useGetCollections.ts`
- Delete `repositories/CollectionRepository.ts`

#### **Step 2.3: Migrate Lectures** 🎯

**2.3.1: Create new API endpoint**
```bash
File: src/api/endpoints/lectures.ts
```

**2.3.2: Create new query hooks**
```bash
File: src/queries/hooks/lectures.ts
```

**2.3.3: Update components**

**2.3.4: Delete old files**
- Delete `services/api/endpoints/lectureEndpoints.ts`
- Delete `hooks/api/useGetLectures.ts`
- Delete `repositories/LectureRepository.ts`

#### **Step 2.4: Migrate User Features** 🎯

**2.4.1: Favorites**
```bash
File: src/api/endpoints/favorites.ts
File: src/queries/hooks/favorites.ts
```

**2.4.2: Playback Position**
```bash
File: src/api/endpoints/playback.ts
File: src/queries/hooks/playback.ts
```

**2.4.3: Streaming**
```bash
File: src/api/endpoints/streaming.ts
File: src/queries/hooks/streaming.ts
```

---

### Phase 3: Cleanup & Delete Old Code

**Step 3.1: Delete old folders**
```bash
rm -rf src/services/api/
rm -rf src/hooks/api/
rm -rf src/repositories/
```

**Step 3.2: Update imports across codebase**
- Search for old imports
- Replace with new imports

**Step 3.3: Delete temporary files**
```bash
rm src/api/endpoints/*.api.ts  (the ones I created in wrong location)
```

---

### Phase 4: Testing & Validation

**Step 4.1: Test each screen**
- [ ] Browse page
- [ ] Speaker detail page
- [ ] Collection detail page
- [ ] Player functionality
- [ ] Favorites functionality

**Step 4.2: Verify caching works**
- [ ] Navigate back and forth (should be instant)
- [ ] Kill app and restart (cache should persist)

**Step 4.3: Test error scenarios**
- [ ] Network offline
- [ ] Invalid IDs
- [ ] Authentication errors

---

## 📁 Final Structure

After migration, you'll have this clean structure:

```
client/src/
├── api/
│   ├── client.ts                    ← Single HTTP client
│   ├── types.ts                     ← All API types
│   └── endpoints/
│       ├── speakers.ts              ← GET /api/v1/speakers
│       ├── collections.ts           ← GET /api/v1/collections
│       ├── lectures.ts              ← GET /api/v1/lectures
│       ├── favorites.ts             ← POST /api/v1/favorites
│       ├── playback.ts              ← PUT /api/v1/playback
│       └── streaming.ts             ← Streaming logic
│
├── queries/
│   ├── client.ts                    ← TanStack Query config
│   ├── keys.ts                      ← Query key factory
│   └── hooks/
│       ├── speakers.ts              ← useSpeakers(), useSpeaker()
│       ├── collections.ts           ← useCollections(), useCollection()
│       ├── lectures.ts              ← useLectures(), useLecture()
│       ├── favorites.ts             ← useFavorites(), useToggleFavorite()
│       └── playback.ts              ← usePlaybackPosition(), useUpdatePosition()
│
├── app/                             ← Your screens
├── components/                      ← Your components
└── providers/                       ← QueryClientProvider
```

**Total folders: 2** (api + queries)
**Everything else deleted!** 🎉

---

## 🚀 Let's Start!

I'll guide you through each step. We'll start with:

### **STEP 1: Setup Foundation**

Ready to begin? I'll:
1. Create the clean folder structure
2. Move your APIClient to the right place
3. Create centralized types
4. Set up TanStack Query config

Then we'll migrate **Speakers first** as a proof of concept.

---

## 📊 Benefits After Migration

| Before | After |
|--------|-------|
| 3 API folders | 1 API folder |
| Scattered hooks | Centralized queries |
| Manual caching | Automatic caching |
| Duplicate code | DRY principle |
| Confusing structure | Clear separation |
| Hard to maintain | Easy to maintain |

---

## ⚠️ Important Notes

1. **No Breaking Changes**: We'll migrate one entity at a time
2. **Test After Each Step**: Ensure app works before moving to next step
3. **Keep App Running**: You can still work on other features
4. **Rollback Possible**: Each step is reversible

---

## 🎯 Success Criteria

After migration, you should have:
- ✅ Single source of truth for API calls
- ✅ Centralized TanStack Query hooks
- ✅ Automatic caching and deduplication
- ✅ Clean, maintainable codebase
- ✅ Following Apple Podcasts best practices
- ✅ Zero duplicate code

---

## 📝 Next Steps

Reply "Let's start" and I'll begin with **Step 1: Setup Foundation**.

We'll create the files one by one, test each change, and move forward carefully.

Ready? 🚀
