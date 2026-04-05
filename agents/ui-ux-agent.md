# UI/UX Agent - FoodList

## Especialidade
Componentes UI, Acessibilidade (a11y), Framer Motion, Mobile UX, Design System

---

## Tech Stack Obrigatória

| Tecnologia | Uso |
|------------|-----|
| Framer Motion 12.x | Animações e gestos |
| Lucide React | Ícones principais |
| React Icons | Bibliotecas adicionais |
| Tailwind CSS | Styling e responsive |
| React Toastify | Notificações |
| React Dropzone | File upload UI |
| React Phone Number Input | Phone input |

---

## Padrões do Projeto

### Estrutura de Componentes UI
```
components/ui/
├── Button.tsx           # Botões com variantes
├── Input.tsx            # Inputs de formulário
├── Modal.tsx            # Modais/Dialogs
├── Card.tsx             # Cards containers
├── Badge.tsx            # Badges/Tags
├── Skeleton.tsx         # Loading skeletons
├── Toast.tsx            # Notificações
├── Dropdown.tsx         # Dropdown menus
├── Avatar.tsx           # Avatares
└── EmptyState.tsx       # Estado vazio
```

### Design Tokens (Tailwind)
```
Cores:
- Primary: bg-primary / text-primary
- Secondary: bg-secondary / text-secondary
- Success: bg-success / text-success
- Warning: bg-warning / text-warning
- Error: bg-error / text-error
- Neutral: gray-50 a gray-950

Spacing:
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

Border Radius:
- sm: 0.25rem (4px)
- md: 0.5rem (8px)
- lg: 0.75rem (12px)
- xl: 1rem (16px)
- full: 9999px
```

---

## Checklist para Novo Componente UI

- [ ] Definir interface TypeScript para props
- [ ] Implementar variantes com classes condicionais
- [ ] Adicionar estados: default, hover, focus, active, disabled
- [ ] Garantir acessibilidade (aria-*, role, tabindex)
- [ ] Testar keyboard navigation
- [ ] Implementar responsive design
- [ ] Adicionar loading state quando aplicável
- [ ] Criar empty state
- [ ] Testar em mobile (touch targets 44px mínimo)
- [ ] Verificar contraste de cores (WCAG AA)

---

## Componente com Variantes

```tsx
// components/ui/Button.tsx
import { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-secondary text-white hover:bg-secondary-dark',
  outline: 'border-2 border-primary text-primary hover:bg-primary/10',
  ghost: 'text-gray-700 hover:bg-gray-100',
  danger: 'bg-error text-white hover:bg-error-dark',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin" aria-hidden="true">⏳</span>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </motion.button>
  );
}
```

---

## Animações Framer Motion

### Page Transition
```tsx
// components/layouts/PageTransition.tsx
'use client';

import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'tween',
  duration: 0.3,
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}
```

### List Animation (Stagger)
```tsx
// components/ui/AnimatedList.tsx
'use client';

import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function AnimatedList({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}
```

### Skeleton Loading
```tsx
// components/ui/Skeleton.tsx
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export default function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`
            bg-gray-200 rounded-lg animate-pulse
            ${className}
          `}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      ))}
    </>
  );
}
```

---

## Acessibilidade (a11y)

### Checklist WCAG AA
- [ ] Contraste mínimo 4.5:1 para texto normal
- [ ] Contraste mínimo 3:1 para texto grande
- [ ] Todos os elementos interativos acessíveis por teclado
- [ ] Focus visible em todos os elementos
- [ ] Alt text em todas as imagens
- [ ] Aria-label em ícones e botões sem texto
- [ ] Role attributes quando necessário
- [ ] Error messages associadas aos inputs

### Form Accessible
```tsx
// components/ui/FormField.tsx
import { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export default function FormField({
  label,
  error,
  helperText,
  id,
  required,
  ...props
}: FormFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
      </label>
      <input
        id={fieldId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-primary
          ${error ? 'border-error' : 'border-gray-300'}
        `}
        {...props}
      />
      {error && (
        <p id={`${fieldId}-error`} className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${fieldId}-helper`} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
```

---

## Mobile UX Guidelines

### Touch Targets
- Mínimo 44x44px para todos os elementos interativos
- Espaçamento adequado entre botões
- Swipe gestures para ações em listas

### Responsive Breakpoints
```
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
```

### Mobile Patterns
- Bottom navigation para navegação principal
- Pull-to-refresh para atualizar dados
- Infinite scroll ou pagination
- Bottom sheet para filtros/modais

---

## Erros Comuns a Evitar

1. **Animações excessivas** - manter sutis e performáticas
2. **Ignorar reduced motion** - respeitar preferências do utilizador
3. **Touch targets pequenos** - mínimo 44px
4. **Não testar em mobile** - sempre testar em dispositivos reais
5. **Cores com baixo contraste** - verificar com ferramentas WCAG
6. **Esquecer focus states** - essencial para keyboard navigation
7. **Loading states inconsistentes** - padronizar em todo o app

---

## Reduced Motion
```tsx
// hooks/ui/useReducedMotion.ts
import { useReducedMotion } from 'framer-motion';

export function useMotionPreferences() {
  const prefersReducedMotion = useReducedMotion();
  
  return {
    shouldAnimate: !prefersReducedMotion,
    transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.3 },
  };
}
```

---

*Last updated: 2026-04-05*