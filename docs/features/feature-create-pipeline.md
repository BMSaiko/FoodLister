# Feature: Create Restaurant/List Pipeline

> **Status:** ✅ Implementado
> **Prioridade:** Alta
> **Labels:** `core`, `crud`, `restaurants`, `lists`
> **Data de Criação:** 2026-05-07

---

## 📋 Descrição

Pipeline completa para criação de restaurantes e listas no FoodLister, incluindo formulários, validação, upload de imagens, e integração com Supabase.

## 🎯 Objetivos

- **Criação de Restaurantes** com todos os campos (nome, descrição, localização, preço, etc.)
- **Criação de Listas** com configuração de privacidade e filtros
- **Upload de Imagens** para menus (Cloudinary)
- **Validação de Formulários** com feedback em tempo real
- **Integração com API** e Supabase client
- **Redirecionamento** após criação bem-sucedida

## 🏗️ Arquitetura da Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Form      │────►│   API/      │────►│  Supabase   │
│  Component  │     │   Supabase  │     │  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       │                                       │
       ▼                                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Hooks     │     │  Context   │     │   Storage   │
│  (useForm)  │     │   API      │     │ (Cloudinary)│
└─────────────┘     └─────────────┘     └─────────────┘
```

## 📦 Componentes Envolvidos

### Restaurant Creation

| Component | Tipo | Descrição |
|----------|------|-----------|
| `app/restaurants/create/page.jsx` | Client Component | Página de criação de restaurante |
| `components/pages/CreateRestaurant.jsx` | Client Component | Componente da página com formulário |
| `components/restaurant/RestaurantForm.jsx` | Client Component | Formulário reutilizável de restaurante |
| `hooks/forms/useRestaurantForm.js` | Custom Hook | Lógica do formulário de restaurante |

### List Creation

| Component | Tipo | Descrição |
|----------|------|-----------|
| `app/lists/create/page.jsx` | Client Component | Página de criação de lista |
| `components/pages/CreateList.jsx` | Client Component | Componente da página com formulário |
| `components/lists/ListForm.jsx` | Client Component | Formulário reutilizável de lista |
| `hooks/forms/useListForm.js` | Custom Hook | Lógica do formulário de lista |

## 🔧 Hooks Personalizados

### useRestaurantForm

```javascript
const {
  formData,        // Dados atuais do formulário
  errors,          // Erros de validação
  isSubmitting,    // Estado de submissão
  handleChange,     // Handler para mudanças
  handleSubmit,     // Handler para submissão
  resetForm,       // Reset do formulário
  setFieldValue,    // Definir valor de campo
  validateField    // Validar campo específico
} = useRestaurantForm(initialData?);
```

**Campos Gerenciados:**
- `name` - Nome do restaurante (obrigatório)
- `description` - Descrição (opcional)
- `location` - Endereço (opcional)
- `price_per_person` - Preço por pessoa (opcional, > 0)
- `rating` - Avaliação (opcional, 0-5)
- `source_url` - URL de origem (opcional)
- `menu_links` - Links de menu (array, max 5)
- `menu_images` - Imagens de menu (array, max 10)
- `phone_numbers` - Telefones (array)
- `cuisine_type_ids` - Tipos de cozinha (array)
- `dietary_option_ids` - Opções dietéticas (array)
- `feature_ids` - Características (array)
- `latitude` / `longitude` - Coordenadas GPS

### useListForm

```javascript
const {
  formData,
  errors,
  isSubmitting,
  handleChange,
  handleSubmit,
  resetForm
} = useListForm(initialData?);
```

**Campos Gerenciados:**
- `name` - Nome da lista (obrigatório)
- `description` - Descrição (opcional)
- `is_public` - Visibilidade pública (default: true)
- `filters` - Configuração de filtros salva (jsonb)

## 🌐 Integração com API/Supabase

### Criação de Restaurante

#### Via API Route (`POST /api/restaurants`)
```javascript
const response = await fetch('/api/restaurants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

#### Via Supabase Client (Direto)
```javascript
import { createClient } from '@/libs/supabase/client';

const supabase = createClient();
const { data, error } = await supabase
  .from('restaurants')
  .insert(formData)
  .select()
  .single();
```

### Criação de Lista

#### Via API Route (`POST /api/lists`)
```javascript
const response = await fetch('/api/lists', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: formData.name,
    description: formData.description,
    is_public: formData.is_public,
    filters: formData.filters
  })
});
```

## ☁️ Upload de Imagens (Cloudinary)

### Utilitário: cloudinaryConverter.ts

```javascript
import { uploadToCloudinary } from '@/utils/cloudinaryConverter';

// Upload com retry
const imageUrl = await uploadToCloudinary(imageFile, {
  maxRetries: 3,
  delay: 1000
});

// Adicionar à array de menu_images
const updatedImages = [...formData.menu_images, imageUrl];
setFieldValue('menu_images', updatedImages);
```

**Validações:**
- Máximo 10 imagens de menu
- Formatos suportados: JPG, PNG, WebP
- Tamanho máximo: 10MB por imagem
- Transformações automáticas (otimização)

## ✅ Validação e Tratamento de Erros

### Validação de Campos

| Campo | Regra | Mensagem de Erro |
|-------|------|-------------------|
| `name` | Obrigatório, min 2 chars | "Nome é obrigatório" |
| `price_per_person` | > 0 se preenchido | "Preço deve ser positivo" |
| `rating` | 0-5 se preenchido | "Avaliação deve ser entre 0 e 5" |
| `menu_links` | Máximo 5 links | "Máximo 5 links de menu" |
| `menu_images` | Máximo 10 imagens | "Máximo 10 imagens de menu" |
| `source_url` | URL válida se preenchida | "URL inválida" |

### Tratamento de Erros na Submissão

```javascript
try {
  setIsSubmitting(true);
  const { data, error } = await supabase
    .from('restaurants')
    .insert(formData)
    .select()
    .single();

  if (error) {
    // Erro do Supabase (RLS, constraints, etc.)
    toast.error(`Erro: ${error.message}`);
    return;
  }

  // Sucesso
  toast.success('Restaurante criado com sucesso!');
  router.push(`/restaurants/${data.id}`);
} catch (err) {
  // Erro inesperado
  console.error('Erro ao criar restaurante:', err);
  toast.error('Erro inesperado. Tente novamente.');
} finally {
  setIsSubmitting(false);
}
```

## 🔄 Navegação Pós-Criação

### Restaurante
- **Sucesso**: Redireciona para `/restaurants/[id]`
- **Erro**: Permanece na página com erros exibidos

### Lista
- **Sucesso**: Redireciona para `/lists/[id]`
- **Erro**: Permanece na página com erros exibidos

## 🧪 Testes

### Testes de Formulário
```javascript
// __tests__/components/restaurant/RestaurantForm.test.jsx
describe('RestaurantForm', () => {
  it('validates required fields', () => { /* ... */ });
  it('submits form with valid data', () => { /* ... */ });
  it('displays error messages', () => { /* ... */ });
});
```

### Testes de Hook
```javascript
// __tests__/hooks/forms/useRestaurantForm.test.js
describe('useRestaurantForm', () => {
  it('initializes with default values', () => { /* ... */ });
  it('validates form data', () => { /* ... */ });
  it('submits data correctly', () => { /* ... */ });
});
```

## 📊 Estado Atual (2026-05-07)

- ✅ Página de criação de restaurantes implementada
- ✅ Página de criação de listas implementada
- ✅ Formulários com validação completa
- ✅ Upload de imagens para Cloudinary
- ✅ Integração com API routes e Supabase
- ✅ Hooks personalizados para formulários
- ✅ Tratamento de erros e feedback ao usuário
- ✅ Redirecionamento pós-criação
- ✅ Testes unitários para componentes e hooks

## 🔮 Melhorias Futuras

- [ ] Rascunhos automáticos (localStorage)
- [ ] Geolocalização automática via browser API
- [ ] Sugestão de tipos de cozinha baseada em ML
- [ ] Importação em lote via CSV/Excel
- [ ] Integração com Google Places API para autopreenchimento

---

*Última atualização: 2026-05-07*