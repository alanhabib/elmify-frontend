# ✅ Collections Migration - Complete

## Summary

Successfully migrated Collections from legacy data adapters to the new clean architecture using TanStack Query v5 and centralized API endpoints.

## Files Created

### 1. API Endpoints
**File:** `src/api/endpoints/collections.ts`

Provides pure functions for all collection-related API calls:
- `collectionAPI.getAll(params)` - Get paginated collections
- `collectionAPI.getById(id)` - Get single collection
- `collectionAPI.getBySpeaker(speakerId, params)` - Get collections by speaker
- `collectionAPI.search(query, params)` - Search collections
- `collectionAPI.getFeatured()` - Get featured collections

### 2. React Query Hooks
**File:** `src/queries/hooks/collections.ts`

TanStack Query hooks following the same pattern as speakers:
- `useCollections()` - List all collections (30min cache)
- `useCollection(id)` - Single collection detail (with cache optimization)
- `useCollectionsBySpeaker(speakerId)` - Collections for a speaker
- `useFeaturedCollections()` - Featured collections
- `useSearchCollections(query)` - Search collections
- `usePrefetchCollection()` - Prefetch utility

## Files Modified

### 1. Query Keys
**File:** `src/queries/keys.ts`

Updated `bySpeaker` to accept optional pagination params:
```typescript
bySpeaker: (speakerId: string, params?: PaginationParams) =>
  [...queryKeys.collections.lists(), 'speaker', speakerId, params || {}] as const,
```

### 2. Cache Invalidation
**File:** `src/queries/client.ts`

Added collection invalidation helpers:
- `invalidateCollections()` - Invalidate all collections
- `invalidateCollection(id)` - Invalidate specific collection
- `invalidateCollectionsBySpeaker(speakerId)` - Invalidate speaker's collections

## Architecture

### Cache Strategy
Following Apple Podcasts patterns:
```typescript
{
  staleTime: 30 * 60 * 1000,  // 30 minutes
  gcTime: 60 * 60 * 1000,      // 1 hour
  refetchOnMount: false,        // Respect staleTime
  refetchOnReconnect: true,     // Refetch when back online
  refetchOnWindowFocus: false,  // Disabled for React Native
}
```

### Query Key Hierarchy
```
['collections']                                    // All collections
['collections', 'list']                           // All lists
['collections', 'list', { params }]               // Paginated list
['collections', 'list', 'speaker', '123']         // By speaker
['collections', 'list', 'speaker', '123', params] // By speaker + params
['collections', 'detail']                         // All details
['collections', 'detail', '456']                  // Specific detail
```

## Usage Examples

### Basic Usage
```typescript
function CollectionsScreen() {
  const { data: collections, isLoading, error } = useCollections();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return <CollectionList collections={collections} />;
}
```

### Speaker's Collections
```typescript
function SpeakerDetailScreen({ speakerId }) {
  const { data: collections } = useCollectionsBySpeaker(speakerId);

  return <CollectionsList collections={collections} />;
}
```

### Search
```typescript
function SearchScreen() {
  const [query, setQuery] = useState('');
  const { data: results } = useSearchCollections(query, {
    enabled: query.length >= 3,
  });

  return <SearchResults results={results} />;
}
```

### Prefetching
```typescript
function CollectionCard({ collection }) {
  const prefetch = usePrefetchCollection();

  return (
    <Pressable
      onPressIn={() => prefetch(collection.id)} // Prefetch on touch
      onPress={() => navigate(`/collection/${collection.id}`)}
    >
      <Text>{collection.title}</Text>
    </Pressable>
  );
}
```

## Benefits

✅ **Consistent API** - Same pattern as speakers
✅ **Type Safety** - Full TypeScript support
✅ **Automatic Caching** - 30 min staleTime, 1 hour GC
✅ **Smart Refetching** - Only when needed
✅ **Deduplication** - Multiple components, single request
✅ **Cache Optimization** - Checks list cache before fetching detail
✅ **Error Handling** - Proper error states throughout
✅ **Offline First** - Works with React Query's offline support

## Next Steps

- [ ] Update Speaker detail screen to use `useCollectionsBySpeaker()`
- [ ] Test collections functionality
- [ ] Migrate Lectures (Phase 4)
- [ ] Remove old collection data adapters

## Performance

**Before Migration:**
- Multiple API calls for same data
- No caching
- Manual state management
- Inconsistent error handling

**After Migration:**
- Single API call, cached for 30 minutes
- Automatic background refresh
- Consistent state management
- Standardized error handling
- Reference stability (no unnecessary re-renders)

---

**Date:** 2025-10-05
**Phase:** 3 of 5
**Status:** ✅ COMPLETE
