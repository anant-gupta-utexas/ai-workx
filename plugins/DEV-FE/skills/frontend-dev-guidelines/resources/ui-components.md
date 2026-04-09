# **UI Components**

shadcn/ui component patterns and best practices for building consistent, accessible user interfaces.

---

## **shadcn/ui Overview**

**What is shadcn/ui:**

- Not a component library - components you copy into your project
- Built on Radix UI primitives
- Styled with Tailwind CSS
- Fully customizable
- Accessible by default

**Installation:**

```bash
pnpm dlx shadcn@latest add button card dialog input

```

---

## **Button Component**

### **Basic Usage**

```tsx
import { Button } from '@/components/ui/button';

export const ButtonExample: React.FC = () => {
    return (
        <div className="flex gap-2">
            <Button>Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
        </div>
    );
};

```

### **Button Sizes**

```tsx
<div className="flex items-center gap-2">
    <Button size="sm">Small</Button><Button size="default">Default</Button><Button size="lg">Large</Button><Button size="icon">
        <IconPlus className="h-4 w-4" />
    </Button>
</div>

```

### **Loading State**

```tsx
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const LoadingButton: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Button disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Processing...' : 'Submit'}
        </Button>
    );
};

```

---

## **Dialog Component**

### **Standard Dialog Pattern**

All dialogs should include:

- Close button (X)
- Clear title
- Proper actions

```tsx
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onConfirm}>
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

```

### **Dialog with Form**

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';

