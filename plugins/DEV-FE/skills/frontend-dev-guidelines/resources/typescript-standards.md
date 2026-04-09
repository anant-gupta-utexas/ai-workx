# **TypeScript Standards**

TypeScript best practices for type safety and maintainability in React frontend code.

---

## **Strict Mode**

**Enabled:** `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`

**Means:** No implicit any, handle null/undefined explicitly, type safety enforced

## **No `any` Type**

```tsx
// ❌ NEVERfunction handle(data: any) { }

// ✅ Specific typesfunction handle(data: MyData) { }

// ✅ Unknown (forces type checking)function handle(data: unknown) {
    if (typeof data === 'object' && data) {
// Type guard
    }
}

```

## **Explicit Return Types**

```tsx
// ✅ Functionsfunction getUser(id: number): Promise<User> { }
function calculate(items: Item[]): number { }

// ✅ Hooksfunction useMyData(id: number): { data: Data; loading: boolean } { }

// React.FC provides return type automatically
```

## **Type Imports**

```tsx
// ✅ Use 'type' keywordimport type { User } from '~types/user';

// ❌ Avoid mixed importsimport { User } from '~types/user';

```

**Benefits:** Better tree-shaking, prevents circular deps

---

## **Component Prop Interfaces**

### **Interface Pattern**

```tsx
/**
 * Props for MyComponent
 */interface MyComponentProps {
/** The user ID to display */userId: number;

/** Optional callback when action completes */
    onComplete?: () => void;

/** Display mode for the component */
    mode?: 'view' | 'edit';

/** Additional CSS classes */
    className?: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({
    userId,
    onComplete,
    mode = 'view',  // Default value
    className,
}) => {
    return <div>...</div>;
};

```

**Key Points:**

- Separate interface for props
- JSDoc comments for each prop
- Optional props use `?`
- Provide defaults in destructuring

### **Props with Children**

```tsx
interface ContainerProps {
    children: React.ReactNode;
    title: string;
}

// React.FC automatically includes children type, but be explicitexport const Container: React.FC<ContainerProps> = ({ children, title }) => {
    return (
        <div>
            <h2>{title}</h2>
            {children}
        </div>
    );
};

```

## **Utility Types**

```tsx
Partial<User>// All props optionalPick<User, 'id' | 'name'>// Select specific propsOmit<User, 'password'>// Exclude propsRequired<Config>// All props requiredRecord<string, User>// Type-safe object/map
```

---

## **Type Guards**

### **Basic Type Guards**

```tsx
function isUser(data: unknown): data is User {
    return (
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        'name' in data
    );
}

// Usageif (isUser(response)) {
    console.log(response.name);// TypeScript knows it's User
}

```

### **Discriminated Unions**

```tsx
type LoadingState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: Data }
    | { status: 'error'; error: Error };

function Component({ state }: { state: LoadingState }) {
// TypeScript narrows type based on statusif (state.status === 'success') {
        return <Display data={state.data} />;// data available here
    }

    if (state.status === 'error') {
        return <Error error={state.error} />;// error available here
    }

    return <Loading />;
}

```

---

## **Generic Types**

### **Generic Functions**

```tsx
function getById<T>(items: T[], id: number): T | undefined {
    return items.find(item => (item as any).id === id);
}

// Usage with type inferenceconst users: User[] = [...];
const user = getById(users, 123);// Type: User | undefined
```

### **Generic Components**

```tsx
interface ListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
}

export function List<T>({ items, renderItem }: ListProps<T>): React.ReactElement {
    return (
        <div>
            {items.map((item, index) => (
                <div key={index}>{renderItem(item)}</div>
            ))}
        </div>
    );
}

// Usage
<List<User>
    items={users}
    renderItem={(user) => <UserCard user={user} />}
/>

```

---

## **Type Assertions (Use Sparingly)**

### **When to Use**

```tsx
// ✅ OK - When you know more than TypeScriptconst element = document.getElementById('my-element') as HTMLInputElement;
const value = element.value;

// ✅ OK - API response that you've validatedconst response = await api.getData();
const user = response.data as User;// You know the shape
```

### **When NOT to Use**

```tsx
// ❌ AVOID - Circumventing type safetyconst data = getData() as any;// WRONG - defeats TypeScript// ❌ AVOID - Unsafe assertionconst value = unknownValue as string;// Might not actually be string
```

---

## **Null/Undefined Handling**

### **Optional Chaining**

```tsx
// ✅ CORRECTconst name = user?.profile?.name;

// Equivalent to:const name = user && user.profile && user.profile.name;

```

### **Nullish Coalescing**

```tsx
// ✅ CORRECTconst displayName = user?.name ?? 'Anonymous';

// Only uses default if null or undefined// (Different from || which triggers on '', 0, false)
```

### **Non-Null Assertion (Use Carefully)**

```tsx
// ✅ OK - When you're certain value existsconst data = queryClient.getQueryData<Data>(['data'])!;

// ⚠️ CAREFUL - Only use when you KNOW it's not null// Better to check explicitly:const data = queryClient.getQueryData<Data>(['data']);
if (data) {
// Use data
}

```

## **Summary**

**TypeScript:** Strict mode + no any + explicit returns + import type + JSDoc + utility types + type guards

**See Also:** `./component-patterns.md` | `./data-fetching.md`