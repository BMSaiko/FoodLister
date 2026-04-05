# Testing Agent - FoodList

## Especialidade
Jest, React Testing Library, Mocks, Test Coverage, API Testing

---

## Tech Stack Obrigatória

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Jest | 29.7.x | Test framework |
| @testing-library/react | 16.1.x | Component testing |
| @testing-library/jest-dom | 6.6.x | Custom matchers |
| ts-jest | 29.2.x | TypeScript support |
| jest-environment-jsdom | 29.7.x | Browser environment |

---

## Padrões do Projeto

### Estrutura de Testes
```
__tests__/
├── api/              # Testes de API routes
├── components/       # Testes de componentes React
├── hooks/            # Testes de custom hooks
└── utils/            # Testes de funções utilitárias
```

### Naming Conventions
- **Ficheiros**: `[name].test.ts` ou `[name].test.tsx`
- **Testes**: `describe('[ComponentName]', ...)`
- **Casos**: `it('should [expected behavior]', ...)`

---

## Checklist para Novo Teste

- [ ] Criar ficheiro em `__tests__/[category]/`
- [ ] Usar Arrange-Act-Assert pattern
- [ ] Mock Supabase e APIs externas
- [ ] Testar happy path
- [ ] Testar error cases
- [ ] Testar edge cases (empty state, loading, etc.)
- [ ] Verificar accessibility (aria attributes)
- [ ] Run `npm test` para validar
- [ ] Verificar coverage com `npm run test:coverage`

---

## Component Testing Patterns

### Teste Básico de Componente
```tsx
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Teste com Provider/Context
```tsx
// __tests__/components/RestaurantList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import RestaurantList from '@/components/restaurant/RestaurantList';

// Mock Supabase
jest.mock('@/libs/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [{ id: '1', name: 'Test Restaurant' }],
          error: null,
        })),
      })),
    })),
  },
}));

function renderWithProviders(component: React.ReactElement) {
  return render(<AuthProvider>{component}</AuthProvider>);
}

describe('RestaurantList', () => {
  it('should display loading state initially', () => {
    renderWithProviders(<RestaurantList />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display restaurants after loading', async () => {
    renderWithProviders(<RestaurantList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    });
  });
});
```

---

## Hook Testing

```tsx
// __tests__/hooks/useAuth.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/auth/useAuth';
import { AuthProvider } from '@/contexts/AuthContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  it('should return user when authenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });
  });

  it('should return null when not authenticated', async () => {
    // Mock unauthenticated state
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
  });
});
```

---

## API Testing

```tsx
// __tests__/api/restaurants.test.ts
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/restaurants/route';

// Mock Supabase server client
jest.mock('@/libs/supabase/server', () => ({
  createServerClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [{ id: '1', name: 'Test' }],
          error: null,
        })),
      })),
    })),
  })),
}));

describe('RESTAURANTS API', () => {
  describe('GET /api/restaurants', () => {
    it('should return restaurants list', async () => {
      const request = new NextRequest('http://localhost/api/restaurants');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('Test');
    });
  });
});
```

---

## Custom Matchers (jest-dom)

```tsx
// jest.setup.ts - já configurado no projeto
import '@testing-library/jest-dom';

// Matchers disponíveis:
// - toBeInTheDocument()
// - toBeVisible()
// - toHaveTextContent()
// - toBeDisabled() / toBeEnabled()
// - toHaveAttribute()
// - toHaveClass()
// - toHaveValue()
// - toBeChecked()
// - toBeEmpty()
```

---

## Mock Patterns

### Mock de Módulo Inteiro
```tsx
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));
```

### Mock de Função
```tsx
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
};

jest.mock('@/libs/supabase/client', () => ({
  supabase: mockSupabase,
}));
```

---

## Test Coverage

### Configuração (jest.config.js)
```js
module.exports = {
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'libs/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

---

## Erros Comuns a Evitar

1. **Não mockar Supabase** - testes falham sem conexão
2. **Testar implementação** em vez de comportamento
3. **Múltiplas assertions** num único teste
4. **Não testar error cases** - apenas happy path
5. **Tests dependentes entre si** - cada teste deve ser independente
6. **Não limpar mocks** entre testes - usar `beforeEach`/`afterEach`
7. **Ignorar accessibility** nos testes de componentes

---

## Comandos

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
npm test -- --verbose    # Detailed output
npm test -- [pattern]    # Run specific tests
```

---

*Last updated: 2026-04-05*