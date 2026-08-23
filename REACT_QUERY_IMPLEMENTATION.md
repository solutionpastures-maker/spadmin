# React Query Implementation - Admin Panel

## ✅ Completed

### 1. Setup
- ✅ Installed `@tanstack/react-query`
- ✅ Created `Providers` component with `QueryClientProvider`
- ✅ Wrapped app in `app/layout.tsx` with `Providers`

### 2. Custom Hooks Created

#### `lib/hooks/useSeries.ts`
- `useSeries()` - Fetch all series
- `useSeriesById(id)` - Fetch single series
- `useCreateSeries()` - Create series mutation
- `useUpdateSeries()` - Update series mutation
- `useDeleteSeries()` - Delete series mutation

#### `lib/hooks/useAnnouncements.ts`
- `useAnnouncements()` - Fetch all announcements
- `useAnnouncementById(id)` - Fetch single announcement
- `useCreateAnnouncement()` - Create announcement mutation
- `useUpdateAnnouncement()` - Update announcement mutation
- `useDeleteAnnouncement()` - Delete announcement mutation

#### `lib/hooks/useDevotionals.ts`
- `useDevotionals()` - Fetch all devotionals
- `useDevotionalById(id)` - Fetch single devotional
- `useCreateDevotional()` - Create devotional mutation
- `useUpdateDevotional()` - Update devotional mutation
- `useDeleteDevotional()` - Delete devotional mutation

#### `lib/hooks/useEpisodes.ts`
- `useEpisodes(seriesId?)` - Fetch episodes (optionally filtered)
- `useEpisodeById(id)` - Fetch single episode
- `useCreateEpisode()` - Create episode mutation
- `useUpdateEpisode()` - Update episode mutation
- `useDeleteEpisode()` - Delete episode mutation

### 3. Updated Pages
- ✅ `app/page.tsx` (Dashboard) - Uses `useSeries()`, `useAnnouncements()`, `useDevotionals()`
- ✅ `app/announcements/page.tsx` - Uses `useAnnouncements()` and `useDeleteAnnouncement()`
- ✅ `app/announcements/new/page.tsx` - Uses `useCreateAnnouncement()`
- ✅ `app/devotionals/page.tsx` - Uses `useDevotionals()` and `useDeleteDevotional()`
- ✅ `app/devotionals/new/page.tsx` - Uses `useCreateDevotional()`
- ✅ `app/series/page.tsx` - Uses `useSeries()` and `useDeleteSeries()`

## 🎯 Benefits

### Consistency with Mobile App
- Same data fetching pattern across both apps
- Shared understanding of caching behavior
- Easier maintenance

### Performance Improvements
1. **Automatic Caching**: Data cached for 5-10 minutes
2. **Background Refetching**: Data refreshes when stale
3. **Optimistic Updates**: Mutations update UI immediately
4. **Deduplication**: Multiple components share one request

### Better UX
1. **Loading States**: Built-in `isLoading` and `isPending` states
2. **Error Handling**: Automatic error retry (2 attempts)
3. **Pull to Refresh**: Easy integration with `refetch()`
4. **Optimistic UI**: Instant feedback on mutations

### Developer Experience
1. **Less Code**: No manual state management needed
2. **Type Safety**: Full TypeScript support
3. **Query Keys**: Organized, hierarchical structure
4. **Automatic Invalidation**: Cache updates after mutations

## 📊 Cache Configuration

### Default Settings (in `lib/providers.tsx`)
```typescript
{
  queries: {
    retry: 2,                    // Retry failed requests 2 times
    refetchOnWindowFocus: false, // Don't refetch on window focus by default
    staleTime: 5 * 60 * 1000,   // Data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000,      // Cache data for 10 minutes
  },
  mutations: {
    retry: 1,                    // Retry failed mutations once
  },
}
```

### Per-Query Settings
- **Announcements**: 2 min stale time (more frequent updates), `refetchOnWindowFocus: true`
- **Series/Episodes**: 5 min stale time (content changes less frequently)
- **Devotionals**: 5 min stale time

## 🔄 Migration Pattern

### Before (Manual State Management)
```typescript
const [data, setData] = useState([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await getData();
      setData(result);
    } finally {
      setIsLoading(false);
    }
  };
  loadData();
}, []);
```

### After (React Query)
```typescript
const { data = [], isLoading } = useData();
```

### Mutations Before
```typescript
const handleDelete = async (id: string) => {
  try {
    await deleteItem(id);
    // Manually refresh
    loadData();
  } catch (error) {
    // Handle error
  }
};
```

### Mutations After
```typescript
const deleteMutation = useDeleteItem();

const handleDelete = async (id: string) => {
  try {
    await deleteMutation.mutateAsync(id);
    // Cache automatically invalidated!
  } catch (error) {
    // Handle error
  }
};
```

## 🚀 Next Steps (Optional)

1. **Update remaining pages**:
   - Episode management pages
   - Series detail/edit pages
   - User management (if needed)

2. **Add React Query DevTools** for debugging:
   ```bash
   npm install @tanstack/react-query-devtools
   ```

3. **Add optimistic updates** for better UX on mutations

4. **Implement prefetching** for better perceived performance

## 📝 Notes

- All hooks follow the same pattern for consistency
- Query keys are organized hierarchically for easy invalidation
- Mutations automatically invalidate related queries
- Error handling is handled at the service layer
- Next.js App Router compatible (using 'use client' directive)

