# **Styling and Theming**

Modern styling patterns using Tailwind CSS utility classes and shadcn/ui theming system.

---

## **Tailwind CSS Overview**

**Why Tailwind:**

- Utility-first CSS framework
- No context switching between files
- Consistent design system
- Tree-shakeable (unused styles removed)
- Works seamlessly with shadcn/ui

**Installation:**

```bash
pnpm create @tanstack/start@latest --tailwind --add-ons shadcn

```

---

## **Basic Tailwind Patterns**

### **Layout**

```tsx
// Flexbox
<div className="flex items-center justify-between gap-4">
    <div>Left</div><div>Right</div>
</div>

// Flex column<div className="flex flex-col gap-2">
    <div>Top</div>
    <div>Bottom</div>
</div>// Grid<div className="grid grid-cols-3 gap-4">
    <div>Column 1</div>
    <div>Column 2</div>
    <div>Column 3</div>
</div>// Responsive grid<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div>Responsive</div>
</div>
```

### **Spacing**

```tsx
// Padding
<div className="p-4">Padding all sides (1rem)</div>
<div className="px-4 py-2">Horizontal and vertical</div><div className="pt-4 pr-2 pb-4 pl-2">Individual sides</div>// Margin<div className="m-4">Margin all sides</div><div className="mx-auto">Center horizontally</div><div className="mt-4 mb-2">Top and bottom</div>// Gap (for flex/grid)<div className="flex gap-4">Spacing between children</div><div className="flex gap-x-4 gap-y-2">Different x and y gaps</div>
```

**Spacing Scale:**

- `1` = 0.25rem (4px)
- `2` = 0.5rem (8px)
- `4` = 1rem (16px)
- `6` = 1.5rem (24px)
- `8` = 2rem (32px)
- `12` = 3rem (48px)

### **Sizing**

```tsx
// Width
<div className="w-full">Full width</div>
<div className="w-1/2">50%</div><div className="w-64">16rem (256px)</div><div className="w-screen">100vw</div>// Height<div className="h-full">Full height</div><div className="h-screen">100vh</div><div className="h-64">16rem (256px)</div>// Min/Max<div className="min-w-0 max-w-sm">Constrained width</div><div className="min-h-screen">At least full viewport height</div>
```

### **Colors**

```tsx
// Text color
<p className="text-primary">Primary text</p>
<p className="text-muted-foreground">Muted text</p><p className="text-destructive">Error text</p>// Background color<div className="bg-primary">Primary background</div><div className="bg-card">Card background</div><div className="bg-muted">Muted background</div>// Border color<div className="border border-border">Default border</div><div className="border-2 border-primary">Primary border</div>
```

---

## **Responsive Design**

### **Breakpoints**

```tsx
// Tailwind breakpoints:// sm: 640px// md: 768px// lg: 1024px// xl: 1280px// 2xl: 1536px// Mobile-first approach
<div className="
    text-sm         /* mobile */
    md:text-base    /* tablet */
    lg:text-lg      /* desktop */
">
    Responsive text
</div>

// Hide/show at breakpoints<div className="hidden md:block">
    Visible on tablet and up
</div><div className="block md:hidden">
    Visible on mobile only
</div>// Responsive layout<div className="
    flex
    flex-col          /* mobile: stack */
    md:flex-row       /* tablet+: side by side */
    gap-4
">
    <div className="w-full md:w-1/2">Left</div>
    <div className="w-full md:w-1/2">Right</div>
</div>
```

---

## **shadcn/ui Theming**

### **Theme Setup**

shadcn/ui uses CSS variables for theming. Defined in `app.css` or `globals.css`:

