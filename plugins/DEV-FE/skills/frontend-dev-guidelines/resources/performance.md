# **Performance Optimization**

Patterns for optimizing React component performance, preventing unnecessary re-renders, and avoiding memory leaks.

---

## **useMemo**

**When:** Filtering/sorting arrays, complex calculations, expensive transformations

```tsx
// ❌ Runs every renderconst filtered = items.filter(i => i.name.includes(term));

// ✅ Memoizedconst filtered = useMemo(() =>
    items.filter(i => i.name.includes(term)),
    [items, term]
);

```

## **useCallback**

**When:** Functions passed as props to children, used in useEffect deps, passed to memoized components

```tsx
// ✅ Stable function referenceconst handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
}, []);

return <Child onClick={handleClick} />;

```

## **React.memo**

**When:** Expensive rendering, props don't change often, list items

```tsx
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
    return <ComplexVisualization data={data} />;
});

```

## **Debounced Search**

```tsx
import { useDebounce } from 'use-debounce';

const [search, setSearch] = useState('');
const [debounced] = useDebounce(search, 300);

const { data } = useSuspenseQuery({
    queryKey: ['search', debounced],
    queryFn: () => api.search(debounced),
});

```

**Timing:** 300-500ms search, 1000ms auto-save, 100-200ms validation

## **Memory Leak Prevention**

**Always cleanup:** intervals, timeouts, event listeners

```tsx
useEffect(() => {
    const id = setInterval(() => setCount(c => c + 1), 1000);
    return () => clearInterval(id);
}, []);

useEffect(() => {
    const handler = () => console.log('resize');
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
}, []);

```

**Note:** TanStack Query handles fetch cleanup automatically.

---

## **List Rendering**

```tsx
// ✅ Stable keys
{items.map(item => <ListItem key={item.id}>{item.name}</ListItem>)}

// ❌ Index as key (unstable if reordering)
{items.map((item, i) => <ListItem key={i}>{item.name}</ListItem>)}

// Memoize list itemsconst ListItem = React.memo<Props>(({ item }) => <div>{item.name}</div>);

```

---

## **Heavy Dependencies**

```tsx
// ❌ Top-level import (loads immediately)import jsPDF from 'jspdf';

// ✅ Dynamic import (loads when needed)const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
// Use it
};

```

## **Summary**

**Performance:** useMemo + useCallback + React.memo + debounce + cleanup + stable keys + lazy load heavy deps

**See Also:** `./complete-examples.md`