# **Loading & Error States**

**CRITICAL**: Proper loading and error state handling prevents layout shift and provides better user experience with Sonner toasts and shadcn/ui components.

---

## **⚠️ CRITICAL: No Early Returns**

**Problem:** Early returns cause layout shift (CLS), jarring UX, lost scroll position

```tsx
// ❌ NEVERif (isLoading) return <Spinner />;

// ✅ ALWAYS<SuspenseLoader><Content /></SuspenseLoader>
```

### **Solutions**

**Option 1: SuspenseLoader (PREFERRED for new components)**

```tsx
import { SuspenseLoader } from '~components/SuspenseLoader';

const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

export const MyComponent: React.FC = () => {
    return (
        <SuspenseLoader>
            <HeavyComponent />
        </SuspenseLoader>
    );
};

```

**Option 2: LoadingOverlay (for legacy useQuery patterns)**

```tsx
import { LoadingOverlay } from '~components/LoadingOverlay';

export const MyComponent: React.FC = () => {
    const { data, isLoading } = useQuery({ ... });

    return (
        <LoadingOverlay loading={isLoading}>
            <Content data={data} />
        </LoadingOverlay>
    );
};

```

---

## **SuspenseLoader Component**

### **What It Does**

- Shows loading indicator while lazy components load
- Smooth fade-in animation
- Prevents layout shift
- Consistent loading experience across app

### **Import**

```tsx
import { SuspenseLoader } from '~components/SuspenseLoader';
// Orimport { SuspenseLoader } from '@/components/SuspenseLoader';

```

### **Basic Usage**

```tsx
<SuspenseLoader>
    <LazyLoadedComponent />
</SuspenseLoader>

```

### **With useSuspenseQuery**

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { SuspenseLoader } from '~components/SuspenseLoader';

const Inner: React.FC = () => {
// No isLoading needed!const { data } = useSuspenseQuery({
        queryKey: ['data'],
        queryFn: () => api.getData(),
    });

    return <Display data={data} />;
};

// Outer component wraps in Suspenseexport const Outer: React.FC = () => {
    return (
        <SuspenseLoader>
            <Inner />
        </SuspenseLoader>
    );
};

```

### **Multiple Suspense Boundaries**

**Pattern**: Separate loading for independent sections

```tsx
export const Dashboard: React.FC = () => {
    return (
        <Box>
            <SuspenseLoader>
                <Header />
            </SuspenseLoader>

            <SuspenseLoader>
                <MainContent />
            </SuspenseLoader>

            <SuspenseLoader>
                <Sidebar />
            </SuspenseLoader>
        </Box>
    );
};

```

**Benefits:**

- Each section loads independently
- User sees partial content sooner
- Better perceived performance

### **Nested Suspense**

```tsx
export const ParentComponent: React.FC = () => {
    return (
        <SuspenseLoader>
            {/* Parent suspends while loading */}
            <ParentContent>
                <SuspenseLoader>
                    {/* Nested suspense for child */}
                    <ChildComponent />
                </SuspenseLoader>
            </ParentContent>
        </SuspenseLoader>
    );
};

```

---

## **LoadingOverlay Component**

### **When to Use**

- Legacy components with `useQuery` (not refactored to Suspense yet)
- Overlay loading state needed
- Can't use Suspense boundaries

### **Usage**

```tsx
import { LoadingOverlay } from '~components/LoadingOverlay';

export const MyComponent: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['data'],
        queryFn: () => api.getData(),
    });

    return (
        <LoadingOverlay loading={isLoading}>
            <Box sx={{ p: 2 }}>
                {data && <Content data={data} />}
            </Box>
        </LoadingOverlay>
    );
};

```

**What it does:**

- Shows semi-transparent overlay with spinner
- Content area reserved (no layout shift)
- Prevents interaction while loading

---

## **Error Handling**

### **useMuiSnackbar Hook (REQUIRED)**

**NEVER use react-toastify** - Project standard is MUI Snackbar

```tsx
import { useMuiSnackbar } from '@/hooks/useMuiSnackbar';

export const MyComponent: React.FC = () => {
    const { showSuccess, showError, showInfo, showWarning } = useMuiSnackbar();

    const handleAction = async () => {
        try {
            await api.doSomething();
            showSuccess('Operation completed successfully');
        } catch (error) {
            showError('Operation failed');
        }
    };

    return <Button onClick={handleAction}>Do Action</Button>;
};

```

**Available Methods:**

- `showSuccess(message)` - Green success message
- `showError(message)` - Red error message
- `showWarning(message)` - Orange warning message
- `showInfo(message)` - Blue info message

### **TanStack Query Error Callbacks**

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const MyComponent: React.FC = () => {
    const { data } = useSuspenseQuery({
        queryKey: ['data'],
        queryFn: () => api.getData(),

// Handle errorsonError: (error) => {
            toast.error('Failed to load data');
            console.error('Query error:', error);
        },
    });

    return <Content data={data} />;
};

```

