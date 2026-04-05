# Instructions: Create a New Component

Follow this step-by-step guide when creating a new React component.

---

## Step 1: Determine Component Type

- **Server Component** (default) - No hooks, no event listeners
- **Client Component** - Needs hooks, event listeners, or interactivity

---

## Step 2: Create the File

```
# For Server Components
components/[category]/ComponentName.tsx

# For Client Components (add 'use client' directive)
components/[category]/ComponentName.tsx
```

**Category options:** `ui`, `restaurant`, `lists`, `pages`, `layouts`

---

## Step 3: Write the Component

### Server Component Template
```tsx
// components/[category]/ComponentName.tsx
import { ComponentProps } from '@/libs/types';

interface ComponentNameProps {
  // Define props
  className?: string;
}

export default function ComponentName({ className = '' }: ComponentNameProps) {
  return (
    <div className={className}>
      {/* Component content */}
    </div>
  );
}
```

### Client Component Template
```tsx
// components/[category]/ComponentName.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ComponentNameProps {
  // Define props
  className?: string;
}

export default function ComponentName({ className = '' }: ComponentNameProps) {
  const [state, setState] = useState();

  return (
    <motion.div
      className={className}
      // Framer Motion props
    >
      {/* Component content */}
    </motion.div>
  );
}
```

---

## Step 4: Checklist

- [ ] Define TypeScript interface for props
- [ ] Add `'use client'` if needed
- [ ] Use Tailwind CSS exclusively
- [ ] Add responsive design (mobile-first)
- [ ] Include loading/error states if fetching data
- [ ] Add aria-labels for accessibility
- [ ] Export via `components/index.ts`

---

## Step 5: Export the Component

Add to `components/index.ts`:
```typescript
export { default as ComponentName } from './[category]/ComponentName';
```

---

## Step 6: Create Test

Create `__tests__/components/ComponentName.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import ComponentName from '@/components/[category]/ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });
});
```

---

## Common Patterns

### Component with Children
```tsx
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}
```

### Component with Variants
```tsx
type Variant = 'primary' | 'secondary' | 'outline';

interface Props {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-white',
  outline: 'border border-primary',
};
```

### Component with Loading State
```tsx
interface Props {
  isLoading?: boolean;
}

{isLoading ? (
  <Skeleton count={3} />
) : (
  <Content />
)}
```

---

## Reference Files

- `agents/frontend-agent.md` - Frontend patterns
- `agents/ui-ux-agent.md` - UI/UX patterns
- `docs/database-schema-reference.md` - Data types
- `docs/api-endpoints-reference.md` - API integration

---

*Last updated: 2026-04-05*