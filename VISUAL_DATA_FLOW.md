# 🎨 Visual Data Flow Diagrams

## 📱 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━┓
┃   BROWSE PAGE      ┃
┃   📱 Homepage      ┃
┗━━━━━━━━━━━━━━━━━━━━┛
         │
         │ useQuery(['speakers', 'list'])
         │ GET /api/v1/speakers?limit=20
         │ 📦 5KB, 250ms
         │
         ↓
┏━━━━━━━━━━━━━━━━━━━━┓
┃  Speaker Grid      ┃
┃  👤 👤 👤 👤       ┃
┃  👤 👤 👤 👤       ┃
┗━━━━━━━━━━━━━━━━━━━━┛
         │
         │ User clicks "Jordan Peterson"
         │ (Prefetch triggered on touch)
         │
         ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   SPEAKER DETAIL PAGE                                       ┃
┃   useSpeakerWithCollections('123')                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         ├─────────────────────┬─────────────────────┐
         │                     │                     │
         ↓                     ↓                     ↓
┏━━━━━━━━━━━━━━━┓   ┏━━━━━━━━━━━━━━━┓   ┏━━━━━━━━━━━━━━━┓
┃ GET /speakers ┃   ┃GET /collections┃   ┃ Cache Check   ┃
┃     /123      ┃   ┃?speakerId=123 ┃   ┃ (Prefetched!) ┃
┃               ┃   ┃               ┃   ┃      ✅       ┃
┃ 📦 2KB        ┃   ┃ 📦 5KB        ┃   ┃               ┃
┃ ⏱️ 180ms      ┃   ┃ ⏱️ 200ms      ┃   ┃ ⏱️ <1ms       ┃
┗━━━━━━━━━━━━━━━┛   ┗━━━━━━━━━━━━━━━┛   ┗━━━━━━━━━━━━━━━┛
         │                     │                     │
         └─────────────────────┴─────────────────────┘
                              │
                              ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   SPEAKER PAGE RENDERED                                     ┃
┃                                                             ┃
┃   📸 Jordan Peterson                                        ┃
┃   📊 15 Collections                                         ┃
┃                                                             ┃
┃   ┌────────────────┐  ┌────────────────┐                  ┃
┃   │ Maps of Meaning│  │ 12 Rules       │  ← Scroll →      ┃
┃   │ 20 lectures    │  │ 15 lectures    │                  ┃
┃   └────────────────┘  └────────────────┘                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         │ User clicks "Maps of Meaning"
         │
         ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   COLLECTION DETAIL PAGE                                    ┃
┃   useCollectionWithLectures('456')                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         ├─────────────────────┬─────────────────────┐
         │                     │                     │
         ↓                     ↓                     ↓
┏━━━━━━━━━━━━━━━┓   ┏━━━━━━━━━━━━━━━┓   ┏━━━━━━━━━━━━━━━┓
┃GET /collections┃   ┃GET /collections┃   ┃               ┃
┃     /456      ┃   ┃/456/lectures  ┃   ┃               ┃
┃               ┃   ┃               ┃   ┃               ┃
┃ 📦 1KB        ┃   ┃ 📦 10KB       ┃   ┃               ┃
┃ ⏱️ 150ms      ┃   ┃ ⏱️ 200ms      ┃   ┃               ┃
┗━━━━━━━━━━━━━━━┛   ┗━━━━━━━━━━━━━━━┛   ┗━━━━━━━━━━━━━━━┛
         │                     │
         └─────────────────────┘
                    │
                    ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   COLLECTION PAGE RENDERED                                  ┃
┃                                                             ┃
┃   📚 Maps of Meaning                                        ┃
┃   👤 Jordan Peterson                                        ┃
┃   📊 20 lectures                                            ┃
┃                                                             ┃
┃   🎧 Lecture 1: Introduction                                ┃
┃   🎧 Lecture 2: Mythology                                   ┃
┃   🎧 Lecture 3: ...                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🔄 Cache Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CACHE LIFECYCLE                                  │
└─────────────────────────────────────────────────────────────────────────┘

FIRST VISIT (Cache Empty)
═══════════════════════════

Component: useSpeaker('123')
    ↓
┌───────────────┐
│ Check Cache   │ → MISS ❌
└───────────────┘
    ↓
┌───────────────┐
│ Fetch from API│ → GET /api/v1/speakers/123
└───────────────┘
    ↓
