# **Component Patterns**

Modern React component architecture for TanStack Start applications emphasizing type safety, lazy loading, and Suspense boundaries.

---

## **React.FC Pattern**

**Why:** Type safety, consistent signatures, better IDE autocomplete

### **Basic Pattern**

```tsx
import React from 'react';

interface MyComponentProps {
/** User ID to display */userId: number;
/** Optional callback when action occurs */
    onAction?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ userId, onAction }) => {
    return (
        <div className="p-4">
            User: {userId}
        </div>
    );
};

export default MyComponent;

```

---

## **Lazy Loading**

**When:** Heavy components, routes, modals, below-fold content

### **Pattern**

```tsx
import React from 'react';

// Lazy load heavy componentconst PostDataGrid = React.lazy(() =>
    import('./grids/PostDataGrid')
);

// For named exportsconst MyComponent = React.lazy(() =>
    import('./MyComponent').then(module => ({
        default: module.MyComponent
    }))
);

```

---

## **Suspense Boundaries**

**Import:** `import { SuspenseLoader } from '~components/SuspenseLoader';`

**Usage:** Wrap lazy components to show loading state and prevent layout shift.

```tsx
// Route level
<SuspenseLoader><MyPage /></SuspenseLoader>

// Component level - multiple independent sections<SuspenseLoader><Header /></SuspenseLoader><SuspenseLoader><MainContent /></SuspenseLoader><SuspenseLoader><Sidebar /></SuspenseLoader>
```

---

## **Component Structure Template**

### **Recommended Order**

```tsx
/**
 * Component description
 * What it does, when to use it
 */import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Feature importsimport { myFeatureApi } from '../api/myFeatureApi';
import type { MyData } from '~types/myData';

// Component importsimport { SuspenseLoader } from '~components/SuspenseLoader';

// Hooksimport { useAuth } from '@/hooks/useAuth';

// 1. PROPS INTERFACE (with JSDoc)interface MyComponentProps {
/** The ID of the entity to display */entityId: number;
/** Optional callback when action completes */
    onComplete?: () => void;
/** Display mode */
    mode?: 'view' | 'edit';
/** Additional className for styling */
    className?: string;
}

// 2. COMPONENT DEFINITIONexport const MyComponent: React.FC<MyComponentProps> = ({
    entityId,
    onComplete,
    mode = 'view',
    className,
}) => {
// 3. HOOKS (in this order)// - Context hooks firstconst { user } = useAuth();

// - Data fetchingconst { data } = useSuspenseQuery({
        queryKey: ['myEntity', entityId],
        queryFn: () => myFeatureApi.getEntity(entityId),
    });

// - Local stateconst [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(mode === 'edit');

// - Memoized valuesconst filteredData = useMemo(() => {
        return data.filter(item => item.active);
    }, [data]);

// - EffectsuseEffect(() => {
// Setupreturn () => {
// Cleanup
        };
    }, []);

// 4. EVENT HANDLERS (with useCallback)const handleItemSelect = useCallback((itemId: string) => {
        setSelectedItem(itemId);
    }, []);

    const handleSave = useCallback(async () => {
        try {
            await myFeatureApi.updateEntity(entityId, {/* data */ });
            toast.success('Entity updated successfully');
            onComplete?.();
        } catch (error) {
            toast.error('Failed to update entity');
        }
    }, [entityId, onComplete]);

// 5. RENDERreturn (
        <Card className={cn('p-4', className)}>
            <CardHeader>
                <CardTitle>My Component</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {filteredData.map(item => (
                    <div key={item.id} className="p-2 hover:bg-muted rounded">
                        {item.name}
                    </div>
                ))}
                <Button onClick={handleSave}>Save</Button>
            </CardContent>
        </Card>
    );
};

// 6. EXPORT (default export at bottom)export default MyComponent;

```

---

## **Component Separation**

**Split when:** >300 lines, multiple responsibilities, reusable sections **Keep together when:** <200 lines, tightly coupled, not reusable

---

## **Exports**

**Pattern:** Named const + default export

```tsx
export const MyComponent: React.FC<Props> = ({ ... }) => { };
export default MyComponent;

// Lazy load named exportconst MyComponent = React.lazy(() =>
    import('./MyComponent').then(m => ({ default: m.MyComponent }))
);

```

---

## **Component Communication**

### **Props Down, Events Up**

```tsx
// Parentfunction Parent() {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <Child
            data={data}                    // Props down
            onSelect={setSelectedId}       // Events up
        />
    );
}

// Childinterface ChildProps {
    data: Data[];
    onSelect: (id: string) => void;
}

export const Child: React.FC<ChildProps> = ({ data, onSelect }) => {
    return (
        <div onClick={() => onSelect(data[0].id)} className="cursor-pointer">
            {/* Content */}
        </div>
    );
};

```

### **Avoid Prop Drilling**

**Use context for deep nesting:**

```tsx
// ❌ AVOID - Prop drilling 5+ levels
<A prop={x}>
  <B prop={x}>
    <C prop={x}>
      <D prop={x}>
        <E prop={x} />  // Finally uses it here
      </D>
    </C>
  </B>
</A>

// ✅ PREFERRED - Context or TanStack Queryconst MyContext = createContext<MyData | null>(null);

function Provider({ children }) {
    const { data } = useSuspenseQuery({ ... });
    return <MyContext.Provider value={data}>{children}</MyContext.Provider>;
}

function DeepChild() {
    const data = useContext(MyContext);
// Use data directly
}

```

---

## **Summary**

**Component Checklist:** React.FC + lazy load + Suspense + useSuspenseQuery + Tailwind + useCallback + default export

**See Also:** `./data-fetching.md` | `./styling-and-theming.md` | `./complete-examples.md`