# Issue #15: UI - Implementar combobox de línguas (Language Combobox)

**GitHub Issue Link:** https://github.com/BMSaiko/FoodLister/issues/15

**Status:** Pending

---

## Overview

### Context
O FoodLister já possui suporte básico a i18n conforme commit `63b406f`, mas não possui uma interface de seleção de idioma voltada ao usuário. O projeto usa TypeScript e segue o padrão de Context API para gerenciamento de estado global.

### Why Needed
- Usuários precisam de uma forma intuitiva de alternar entre idiomas suportados
- O combobox deve permitir busca por idioma para facilitar a seleção
- Necessário para suportar a base de utilizadores internacional

### How It Fits Into the System
O componente será integrado na Navbar (desktop e mobile), usará um novo `LanguageContext` para gerenciar o estado do idioma atual, e seguirá os padrões existentes de contextos em `contexts/`.

---

## Types

### New Type Definitions (to be added to `libs/types.ts`)

```typescript
export interface Language {
  code: string; // 'en', 'pt', 'es', etc.
  name: string; // 'English', 'Português', 'Español'
  nativeName: string; // 'English', 'Português', 'Español'
  flag?: string; // Emoji de bandeira opcional
}

export type LanguageCode = 'en' | 'pt' | 'es' | 'fr' | 'de'; // expandir conforme necessário

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

1. **`contexts/LanguageContext.tsx`** - Context provider para gerenciamento de idioma
2. **`hooks/language/useLanguage.ts`** - Hook customizado para aceder ao LanguageContext
3. **`components/ui/LanguageCombobox.tsx`** - Componente combobox reutilizável para seleção de idioma
4. **`components/ui/LanguageFlag.tsx`** - Componente para exibir bandeira/ícone do idioma
5. **`libs/languages.ts`** - Configuração e lista de idiomas suportados
6. **`__tests__/components/ui/LanguageCombobox.test.tsx`** - Testes do combobox
7. **`__tests__/contexts/LanguageContext.test.tsx`** - Testes do contexto

### Existing Files to Modify

1. **`contexts/index.tsx`**
   - Exportar `LanguageContext` e `useLanguage` hook

2. **`app/layout.js`**
   - Envolver children com `<LanguageProvider>`
   - Importar e configurar o provider

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

2. **`useLanguage(): LanguageContextValue`**
   - Location: `hooks/language/useLanguage.ts`
   - Purpose: Hook para aceder ao contexto de idioma
   - Returns: `{ currentLanguage, languages, setLanguage, isLoading }`

3. **`LanguageCombobox({ onSelect, defaultValue }: { onSelect?: (lang: Language) => void, defaultValue?: LanguageCode })`**
   - Location: `components/ui/LanguageCombobox.tsx`
   - Purpose: Combobox com busca para seleção de idioma
   - Returns: JSX.Element

4. **`getLanguages(): Language[]`**
   - Location: `libs/languages.ts`
   - Purpose: Retornar lista de idiomas suportados
   - Returns: `Language[]`

5. **`getLanguageByCode(code: LanguageCode): Language | undefined`**
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
   - Testar busca/filtro de idiomas
   - Testar seleção de idioma
   - Testar estados de loading

2. **`__tests__/contexts/LanguageContext.test.tsx`**
   - Testar provider com valores padrão
   - Testar mudança de idioma
   - Testar persistência no localStorage (se implementado)

3. **`__tests__/hooks/language/useLanguage.test.ts`**
   - Testar hook em contexto provider
   - Testar erro fora do provider

### Existing Test Modifications
- Atualizar testes da Navbar para incluir LanguageCombobox

---

## Implementation Order

1. **Setup Languages Config**
   - Criar `libs/languages.ts` com lista de idiomas suportados
   - Definir type `LanguageCode` e interface `Language`

2. **Create LanguageContext**
   - Criar `contexts/LanguageContext.tsx` com provider
   - Implementar lógica de mudança de idioma
   - Adicionar persistência (localStorage)

3. **Create useLanguage Hook**
   - Criar `hooks/language/useLanguage.ts`
   - Seguir padrão dos hooks existentes em `hooks/`

4. **Create UI Components**
   - Criar `components/ui/LanguageCombobox.tsx` com busca
   - Criar `components/ui/LanguageFlag.tsx` para ícones

5. **Update Contexts Export**
   - Atualizar `contexts/index.tsx` para exportar novo contexto e hook

6. **Integrate in Layout**
   - Atualizar `app/layout.js` para envolver com LanguageProvider
   - Configurar idioma padrão

7. **Integrate in Navbar**
   - Adicionar LanguageCombobox na Navbar desktop
   - Adicionar no menu mobile da Navbar

8. **Testing**
   - Criar testes para novo contexto
   - Criar testes para combobox
   - Criar testes para hook
   - Executar `npm test`

9. **Final Validation**
   - Executar `npm run lint` - 0 erros
   - Executar `npm run build` - exit code 0
   - Executar `npm test` - todos os testes passam
   - Fazer commit: `feat(ui): add language combobox with search`

---

## Acceptance Criteria Checklist

- [ ] Componente Combobox reutilizável implementado para seleção de idioma
- [ ] LanguageContext criado para gerenciar o estado do idioma atual
- [ ] Seletor de idioma integrado na Navbar (versões desktop e mobile)
- [ ] Suporte para múltiplos idiomas (ex: English, Português) com tipos TypeScript definidos
- [ ] Integração com o suporte i18n existente
- [ ] Testes unitários para novos componentes e contexto
- [ ] Documentação atualizada (memory-bank/)