```css
@layer base {
    :root {
        --background: 0 0% 100%;
        --foreground: 222.2 84% 4.9%;
        --card: 0 0% 100%;
        --card-foreground: 222.2 84% 4.9%;
        --popover: 0 0% 100%;
        --popover-foreground: 222.2 84% 4.9%;
        --primary: 222.2 47.4% 11.2%;
        --primary-foreground: 210 40% 98%;
        --secondary: 210 40% 96.1%;
        --secondary-foreground: 222.2 47.4% 11.2%;
        --muted: 210 40% 96.1%;
        --muted-foreground: 215.4 16.3% 46.9%;
        --accent: 210 40% 96.1%;
        --accent-foreground: 222.2 47.4% 11.2%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 210 40% 98%;
        --border: 214.3 31.8% 91.4%;
        --input: 214.3 31.8% 91.4%;
        --ring: 222.2 84% 4.9%;
        --radius: 0.5rem;
    }

    .dark {
        --background: 222.2 84% 4.9%;
        --foreground: 210 40% 98%;
        --card: 222.2 84% 4.9%;
        --card-foreground: 210 40% 98%;
        --popover: 222.2 84% 4.9%;
        --popover-foreground: 210 40% 98%;
        --primary: 210 40% 98%;
        --primary-foreground: 222.2 47.4% 11.2%;
        --secondary: 217.2 32.6% 17.5%;
        --secondary-foreground: 210 40% 98%;
        --muted: 217.2 32.6% 17.5%;
        --muted-foreground: 215 20.2% 65.1%;
        --accent: 217.2 32.6% 17.5%;
        --accent-foreground: 210 40% 98%;
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 210 40% 98%;
        --border: 217.2 32.6% 17.5%;
        --input: 217.2 32.6% 17.5%;
        --ring: 212.7 26.8% 83.9%;
    }
}

```

### **Using Theme Colors**

```tsx
// Use semantic color names
<div className="bg-primary text-primary-foreground">
    Primary button style
</div>

<div className="bg-secondary text-secondary-foreground">
    Secondary button style
</div><div className="bg-card text-card-foreground border border-border">
    Card with proper contrast
</div><div className="text-muted-foreground">
    Muted/secondary text
</div>
```

---

## **Dark Mode**

### **Setup Dark Mode Provider**

```tsx
// app/root.tsximport { createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from '@/components/theme-provider';

export const Route = createRootRoute({
    component: RootLayout,
});

function RootLayout() {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Outlet />
                </ThemeProvider>
            </body>
        </html>
    );
}

```

### **Theme Provider Component**

```tsx
// components/theme-provider.tsximport { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'ui-theme',
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(theme);
    }, [theme]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

```

### **Theme Switcher Component**

```tsx
// components/theme-switcher.tsximport { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';

export function ThemeSwitcher() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

```

---

## **Customizing shadcn Components**

### **Adding Custom Styles**

```tsx
// Extend component with Tailwind classesimport { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const CustomButton: React.FC<ButtonProps> = ({ className, ...props }) => {
    return (
        <Button
            className={cn(
                'shadow-lg hover:shadow-xl transition-shadow',
                className
            )}
            {...props}
        />
    );
};

```

### **Component Variants**

```tsx
// Create custom variants using class-variance-authority (CVA)import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
    'rounded-lg border p-4',
    {
        variants: {
            variant: {
                default: 'bg-card text-card-foreground',
                primary: 'bg-primary text-primary-foreground',
                destructive: 'bg-destructive text-destructive-foreground',
            },
            size: {
                sm: 'p-2 text-sm',
                md: 'p-4 text-base',
                lg: 'p-6 text-lg',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

interface CustomCardProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof cardVariants> {}

export const CustomCard: React.FC<CustomCardProps> = ({
    className,
    variant,
    size,
    ...props
}) => {
    return (
        <div
            className={cn(cardVariants({ variant, size }), className)}
            {...props}
        />
    );
};

// Usage<CustomCard variant="primary" size="lg">
    Custom styled card
</CustomCard>
```

---

## **Common Styling Patterns**

### **Container Pattern**

```tsx
// Page container with max width
<div className="container mx-auto px-4 py-8">
    <div className="max-w-4xl mx-auto">
        Content centered with max width
    </div>
</div>

```

### **Card Layout**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card className="shadow-sm hover:shadow-md transition-shadow">
    <CardHeader>
        <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent>
        <p className="text-sm text-muted-foreground">
            Content with proper contrast
        </p>
    </CardContent>
</Card>
```

### **Form Layout**

```tsx
<form className="space-y-6">
    <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Enter your name" />
    </div><div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="email@example.com" />
    </div><Button type="submit" className="w-full">
        Submit
    </Button>
</form>

```

### **List with Dividers**

```tsx
<div className="divide-y divide-border">
    <div className="py-3">Item 1</div><div className="py-3">Item 2</div><div className="py-3">Item 3</div>
</div>

```

### **Loading State**

```tsx
import { Skeleton } from '@/components/ui/skeleton';