┌───────────────────────────────────────────┐
│ Store in Cache                            │
│ Key: ['speakers', 'detail', '123']        │
│ Data: { id: 123, name: "Jordan Peterson" }│
│ Stale Time: 30 min                        │
│ GC Time: 1 hour                           │
└───────────────────────────────────────────┘
    ↓
Return data to component


SECOND VISIT (Within 30 min)
════════════════════════════

Component: useSpeaker('123')
    ↓
┌───────────────┐
│ Check Cache   │ → HIT ✅ (still fresh)
└───────────────┘
    ↓
Return cached data INSTANTLY (no network request!)


THIRD VISIT (After 30 min, before 1 hour)
══════════════════════════════════════════

Component: useSpeaker('123')
    ↓
┌───────────────┐
│ Check Cache   │ → HIT ✅ (but stale)
└───────────────┘
    ↓
Return cached data immediately (fast UX)
    +
┌───────────────┐
│ Refetch in BG │ → GET /api/v1/speakers/123
└───────────────┘
    ↓
Update cache with fresh data
    ↓
Component re-renders with new data


FOURTH VISIT (After 1 hour)
════════════════════════════

Component: useSpeaker('123')
    ↓
┌───────────────┐
│ Check Cache   │ → MISS ❌ (garbage collected)
└───────────────┘
    ↓
Fetch from API again (same as first visit)
```

---

## 🎯 Query Key Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      QUERY KEY STRUCTURE                                 │
└─────────────────────────────────────────────────────────────────────────┘

['speakers']  ← Root (invalidate ALL speaker data)
    │
    ├── ['speakers', 'list']  ← All lists
    │       │
    │       ├── ['speakers', 'list', { filters: {} }]  ← Default list
    │       ├── ['speakers', 'list', { filters: { page: 2 } }]  ← Page 2
    │       └── ['speakers', 'list', { filters: { featured: true } }]
    │
    └── ['speakers', 'detail']  ← All details
            │
            ├── ['speakers', 'detail', '123']  ← Jordan Peterson
            ├── ['speakers', 'detail', '456']  ← Sam Harris
            └── ['speakers', 'detail', '789']  ← Joe Rogan

['collections']
    │
    ├── ['collections', 'list']
    │       │
    │       ├── ['collections', 'list', 'speaker', '123']  ← Jordan's collections
    │       └── ['collections', 'list', 'speaker', '456']  ← Sam's collections
    │
    └── ['collections', 'detail']
            │
            ├── ['collections', 'detail', '1']  ← Maps of Meaning
            └── ['collections', 'detail', '2']  ← 12 Rules

['lectures']
    │
    ├── ['lectures', 'list']
    │       │
    │       ├── ['lectures', 'list', 'collection', '1']  ← Maps of Meaning lectures
    │       └── ['lectures', 'list', 'collection', '2']  ← 12 Rules lectures
    │
    └── ['lectures', 'detail']
            │
            ├── ['lectures', 'detail', '100']  ← Lecture 1
            └── ['lectures', 'detail', '101']  ← Lecture 2


INVALIDATION EXAMPLES:
═════════════════════

// Invalidate all speaker data
queryClient.invalidateQueries({ queryKey: ['speakers'] });
    → Refetches: ALL speaker lists + ALL speaker details

// Invalidate just speaker details
queryClient.invalidateQueries({ queryKey: ['speakers', 'detail'] });
    → Refetches: Only speaker details, not lists

// Invalidate specific speaker
queryClient.invalidateQueries({ queryKey: ['speakers', 'detail', '123'] });
    → Refetches: Only Jordan Peterson

// Invalidate collections for specific speaker
queryClient.invalidateQueries({
  queryKey: ['collections', 'list', 'speaker', '123']
});
    → Refetches: Only Jordan's collections
```

---

## 🚀 Parallel vs Sequential Requests

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    REQUEST PATTERNS COMPARISON                           │
└─────────────────────────────────────────────────────────────────────────┘

❌ BAD: Sequential (Your Old Code)
═══════════════════════════════════

t=0ms     │ GET /speakers/123
          │
t=200ms   ▼ Response
          │ GET /collections?speakerId=123
          │
t=400ms   ▼ Response
          │ Loop through 15 collections...
          │ GET /collections/1/lectures
          │
t=600ms   ▼ Response
          │ GET /collections/2/lectures
          │
