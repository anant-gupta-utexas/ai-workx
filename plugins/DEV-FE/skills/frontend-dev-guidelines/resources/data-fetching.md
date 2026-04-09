# **Data Fetching Patterns**

Modern data fetching using TanStack Query with Suspense boundaries, cache-first strategies, SSR-ready patterns, and centralized API services.

---

## **useSuspenseQuery (Primary Pattern)**

**Why:** No `isLoading` checks, integrates with Suspense, cleaner code, consistent UX

### **Basic Pattern**

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { myFeatureApi } from '../api/myFeatureApi';

export const MyComponent: React.FC<Props> = ({ id }) => {
// No isLoading - Suspense handles it!const { data } = useSuspenseQuery({
        queryKey: ['myEntity', id],
        queryFn: () => myFeatureApi.getEntity(id),
    });

// data is ALWAYS defined here (not undefined | Data)return <div>{data.name}</div>;
};

// Wrap in Suspense boundary<SuspenseLoader>
    <MyComponent id={123} />
</SuspenseLoader>
```

**useSuspenseQuery vs useQuery:** Use Suspense version for new components (data always defined, no isLoading). Use regular useQuery only for legacy code.

---

## **Cache-First Strategy**

**Pattern:** Check cache first to avoid redundant API calls

```tsx
export function useSuspensePost(postId: number) {
    const queryClient = useQueryClient();

    return useSuspenseQuery({
        queryKey: ['post', postId],
        queryFn: async () => {
// Check list cache firstconst cached = queryClient.getQueryData<{ posts: Post[] }>(['posts'])
                ?.posts.find(p => p.id === postId);

            if (cached) return cached;// Return from cachereturn postApi.getPost(postId);// Fetch from API
        },
        staleTime: 5 * 60 * 1000,// Fresh for 5mingcTime: 10 * 60 * 1000,// Cache for 10min
    });
}

```

---

## **Parallel Fetching**

```tsx
const [query1, query2] = useSuspenseQueries({
    queries: [
        { queryKey: ['data1'], queryFn: () => api.get1() },
        { queryKey: ['data2'], queryFn: () => api.get2() },
    ],
});

```

**Benefits:** All queries parallel, single Suspense boundary

---

## **Query Keys**

**Convention:** `['entity', id, 'detail']` - Start with entity (plural for lists), include IDs, add specifics

```tsx
['posts', blogId]// List
['post', blogId, postId]// Single
['post', postId, 'comments']// Related// Invalidation
queryClient.invalidateQueries({ queryKey: ['posts'] });// All posts
```

---

## **API Service Layer**

**Location:** `features/{feature}/api/{feature}Api.ts`

```tsx
import apiClient from '@/lib/apiClient';
import type { Entity } from '../types';

export const myFeatureApi = {
    get: async (id: number): Promise<Entity> => {
        const { data } = await apiClient.get(`/entities/${id}`);
        return data;
    },

    create: async (payload: CreatePayload): Promise<Entity> => {
        const { data } = await apiClient.post('/entities', payload);
        return data;
    },

// update, delete, etc.
};

```

**Pattern:** Export object with typed methods using `apiClient` (axios instance)

---

**Route Format:** Use direct service paths: `/service/route` NOT `/api/service/route`

---

## **Mutations**

### **Basic Mutation Pattern**

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { myFeatureApi } from '../api/myFeatureApi';
import { toast } from 'sonner';

export const MyComponent: React.FC = () => {
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: (payload: UpdatePayload) =>
            myFeatureApi.updateEntity(blogId, entityId, payload),

        onSuccess: () => {
// Invalidate and refetch
            queryClient.invalidateQueries({
                queryKey: ['entity', blogId, entityId]
            });
            showSuccess('Entity updated successfully');
        },

        onError: (error) => {
            showError('Failed to update entity');
            console.error('Update error:', error);
        },
    });

    const handleUpdate = () => {
        updateMutation.mutate({ name: 'New Name' });
    };

    return (
        <Button
            onClick={handleUpdate}
            disabled={updateMutation.isPending}
        >
            {updateMutation.isPending ? 'Updating...' : 'Update'}
        </Button>
    );
};

```