<div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
</div>
```

---

## **Typography**

### **Text Sizes**

```tsx
<p className="text-xs">Extra small (0.75rem)</p>
<p className="text-sm">Small (0.875rem)</p><p className="text-base">Base (1rem)</p><p className="text-lg">Large (1.125rem)</p><p className="text-xl">Extra large (1.25rem)</p><p className="text-2xl">2X large (1.5rem)</p><p className="text-3xl">3X large (1.875rem)</p>
```

### **Font Weights**

```tsx
<p className="font-light">Light (300)</p>
<p className="font-normal">Normal (400)</p><p className="font-medium">Medium (500)</p><p className="font-semibold">Semibold (600)</p><p className="font-bold">Bold (700)</p>
```

### **Text Utilities**

```tsx
// Truncate
<p className="truncate w-64">
    Long text that will be truncated with ellipsis
</p>

// Line clamp<p className="line-clamp-3">
    Text that will be clamped to 3 lines with ellipsis
</p>// Text alignment<p className="text-left">Left aligned</p><p className="text-center">Center aligned</p><p className="text-right">Right aligned</p>
```

---

## **Shadows and Effects**

### **Shadows**

```tsx
<div className="shadow-sm">Small shadow</div>
<div className="shadow">Default shadow</div><div className="shadow-md">Medium shadow</div><div className="shadow-lg">Large shadow</div><div className="shadow-xl">Extra large shadow</div>
```

### **Transitions**

```tsx
<Button className="transition-all hover:scale-105">
    Hover to scale
</Button>

<div className="transition-colors hover:bg-muted">
    Smooth color transition
</div><div className="transition-transform duration-300 hover:translate-x-2">
    Slide on hover
</div>
```

### **Border Radius**

```tsx
<div className="rounded">Default (0.25rem)</div>
<div className="rounded-md">Medium (0.375rem)</div><div className="rounded-lg">Large (0.5rem)</div><div className="rounded-xl">Extra large (0.75rem)</div><div className="rounded-full">Fully rounded</div>
```

---

## **Custom Utility Classes**

### **When to Create Custom Classes**

Only create custom classes when:

- Pattern is used in 3+ places
- Complex combination of utilities
- Dynamic values not supported by Tailwind

### **Creating Custom Classes**

```css
/* app.css or globals.css */@layer components {
    .btn-primary {
        @apply bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium;
    }

    .card-hover {
        @apply transition-all hover:shadow-lg hover:-translate-y-1;
    }
}

```

**Best Practice:** Prefer Tailwind utilities + `cn()` utility over custom classes.

---

## **Code Style Standards**

### **Indentation**

**4 spaces** (not 2, not tabs)

```tsx
export const MyComponent: React.FC = () => {
    return (
        <div className="flex flex-col gap-4">
            <div>Content</div>
        </div>
    );
};

```

### **Quotes**

**Single quotes** for strings (project standard)

```tsx
// ✅ CORRECTconst className = 'flex items-center';
import { Button } from '@/components/ui/button';

// ❌ WRONGconst className = "flex items-center";
import { Button } from "@/components/ui/button";

```

### **Class Name Organization**

```tsx
// Group related utilities
<div className="
    flex items-center justify-between    // Layout
    gap-4 p-4                             // Spacing
    bg-card text-card-foreground          // Colors
    rounded-lg border border-border       // Borders
    shadow-sm hover:shadow-md             // Effects
    transition-shadow                     // Transitions
">
    Content
</div>

```

---

## **cn() Utility Function**

### **Conditional Classes**

```tsx
import { cn } from '@/lib/utils';

interface ButtonProps {
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'lg';
    className?: string;
}

export const CustomButton: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'sm',
    className,
}) => {
    return (
        <button
            className={cn(
                'rounded-md font-medium transition-colors',
                variant === 'primary' && 'bg-primary text-primary-foreground',
                variant === 'secondary' && 'bg-secondary text-secondary-foreground',
                size === 'sm' && 'px-3 py-1.5 text-sm',
                size === 'lg' && 'px-6 py-3 text-lg',
                className
            )}
        >
            Button
        </button>
    );
};

```

---

## **Summary**

**Styling Best Practices:**

- ✅ Use Tailwind utility classes for styling
- ✅ Use shadcn/ui CSS variables for theming
- ✅ Mobile-first responsive design
- ✅ Dark mode support via theme provider
- ✅ Semantic color names (primary, muted, etc.)
- ✅ Use `cn()` for conditional classes
- ✅ 4-space indentation, single quotes
- ✅ Avoid custom CSS unless necessary
- ✅ Component variants with CVA when needed

**See Also:**

- `./component-patterns.md` - Styling components
- `./ui-components.md` - shadcn/ui components
- `./complete-examples.md` - Styled examples

**Reference:**

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)