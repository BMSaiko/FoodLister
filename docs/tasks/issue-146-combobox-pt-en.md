# Issue #146: Feature - combobox-pt&EN

**GitHub Issue Link:** https://github.com/BMSaiko/FoodLister/issues/146

**Status:** Pending

---

## Overview

### Context
O FoodLister já possui suporte básico a i18n conforme commit `63b406f`, mas não possui uma interface de seleção de idioma voltada ao usuário. Esta issue é uma continuação da Issue #15, focada especificamente na implementação do combobox para Português e Inglês.

### Why Needed
- Usuários precisam de uma forma intuitiva de alternar entre Português (PT) e Inglês (EN)
- O combobox deve permitir busca por idioma para facilitar a seleção
- Necessário para suportar a base de utilizadores internacional (foco inicial em PT e EN)

### How It Fits Into the System
O componente será integrado na Navbar (desktop e mobile), usará um novo `LanguageContext` para gerenciar o estado do idioma, e seguirá os padrões existentes de contextos em `contexts/`. O foco será em Português e Inglês inicialmente.

---

## Types

### New Type Definitions (to be added to `libs/types.ts`)

```typescript
export interface Language {
  code: string; // 'en', 'pt'
  name: string; // 'English', 'Português'
  nativeName: string; // 'English', 'Português'
  flag?: string; // Emoji de bandeira: '🇺🇸', '🇵🇹'
}

export type LanguageCode = 'en' | 'pt';

export interface LanguageContextValue {
  currentLanguage: Language;
  languages: Language[];
  setLanguage: (code: LanguageCode) => void;
  isLoading: boolean;
}
```

### Context Type Update
```typescript
// contexts/index.tsx - exportar LanguageContext
export const LanguageContext: React.Context<LanguageContextValue | undefined>;
```

---

## Files

### New Files to Create

1. **`contexts/LanguageContext.tsx`** - Context provider para gerenciamento de idioma (PT/EN)
2. **`hooks/language/useLanguage.ts`** - Hook customizado para aceder ao LanguageContext
3. **`components/ui/LanguageCombobox.tsx`** - Componente combobox reutilizável para seleção de idioma
4. **`components/ui/LanguageFlag.tsx`** - Componente para exibir bandeira/ícone do idioma
5. **`libs/languages.ts`** - Configuração e lista de idiomas suportados (PT e EN)
6. **`__tests__/components/ui/LanguageCombobox.test.tsx`** - Testes do combobox
7. **`__tests__/contexts/LanguageContext.test.tsx`** - Testes do contexto

### Existing Files to Modify

1. **`contexts/index.tsx`**
   - Exportar `LanguageContext` e `useLanguage` hook

2. **`app/layout.js`**
   - Envolver children com `<LanguageProvider>`
   - Importar e configurar o provider
   - Configurar idioma padrão (PT ou EN baseado na geolocalização ou preferência do browser)

3. **`components/layouts/Navbar.jsx`** ou **`components/layouts/Navbar.tsx`**
   - Adicionar `LanguageCombobox` na navbar desktop
   - Adicionar `LanguageCombobox` no menu mobile

4. **`libs/types.ts`**
   - Adicionar interfaces `Language`, `LanguageContextValue`
   - Adicionar type `LanguageCode`

### Files to Delete
- Nenhum

---

## Functions

### New Functions

1. **`LanguageProvider({ children }: { children: React.ReactNode })`**
   - Location: `contexts/LanguageContext.tsx`
   - Purpose: Provider do contexto de idioma
   - Returns: JSX.Element com provider
   - Implementation: Gerenciar estado do idioma atual, persistir no localStorage

2. **`useLanguage(): LanguageContextValue`**
   - Location: `hooks/language/useLanguage.ts`
   - Purpose: Hook para aceder ao contexto de idioma
   - Returns: `{ currentLanguage, languages, setLanguage, isLoading }`
   - Seguir padrão dos hooks existentes em `hooks/`

3. **`LanguageCombobox({ onSelect, defaultValue }: { onSelect?: (lang: Language) => void, defaultValue?: LanguageCode })`**
   - Location: `components/ui/LanguageCombobox.tsx`
   - Purpose: Combobox com busca para seleção de idioma (PT/EN)
   - Returns: JSX.Element
   - Deve suportar busca por nome do idioma