### **Optimistic Updates**

```tsx
const updateMutation = useMutation({
    mutationFn: (payload) => myFeatureApi.update(id, payload),

// Optimistic updateonMutate: async (newData) => {
// Cancel outgoing refetchesawait queryClient.cancelQueries({ queryKey: ['entity', id] });

// Snapshot current valueconst previousData = queryClient.getQueryData(['entity', id]);

// Optimistically update
        queryClient.setQueryData(['entity', id], (old) => ({
            ...old,
            ...newData,
        }));

// Return rollback functionreturn { previousData };
    },

// Rollback on erroronError: (err, newData, context) => {
        queryClient.setQueryData(['entity', id], context.previousData);
        showError('Update failed');
    },

// Refetch after success or erroronSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['entity', id] });
    },
});

```

---

## **Designing for SSR (Future-Ready)**

### **SSR-Ready Pattern (Option A → Option C)**

**Current Approach (Option A): Client-Side Only**

```tsx
export const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
    const { data: user } = useSuspenseQuery({
        queryKey: ['user', userId],
        queryFn: () => userApi.getUser(userId),
    });

    return <UserDisplay user={user} />;
};

```

**Future-Ready with initialData (Option C):**

```tsx
interface UserProfileProps {
    userId: string;
    initialData?: User;// Optional initial data from server
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, initialData }) => {
    const { data: user } = useSuspenseQuery({
        queryKey: ['user', userId],
        queryFn: () => userApi.getUser(userId),
        initialData,// Hydrate from server when available
    });

    return <UserDisplay user={user} />;
};

// In route file (future):/*
export const Route = createFileRoute('/users/$userId')({
    loader: async ({ params }) => ({
        user: await userApi.getUser(params.userId),
    }),
    component: UserPage,
});

function UserPage() {
    const { userId } = Route.useParams();
    const { user } = Route.useLoaderData();

    return <UserProfile userId={userId} initialData={user} />;
}
*/
```

**Benefits:**

- Works now with client-side fetching
- Ready for SSR when needed
- No component rewrite required
- Smooth migration path

---

## **Advanced Patterns**

### **Prefetching**

```tsx
// Prefetch on hover
<Link onMouseEnter={() => queryClient.prefetchQuery({
    queryKey: ['entity', id],
    queryFn: () => api.get(id),
})}>
    View
</Link>

```

### **Dependent Queries**

With useSuspenseQuery, dependent queries work automatically (second waits for first).

---

## **Error Handling in Queries**

### **onError Callback**

```tsx
import { toast } from 'sonner';

const { showError } = useMuiSnackbar();

const { data } = useSuspenseQuery({
    queryKey: ['entity', id],
    queryFn: () => myFeatureApi.getEntity(id),

// Handle errorsonError: (error) => {
        showError('Failed to load entity');
        console.error('Load error:', error);
    },
});

```

### **Error Boundaries**

Combine with Error Boundaries for comprehensive error handling:

```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary
    fallback={<ErrorDisplay />}
    onError={(error) => console.error(error)}
>
    <SuspenseLoader>
        <ComponentWithSuspenseQuery />
    </SuspenseLoader>
</ErrorBoundary>
```

## **Query Configuration**

**Defaults:** `staleTime: 5min`, `gcTime: 10min`, `refetchOnWindowFocus: false`

**Override per query:**

```tsx
staleTime: 30 * 1000,// Frequently changing (30s)staleTime: 30 * 60 * 1000,// Rarely changing (30min)
```

---

## **Summary**

**Data Fetching:** API service + useSuspenseQuery + cache-first + mutations + invalidateQueries + Sonner toasts

**See Also:** `./complete-examples.md`