t=800ms   ▼ Response
          │ ... (13 more requests)
          │
t=3000ms  ▼ All Done

TOTAL: 3000ms (3 seconds!) 🐌


✅ GOOD: Parallel (New Approach)
════════════════════════════════

t=0ms     │ GET /speakers/123
          │ GET /collections?speakerId=123
          │
t=220ms   ▼ Both responses arrive
          │
          │ Collections rendered
          │ (No lecture requests yet - lazy loaded!)

TOTAL: 220ms ⚡

User expands collection:
t=250ms   │ GET /collections/1/lectures
          │
t=450ms   ▼ Response
          │ Lectures shown

TOTAL for user interaction: 200ms ⚡


🚀 BEST: Parallel + Prefetch
════════════════════════════

t=-200ms  │ User touches speaker card
          │ PREFETCH: GET /collections?speakerId=123
          │
t=0ms     │ User releases, navigation starts
          │ GET /speakers/123
          │
t=150ms   ▼ Speaker response
          ▼ Collections already in cache! ✅
          │
          │ Page fully rendered

TOTAL: 150ms 🚀🚀🚀
PERCEIVED: <50ms (collections instant)
```

---

## 🎨 Component Hierarchy & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    COMPONENT TREE & DATA FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

<App>
  │
  ├─ <QueryClientProvider>  ← TanStack Query
  │    │
  │    └─ Global Cache Store
  │         ├─ ['speakers', ...] → { ... }
  │         ├─ ['collections', ...] → { ... }
  │         └─ ['lectures', ...] → { ... }
  │
  └─ <BrowsePage>
       │
       │ const { data: speakers } = useQuery(['speakers', 'list'])
       │                                           ↓
       │                                    ┌─────────────┐
       │                                    │ Cache Store │
       │                                    └─────────────┘
       │
       └─ <SpeakerGrid>
            │
            └─ speakers.map(speaker =>
                 <SpeakerCard
                   onPress={() => navigate('/speaker/123')}
                   onPressIn={() => prefetch()} />  ← Prefetch!
               )

                                  ↓ Navigate

       <SpeakerModal>
         │
         │ const { speaker, collections } = useSpeakerWithCollections('123')
         │                                           ↓
         │                                    ┌─────────────┐
         │                                    │ Cache Store │ ← Check cache first
         │                                    └─────────────┘
         │                                           ↓
         │                                    If MISS, fetch from API
         │
         ├─ <SpeakerHeader speaker={speaker} />
         │
         └─ <CollectionsList>
              │
              └─ collections.map(collection =>
                   <CollectionCard
                     onPress={() => navigate('/collection/456')}
                     onPressIn={() => prefetch()} />  ← Prefetch!
                 )

                                  ↓ Navigate

       <CollectionModal>
         │
         │ const { collection, lectures } = useCollectionWithLectures('456')
         │                                           ↓
         │                                    ┌─────────────┐
         │                                    │ Cache Store │
         │                                    └─────────────┘
         │
         ├─ <CollectionHeader collection={collection} />
         │
         └─ <LectureList lectures={lectures} />
```

---

## 📊 Data Flow Summary

```
USER ACTION          →  HOOK CALL                    →  CACHE CHECK  →  API CALL       →  CACHE UPDATE
═══════════════════════════════════════════════════════════════════════════════════════════════════════

Browse page load     →  useQuery(['speakers'])      →  MISS         →  GET /speakers  →  Cache 30min
Click speaker        →  useSpeakerWith...('123')    →  MISS         →  GET /speaker   →  Cache 30min
(prefetch happened)     + collections query         →  HIT! ✅      →  (none)         →  (none)
Click collection     →  useCollectionWith...('456') →  MISS         →  GET /...       →  Cache 15min
Back to speaker      →  useSpeakerWith...('123')    →  HIT! ✅      →  (none)         →  (none)
Add lecture          →  mutation.mutate()           →  INVALIDATE   →  POST + refetch →  Cache updated
```

---

## 🎓 Key Principles

1. **Fetch on demand** - Don't load data until needed
2. **Cache aggressively** - Minimize network requests
3. **Prefetch on intent** - Start loading before navigation
4. **Invalidate precisely** - Only refetch what changed
5. **Compose smartly** - Bundle related data in hooks

This is **exactly** how Spotify, Apple Podcasts, and YouTube work! 🎉
