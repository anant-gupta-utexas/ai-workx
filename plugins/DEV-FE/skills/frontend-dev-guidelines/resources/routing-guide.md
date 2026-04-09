# **Routing Guide**

TanStack Start and TanStack Router implementation with file-based routing, lazy loading, and SSR-ready patterns.

---

## **File-Based Routing Structure**

```
app/
  routes/
    __root.tsx                    # Root layout
    index.tsx                     # Home route (/)
    posts/
      index.tsx                   # /posts
      create/
        index.tsx                 # /posts/create
      $postId.tsx                 # /posts/:postId (dynamic)
    users/
      index.tsx                   # /users
      $userId/
        index.tsx                 # /users/:userId

```

**Pattern:** `index.tsx` = route, `$param.tsx` = dynamic, nested folders = nested routes

### **Basic Route Example**

```tsx
/**
 * Posts route component
 * Displays the main posts list
 */import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { SuspenseLoader } from '~components/SuspenseLoader';

// Lazy load the page componentconst PostsList = lazy(() =>
    import('@/features/posts/components/PostsList').then(
        (module) => ({ default: module.PostsList }),
    ),
);

export const Route = createFileRoute('/posts/')({
    component: PostsPage,
});

function PostsPage() {
    return (
        <div className="container mx-auto p-4">
            <SuspenseLoader>
                <PostsList />
            </SuspenseLoader>
        </div>
    );
}

```

### **Search Params**

```tsx
import { z } from 'zod';

const searchSchema = z.object({
    query: z.string().optional(),
    page: z.number().catch(1),
});

export const Route = createFileRoute('/search/')({
    component: SearchPage,
    validateSearch: (search) => searchSchema.parse(search),
});

function SearchPage() {
    const { query, page } = Route.useSearch();
// Use query and pagereturn <div className="p-4">Search: {query}, Page: {page}</div>;
}

```

---

## **SSR-Ready Patterns (Option A with path to Option C)**

### **Client-Side Data Fetching (Primary)**

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { SuspenseLoader } from '~components/SuspenseLoader';

const UserProfile = lazy(() =>
    import('@/features/users/components/UserProfile').then(
        (module) => ({ default: module.UserProfile })
    )
);

export const Route = createFileRoute('/users/$userId')({
    component: UserProfilePage,
// No loader - pure client-side fetching (Option A)
});

function UserProfilePage() {
    const { userId } = Route.useParams();

// Client-side data fetching with useSuspenseQueryreturn (
        <div className="container mx-auto p-4">
            <SuspenseLoader>
                <UserProfile userId={userId} />
            </SuspenseLoader>
        </div>
    );
}

```

### **SSR-Ready with Server Loader (Future - Option C)**

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { SuspenseLoader } from '~components/SuspenseLoader';
import { userApi } from '@/features/users/api/userApi';

const UserProfile = lazy(() =>
    import('@/features/users/components/UserProfile').then(
        (module) => ({ default: module.UserProfile })
    )
);

export const Route = createFileRoute('/users/$userId')({
    component: UserProfilePage,

// FUTURE: Server loader for SSR (Option C)// Uncomment when ready for SSR/*
    loader: async ({ params }) => {
        const user = await userApi.getUser(params.userId);
        return { user };
    },
    */
});

function UserProfilePage() {
    const { userId } = Route.useParams();

// When loader is enabled, get initial data:// const { user: initialUser } = Route.useLoaderData();return (
        <div className="container mx-auto p-4">
            <SuspenseLoader>
                <UserProfile
                    userId={userId}
                    // initialData={initialUser} // Pass to useSuspenseQuery
                />
            </SuspenseLoader>
        </div>
    );
}

```

**Benefits of this pattern:**

- Works now with client-side fetching (Option A)
- Easy to add server loader later (Option C)
- Component stays the same
- Just uncomment loader and pass initialData

---

## **Dynamic Routes**

### **Parameter Routes**

```tsx
// app/routes/users/$userId.tsxexport const Route = createFileRoute('/users/$userId')({
    component: UserPage,
});

function UserPage() {
    const { userId } = Route.useParams();

    return (
        <div className="p-4">
            <h1>User {userId}</h1>
            {/* Component that uses userId */}
        </div>
    );
}

```

### **Multiple Parameters**

```tsx
// app/routes/posts/$postId/comments/$commentId.tsxexport const Route = createFileRoute('/posts/$postId/comments/$commentId')({
    component: CommentPage,
});

function CommentPage() {
    const { postId, commentId } = Route.useParams();

    return (
        <div className="p-4">
            Post: {postId}, Comment: {commentId}
        </div>
    );
}

```

---

## **Navigation**

### **Programmatic Navigation**

```tsx
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export const MyComponent: React.FC = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate({ to: '/posts' });
    };

    return <Button onClick={handleClick}>View Posts</Button>;
};

```