### **Error Boundaries**

```tsx
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div className="p-8 text-center">
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
            </Alert>
            <Button onClick={resetErrorBoundary}>Try Again</Button>
        </div>
    );
}

export const MyPage: React.FC = () => {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(error) => console.error('Boundary caught:', error)}
        >
            <SuspenseLoader>
                <ComponentThatMightError />
            </SuspenseLoader>
        </ErrorBoundary>
    );
};

```

---

## **Complete Examples**

### **Example 1: Modern Component with Suspense**

```tsx
import React from 'react';
import { Box, Paper } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { SuspenseLoader } from '~components/SuspenseLoader';
import { myFeatureApi } from '../api/myFeatureApi';

// Inner component uses useSuspenseQueryconst InnerComponent: React.FC<{ id: number }> = ({ id }) => {
    const { data } = useSuspenseQuery({
        queryKey: ['entity', id],
        queryFn: () => myFeatureApi.getEntity(id),
    });

// data is always defined - no isLoading needed!return (
        <Paper sx={{ p: 2 }}>
            <h2>{data.title}</h2>
            <p>{data.description}</p>
        </Paper>
    );
};

// Outer component provides Suspense boundaryexport const OuterComponent: React.FC<{ id: number }> = ({ id }) => {
    return (
        <Box>
            <SuspenseLoader>
                <InnerComponent id={id} />
            </SuspenseLoader>
        </Box>
    );
};

export default OuterComponent;

```

### **Example 2: Legacy Pattern with LoadingOverlay**

```tsx
import React from 'react';
import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { LoadingOverlay } from '~components/LoadingOverlay';
import { myFeatureApi } from '../api/myFeatureApi';

export const LegacyComponent: React.FC<{ id: number }> = ({ id }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['entity', id],
        queryFn: () => myFeatureApi.getEntity(id),
    });

    return (
        <LoadingOverlay loading={isLoading}>
            <Box sx={{ p: 2 }}>
                {error && <ErrorDisplay error={error} />}
                {data && <Content data={data} />}
            </Box>
        </LoadingOverlay>
    );
};

```

### **Example 3: Error Handling with Sonner**

```tsx
import React from 'react';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { myFeatureApi } from '../api/myFeatureApi';

export const EntityEditor: React.FC<{ id: number }> = ({ id }) => {
    const queryClient = useQueryClient();

    const { data } = useSuspenseQuery({
        queryKey: ['entity', id],
        queryFn: () => myFeatureApi.getEntity(id),
        onError: () => {
            toast.error('Failed to load entity');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (updates) => myFeatureApi.update(id, updates),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entity', id] });
            toast.success('Entity updated successfully');
        },

        onError: () => {
            toast.error('Failed to update entity');
        },
    });

    return (
        <Button onClick={() => updateMutation.mutate({ name: 'New' })}>
            Update
        </Button>
    );
};

```

---

## **Loading Patterns**

```tsx
// ✅ BEST - Suspense
<SuspenseLoader><Content /></SuspenseLoader>

// ✅ OK - Skeleton with same layout<div className="h-96">
    {isLoading ? <Skeleton className="h-full" /> : <Content />}
</div>
```

---

## **Skeleton Loading (Alternative)**

### **shadcn Skeleton Component**

```tsx
import { Skeleton } from '@/components/ui/skeleton';

export const MyComponent: React.FC = () => {
    const { data, isLoading } = useQuery({ ... });

    return (
        <div className="p-4">
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">{data.title}</h2>
                    <img src={data.image} alt={data.title} />
                    <p className="text-muted-foreground">{data.description}</p>
                </div>
            )}
        </div>
    );
};

```

**Key**: Skeleton must have **same layout** as actual content (no shift)

---

## **Summary**

**Loading States:**

- ✅ **PREFERRED**: SuspenseLoader + useSuspenseQuery (modern pattern)
- ✅ **ACCEPTABLE**: LoadingOverlay (legacy pattern)
- ✅ **OK**: Skeleton with same layout
- ❌ **NEVER**: Early returns or conditional layout

**Error Handling:**

- ✅ **ALWAYS**: Sonner toast for user feedback
- ✅ Use onError callbacks in queries/mutations
- ✅ Error boundaries for component-level errors
- ✅ shadcn Alert components for in-page errors

**See Also:**

- `./component-patterns.md` - Suspense integration
- `./ui-components.md` - Sonner and Alert components
- `./data-fetching.md` - useSuspenseQuery details