4. **`LanguageFlag({ language, size }: { language: Language, size?: number })`**
   - Location: `components/ui/LanguageFlag.tsx`
   - Purpose: Exibir bandeira ou ícone do idioma
   - Returns: JSX.Element (emoji ou SVG)

5. **`getLanguages(): Language[]`**
   - Location: `libs/languages.ts`
   - Purpose: Retornar lista de idiomas suportados (PT, EN)
   - Returns: `Language[]`

6. **`getLanguageByCode(code: LanguageCode): Language | undefined`**
   - Location: `libs/languages.ts`
   - Purpose: Buscar idioma por código
   - Returns: `Language | undefined`

### Modified Functions

1. **`app/layout.js` - RootLayout component**
   - Add: Envolver children com `<LanguageProvider>`
   - Add: Import do provider

---

## Classes

### New Classes
- Nenhuma classe nova (usando hooks e contextos funcionais)

### Modified Classes
- Nenhuma

---

## Dependencies

### New Packages
- **`cmdk`** (para combobox com busca): `npm install cmdk`
- Ou usar **`@radix-ui/react-select`** se já estiver no projeto

### Version Changes
- Nenhuma alteração de versão obrigatória para pacotes existentes

---

## Testing

### New Test Files

1. **`__tests__/components/ui/LanguageCombobox.test.tsx`**
   - Testar renderização do combobox
   - Testar busca/filtro de idiomas (PT, EN)
   - Testar seleção de idioma
   - Testar estados de loading

2. **`__tests__/contexts/LanguageContext.test.tsx`**
   - Testar provider com valores padrão (PT ou EN)
   - Testar mudança de idioma
   - Testar persistência no localStorage

3. **`__tests__/hooks/language/useLanguage.test.ts`**
   - Testar hook em contexto provider
   - Testar erro fora do provider

### Existing Test Modifications
- Atualizar testes da Navbar para incluir LanguageCombobox

---

## Implementation Order

1. **Setup Languages Config**
   - Criar `libs/languages.ts` com lista de idiomas suportados (PT, EN)
   - Definir type `LanguageCode` e interface `Language`
   - Configurar bandeiras (emojis: 🇵🇹, 🇺🇸)

2. **Create LanguageContext**
   - Criar `contexts/LanguageContext.tsx` com provider
   - Implementar lógica de mudança de idioma
   - Adicionar persistência (localStorage)
   - Detectar idioma do browser no primeiro acesso

3. **Create useLanguage Hook**
   - Criar `hooks/language/useLanguage.ts`
   - Seguir padrão dos hooks existentes em `hooks/`

4. **Create UI Components**
   - Criar `components/ui/LanguageCombobox.tsx` com busca
   - Criar `components/ui/LanguageFlag.tsx` para ícones
   - Usar Tailwind CSS para estilização

5. **Update Contexts Export**
   - Atualizar `contexts/index.tsx` para exportar novo contexto e hook

6. **Integrate in Layout**
   - Atualizar `app/layout.js` para envolver com LanguageProvider
   - Configurar idioma padrão (deteção automática ou PT)

7. **Integrate in Navbar**
   - Adicionar LanguageCombobox na Navbar desktop
   - Adicionar no menu mobile da Navbar
   - Testar responsividade

8. **Testing**
   - Criar testes para novo contexto
   - Criar testes para combobox
   - Criar testes para hook
   - Executar `npm test`

9. **Final Validation**
   - Executar `npm run lint` - 0 erros
   - Executar `npm run build` - exit code 0
   - Executar `npm test` - todos os testes passam
   - Fazer commit: `feat(ui): add PT/EN language combobox with search`

---

## Acceptance Criteria Checklist

- [ ] Componente Combobox reutilizável implementado para seleção de idioma (PT/EN)
- [ ] LanguageContext criado para gerenciar o estado do idioma atual
- [ ] Seletor de idioma integrado na Navbar (versões desktop e mobile)
- [ ] Suporte para Português e Inglês com tipos TypeScript definidos
- [ ] Combobox permite busca por nome do idioma
- [ ] Integração com o suporte i18n existente
- [ ] Persistência da seleção no localStorage
- [ ] Testes unitários para novos componentes e contexto
- [ ] Documentação atualizada (memory-bank/)