### **With Parameters**

```tsx
const handleNavigate = () => {
    navigate({
        to: '/users/$userId',
        params: { userId: '123' },
    });
};

```

### **With Search Params**

```tsx
const handleSearch = () => {
    navigate({
        to: '/search',
        search: { query: 'test', page: 1 },
    });
};

```

### **Link Component**

```tsx
import { Link } from '@tanstack/react-router';

<Link
    to="/posts/$postId"
    params={{ postId: '123' }}
    className="text-primary hover:underline"
>
    View Post
</Link>
```

---

## **Route Layout Pattern**

### **Root Layout (__root.tsx)**

```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';

export const Route = createRootRoute({
    component: RootLayout,
});

function RootLayout() {
    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>My App</title>
            </head>
            <body>
                <div className="min-h-screen bg-background">
                    <CustomAppBar />
                    <main className="container mx-auto p-4">
                        <Outlet />  {/* Child routes render here */}
                    </main>
                    <Toaster />
                </div>
            </body>
        </html>
    );
}

```

### **Nested Layouts**

```tsx
// app/routes/dashboard/index.tsximport { createFileRoute, Outlet } from '@tanstack/react-router';
import { DashboardSidebar } from '@/components/DashboardSidebar';

export const Route = createFileRoute('/dashboard')({
    component: DashboardLayout,
});

function DashboardLayout() {
    return (
        <div className="flex gap-4">
            <DashboardSidebar />
            <div className="flex-1">
                <Outlet />  {/* Nested routes */}
            </div>
        </div>
    );
}

```

---

## **Complete Route Example**

```tsx
/**
 * User profile route
 * Path: /users/:userId
 */import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { SuspenseLoader } from '~components/SuspenseLoader';
import { Card } from '@/components/ui/card';

// Lazy load heavy componentconst UserProfile = lazy(() =>
    import('@/features/users/components/UserProfile').then(
        (module) => ({ default: module.UserProfile })
    )
);

export const Route = createFileRoute('/users/$userId')({
    component: UserPage,

// FUTURE: Optional server loader for SSR/*
    loader: async ({ params }) => ({
        user: await userApi.getUser(params.userId),
    }),
    */
});

function UserPage() {
    const { userId } = Route.useParams();

    return (
        <div className="container mx-auto p-4">
            <Card className="p-6">
                <SuspenseLoader>
                    <UserProfile userId={userId} />
                </SuspenseLoader>
            </Card>
        </div>
    );
}

```

---

## **Route Guards and Protection**

### **Protected Route Pattern**

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { authService } from '@/services/auth';

export const Route = createFileRoute('/dashboard/')({
    component: DashboardPage,

// Check authentication before renderingbeforeLoad: async () => {
        const isAuthenticated = await authService.checkAuth();
        if (!isAuthenticated) {
            throw redirect({ to: '/login' });
        }
    },
});

function DashboardPage() {
    return <div className="p-4">Protected Dashboard</div>;
}

```

---

## **Error Handling**

### **Error Component**

```tsx
import { createFileRoute, ErrorComponent } from '@tanstack/react-router';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/posts/')({
    component: PostsPage,
    errorComponent: PostsErrorComponent,
});

function PostsErrorComponent({ error }: { error: Error }) {
    return (
        <div className="container mx-auto p-4">
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error.message}
                </AlertDescription>
            </Alert>
            <Button
                onClick={() => window.location.reload()}
                className="mt-4"
            >
                Try Again
            </Button>
        </div>
    );
}

function PostsPage() {
    return <div>Posts Content</div>;
}

```

---

## **Route Metadata and SEO**

### **Adding Metadata**

```tsx
export const Route = createFileRoute('/posts/')({
    component: PostsPage,

// Metadata for SEOhead: () => ({
        meta: [
            {
                title: 'All Posts | My App',
                description: 'Browse all posts',
            },
        ],
    }),
});

```

---

## **Code Splitting Best Practices**

### **Split by Route**

```tsx
// Each route in its own chunkconst HomePage = lazy(() => import('@/features/home/HomePage'));
const PostsPage = lazy(() => import('@/features/posts/PostsPage'));
const UsersPage = lazy(() => import('@/features/users/UsersPage'));

```

### **Split Heavy Components**

```tsx
// Split heavy components within a routefunction PostsPage() {
    const DataGrid = lazy(() => import('@/components/DataGrid'));
    const Chart = lazy(() => import('@/components/Chart'));

    return (
        <div className="space-y-4">
            <SuspenseLoader>
                <DataGrid />
            </SuspenseLoader>

            <SuspenseLoader>
                <Chart />
            </SuspenseLoader>
        </div>
    );
}

```

---

## **Summary**

**Routing Checklist:** File-based routes + lazy load + Suspense + SSR-ready (loaders commented) + route guards

**See Also:** `./complete-examples.md` for full route examples