interface CreateItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const CreateItemDialog: React.FC<CreateItemDialogProps> = ({
    open,
    onOpenChange,
    onSuccess,
}) => {
    const form = useForm({
        defaultValues: {
            name: '',
            description: '',
        },
        onSubmit: async ({ value }) => {
            try {
                await api.createItem(value);
                toast.success('Item created');
                form.reset();
                onOpenChange(false);
                onSuccess();
            } catch (error) {
                toast.error('Failed to create item');
            }
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Item</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    <form.Field name="name">
                        {(field) => (
                            <div>
                                <Label htmlFor={field.name}>Name</Label>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="description">
                        {(field) => (
                            <div>
                                <Label htmlFor={field.name}>Description</Label>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        )}
                    </form.Field>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Create</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

```

---

## **Toast Notifications with Sonner**

### **Basic Usage**

```tsx
import { toast } from 'sonner';

// Success toast
toast.success('User created successfully');

// Error toast
toast.error('Failed to save changes');

// Info toast
toast.info('New version available');

// Warning toast
toast.warning('Unsaved changes');

// Custom toasttoast('Event created', {
    description: 'Monday, January 3rd at 6:00pm',
    action: {
        label: 'Undo',
        onClick: () => console.log('Undo'),
    },
});

```

### **Setup Sonner Provider**

```tsx
// app/root.tsx or layout componentimport { Toaster } from '@/components/ui/sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                {children}
                <Toaster />
            </body>
        </html>
    );
}

```

### **Toast with Mutations**

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => userApi.deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete user');
        },
    });
};

```

### **Promise Toast**

```tsx
import { toast } from 'sonner';

const handleSubmit = async (data: FormData) => {
    toast.promise(
        api.createUser(data),
        {
            loading: 'Creating user...',
            success: 'User created successfully',
            error: 'Failed to create user',
        }
    );
};

```

---

## **Card Component**

### **Basic Card**

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const UserCard: React.FC<{ user: User }> = ({ user }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
            </CardContent>
            <CardFooter>
                <Button variant="outline">View Profile</Button>
            </CardFooter>
        </Card>
    );
};

```

---

## **Table Component**

### **Data Table**

```tsx
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface UserTableProps {
    users: User[];
}

export const UserTable: React.FC<UserTableProps> = ({ users }) => {
    return (
        <Table>
            <TableCaption>A list of all users</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                                Edit
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

```

---

## **Form Input Components**

### **Input**

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div>
    <Label htmlFor="email">Email</Label>
    <Input
        id="email"
        type="email"
        placeholder="email@example.com"
    />
</div>
```

### **Textarea**

```tsx
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

<div>
    <Label htmlFor="message">Message</Label>
    <Textarea
        id="message"
        placeholder="Type your message here..."
    />
</div>
```

### **Select**

```tsx
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

<Select>
    <SelectTrigger>
        <SelectValue placeholder="Select a fruit" />
    </SelectTrigger>
    <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
    </SelectContent>
</Select>
```

### **Checkbox**

```tsx
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

<div className="flex items-center space-x-2">
    <Checkbox id="terms" />
    <Label htmlFor="terms">Accept terms and conditions</Label>
</div>
```

### **Radio Group**

```tsx
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

<RadioGroup defaultValue="option-one">
    <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">Option One</Label>
    </div>
    <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">Option Two</Label>
    </div>
</RadioGroup>
```

### **Switch**

```tsx
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

<div className="flex items-center space-x-2">
    <Switch id="airplane-mode" />
    <Label htmlFor="airplane-mode">Airplane Mode</Label>
</div>
```

---

## **Feedback Components**

### **Alert**

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

<Alert>
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
        Your session has expired. Please log in again.
    </AlertDescription>
</Alert><Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
        Failed to save changes. Please try again.
    </AlertDescription>
</Alert>
```

### **Skeleton**

```tsx
import { Skeleton } from '@/components/ui/skeleton';

export const SkeletonCard: React.FC = () => {
    return (
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-[250px] rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    );
};

```

### **Badge**

```tsx
import { Badge } from '@/components/ui/badge';

<div className="flex gap-2">
    <Badge>Default</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="destructive">Destructive</Badge>
    <Badge variant="outline">Outline</Badge>
</div>
```

---

## **Layout Components**

### **Separator**

```tsx
import { Separator } from '@/components/ui/separator';

<div>
    <div className="space-y-1">
        <h4 className="text-sm font-medium">Account</h4>
        <p className="text-sm text-muted-foreground">
            Make changes to your account here.
        </p>
    </div>
    <Separator className="my-4" />
    <div className="space-y-1">
        <h4 className="text-sm font-medium">Profile</h4>
        <p className="text-sm text-muted-foreground">
            Update your profile information.
        </p>
    </div>
</div>
```

### **Tabs**

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="account" className="w-[400px]">
    <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
    <TabsContent value="account">
        Make changes to your account here.
    </TabsContent>
    <TabsContent value="password">
        Change your password here.
    </TabsContent>
</Tabs>
```

### **Accordion**

```tsx
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

<Accordion type="single" collapsible>
    <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
            Yes. It comes with default styles that matches the other components.
        </AccordionContent>
    </AccordionItem>
</Accordion>
```

---

## **Dropdown Menu**

### **Basic Dropdown**

```tsx
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="outline">Open</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
```

---

## **Popover**

### **Basic Popover**

```tsx
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

<Popover>
    <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
    </PopoverTrigger>
    <PopoverContent>
        <div className="space-y-2">
            <h4 className="font-medium">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
                Set the dimensions for the layer.
            </p>
        </div>
    </PopoverContent>
</Popover>
```

---

## **Command Palette**

### **Searchable Command Menu**

```tsx
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';

export const CommandMenu: React.FC = () => {
    const [open, setOpen] = useState(false);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem>Calendar</CommandItem>
                    <CommandItem>Search Emoji</CommandItem>
                    <CommandItem>Calculator</CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
};

```

---

## **Summary**

**Component Best Practices:**

- ✅ Use shadcn/ui components for consistency
- ✅ Customize via Tailwind classes on wrapper elements
- ✅ Always include proper labels for accessibility
- ✅ Use Sonner for all toast notifications
- ✅ Dialog should have close button and clear actions
- ✅ Loading states on async buttons
- ✅ Use Skeleton for loading placeholders
- ✅ Proper error handling with Alert components

**See Also:**

- `./forms-and-validation.md` - Form component patterns
- `./styling-and-theming.md` - Customizing components
- `./complete-examples.md` - Full component examples

**Reference:**

- [shadcn/ui Documentation](https://ui.shadcn.com/llms.txt)