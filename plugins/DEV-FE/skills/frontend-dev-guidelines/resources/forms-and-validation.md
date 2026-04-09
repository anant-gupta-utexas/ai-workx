# **Forms and Validation**

Modern form handling using TanStack Form with Zod validation and shadcn/ui form components.

---

## **TanStack Form Overview**

**Why TanStack Form:**

- Type-safe form state management
- Field-level validation
- Optimized re-renders
- Framework-agnostic core
- Works seamlessly with Zod schemas

---

## **Basic Form Pattern**

```tsx
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const schema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
});

export const UserForm: React.FC = () => {
    const form = useForm({
        defaultValues: { username: '', email: '' },
        onSubmit: async ({ value }) => {
            try {
                await api.createUser(value);
                toast.success('User created');
            } catch {
                toast.error('Failed to create user');
            }
        },
        validatorAdapter: zodValidator(),
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
            }}
            className="space-y-4"
        >
            <form.Field name="username" validators={{ onChange: schema.shape.username }}>
                {(field) => (
                    <div>
                        <Label htmlFor={field.name}>Username</Label>
                        <Input
                            id={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {field.state.meta.errors && (
                            <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                        )}
                    </div>
                )}
            </form.Field>

            {/* Repeat pattern for other fields */}

            <Button type="submit">Submit</Button>
        </form>
    );
};

```

**Key Pattern:** `form.Field` → render function → Input + Label + error display. Repeat for each field.

---

## **Advanced Patterns**

### **Cross-Field Validation**

```tsx
<form.Field
    name="confirmPassword"
    validators={{
        onChangeListenTo: ['password'],
        onChange: ({ value, fieldApi }) => {
            const password = fieldApi.form.getFieldValue('password');
            return value !== password ? 'Passwords do not match' : undefined;
        },
    }}
>
    {(field) => (/* Field render */)}
</form.Field>

```

### **Form with Mutations**

```tsx
const createMutation = useMutation({
    mutationFn: (data: FormData) => api.create(data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['items'] });
        toast.success('Created');
        form.reset();
    },
});

const form = useForm({
    defaultValues: { name: '' },
    onSubmit: ({ value }) => createMutation.mutate(value),
    validatorAdapter: zodValidator(),
});

```

**Pattern:** Create mutation → call in `onSubmit` → invalidate queries → toast → reset form

### **Select and Checkbox**

```tsx
// Select
<form.Field name="role">
    {(field) => (
        <Select value={field.state.value} onValueChange={field.handleChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
                <SelectItem value="user">User</SelectItem>
            </SelectContent>
        </Select>
    )}
</form.Field>

// Checkbox<form.Field name="terms">
    {(field) => (
        <Checkbox
            checked={field.state.value}
            onCheckedChange={field.handleChange}
        />
    )}
</form.Field>
```

### **Form State**

```tsx
form.state.isDirty// Has changes
form.state.isValid// Is valid
form.reset()// Reset form
form.setFieldValue('name', 'value')// Set field
```

### **Multi-Step Forms**

```tsx
const [step, setStep] = useState(1);

const handleNext = async () => {
    const valid = await form.validateField('field1', 'change');
    if (valid) setStep(2);
};

// Conditional rendering based on step
{step === 1 && <Step1Fields />}
{step === 2 && <Step2Fields />}

```

---

## **Summary**

**Form Pattern:** TanStack Form + Zod + shadcn/ui + mutations + Sonner toasts

**See Also:** `./complete-examples.md` for full forms