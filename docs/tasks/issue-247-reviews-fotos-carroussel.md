# Issue #247: Feature - Ao adicionar review deve dar para adicionar fotos

**GitHub Issue Link:** https://github.com/BMSaiko/FoodLister/issues/247

**Status:** Pending

---

## Overview

**Issue**: Ao adicionar review deve dar para adicionar fotos, tanto no restaurante carousel como no menu carousel, para dar display na pagina individual do restaurante.

**Translation**: When adding a review, it should be possible to add photos, both in the restaurant carousel and in the menu carousel, to display on the restaurant's individual page.

**Objective**: Enable users to upload and attach photos to their reviews, and display these photos in carousels on the restaurant's individual page.

---

## Types

### Database Schema Changes

The `reviews` table needs a new column to store image URLs:

```sql
-- Add images column to reviews table
ALTER TABLE reviews ADD COLUMN images TEXT[] DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN reviews.images IS 'Array of image URLs uploaded with the review';
```

### TypeScript Type Updates

**File**: `types/database.ts`

```typescript
// Update the reviews table interface
reviews: {
  Row: {
    id: string;
    restaurant_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    updated_at: string | null;
    images: string[] | null; // NEW FIELD
  };
  Insert: {
    id?: string;
    restaurant_id: string;
    user_id: string;
    rating: number;
    comment?: string | null;
    created_at?: string;
    updated_at?: string | null;
    images?: string[] | null; // NEW FIELD
  };
  Update: {
    id?: string;
    restaurant_id?: string;
    user_id?: string;
    rating?: number;
    comment?: string | null;
    created_at?: string;
    updated_at?: string | null;
    images?: string[] | null; // NEW FIELD
  };
}
```

### New Type Definitions (libs/types.ts)

```typescript
export interface ReviewImage {
  url: string;
  publicId: string; // Cloudinary public_id for deletion
  caption?: string;
  order: number; // order in carousel
}

export interface UploadReviewImagesResult {
  urls: string[];
  publicIds: string[];
}

export interface ReviewWithImages extends Review {
  images?: string[] | null;
}
```

---

## Files

### New Files to Create

1. **`supabase/migrations/YYYYMMDDHHMMSS_add_images_to_reviews.sql`** - Migration para adicionar coluna `images`
2. **`components/restaurant/ReviewImageUpload.tsx`** - Componente para upload de imagens na review
3. **`components/restaurant/ReviewImageCarousel.tsx`** - Carousel de imagens da review
4. **`components/restaurant/RestaurantImageCarousel.tsx`** - Carousel de imagens do restaurante (todas as reviews)
5. **`components/restaurant/MenuImageCarousel.tsx`** - Carousel de imagens do menu (todas as reviews)
6. **`hooks/data/useReviewImages.ts`** - Hook para gerir imagens da review
7. **`libs/image-upload.ts`** - Utilitários para upload de imagens (Cloudinary)
8. **`__tests__/components/restaurant/ReviewImageUpload.test.tsx`** - Testes de upload
9. **`__tests__/components/restaurant/ReviewImageCarousel.test.tsx`** - Testes do carousel
10. **`__tests__/hooks/data/useReviewImages.test.ts`** - Testes do hook
11. **`__tests__/libs/image-upload.test.ts`** - Testes de upload

### Existing Files to Modify

1. **`app/api/reviews/route.ts`**
   - Modificar POST para aceitar `images` array
   - Fazer upload das imagens para Cloudinary antes de salvar review
   - Retornar URLs das imagens no response

2. **`app/api/reviews/[id]/route.ts`**
   - Modificar PUT para atualizar `images`
   - Adicionar lógica para deletar imagens antigas do Cloudinary

3. **`components/restaurant/ReviewForm.tsx`** ou formulário de review
   - Adicionar componente `ReviewImageUpload`
   - Enviar imagens junto com dados da review

4. **`components/restaurant/ReviewCard.tsx`** ou card de review
   - Adicionar `ReviewImageCarousel` para exibir imagens da review
   - Mostrar indicador visual se review tem imagens

5. **`components/restaurant/RestaurantDetails.tsx`** ou página individual do restaurante
   - Adicionar `RestaurantImageCarousel` (todas as imagens de todas as reviews)
   - Adicionar `MenuImageCarousel` (imagens do menu de todas as reviews)

6. **`types/database.ts`**
   - Atualizar tipo `reviews` com campo `images`

7. **`libs/types.ts`**
   - Adicionar interfaces `ReviewImage`, `UploadReviewImagesResult`, `ReviewWithImages`

8. **`utils/cloudinaryConverter.ts`**
   - Reutilizar ou estender para upload de imagens de reviews
   - Adicionar função para deletar imagens

### Files to Delete
- Nenhum

---

## Functions

### New Functions

1. **`uploadReviewImages(files: File[], userId: string, reviewId?: string): Promise<UploadReviewImagesResult>`**
   - Location: `libs/image-upload.ts`
   - Purpose: Fazer upload de múltiplas imagens para Cloudinary
   - Returns: Promise com URLs e publicIds

2. **`deleteReviewImage(publicId: string): Promise<void>`**
   - Location: `libs/image-upload.ts`
   - Purpose: Deletar imagem do Cloudinary
   - Returns: Promise vazia

3. **`useReviewImages(reviewId?: string)`**
   - Location: `hooks/data/useReviewImages.ts`
   - Returns: `{ images, uploadImages, deleteImage, loading, error }`
   - Purpose: Hook para gerir imagens da review

4. **`ReviewImageUpload({ onUpload, maxImages, restaurantId }: { onUpload: (urls: string[]) => void, maxImages?: number, restaurantId: string })`**
   - Location: `components/restaurant/ReviewImageUpload.tsx`
   - Purpose: Componente de upload de imagens para review
   - Returns: JSX.Element

5. **`ReviewImageCarousel({ images, restaurantId }: { images: string[], restaurantId: string })`**
   - Location: `components/restaurant/ReviewImageCarousel.tsx`
   - Purpose: Carousel de imagens de uma review específica
   - Returns: JSX.Element

6. **`RestaurantImageCarousel({ restaurantId }: { restaurantId: string })`**
   - Location: `components/restaurant/RestaurantImageCarousel.tsx`
   - Purpose: Carousel com TODAS as imagens de TODAS as reviews do restaurante
   - Returns: JSX.Element

7. **`MenuImageCarousel({ restaurantId }: { restaurantId: string })`**
   - Location: `components/restaurant/MenuImageCarousel.tsx`
   - Purpose: Carousel com imagens do MENU de todas as reviews
   - Returns: JSX.Element

### Modified Functions

1. **`app/api/reviews/route.ts - POST handler`**
   - Modify: Aceitar `images` no body (array de File ou base64)
   - Add: Fazer upload para Cloudinary
   - Add: Salvar URLs no campo `images` da review
   - Add: Tratar erros de upload graciosamente

2. **`app/api/reviews/[id]/route.ts - PUT handler`**
   - Modify: Aceitar atualização de `images`
   - Add: Deletar imagens antigas do Cloudinary se removidas
   - Add: Fazer upload de novas imagens

3. **`components/restaurant/ReviewForm.tsx - onSubmit`**
   - Modify: Enviar imagens junto com dados da review
   - Add: Mostrar preview das imagens antes de submeter
   - Add: Loading state durante upload

---

## Classes
- Nenhuma classe nova (usando hooks e funções utilitárias seguindo o padrão do projeto)

---

## Dependencies

### New Packages
- **`cloudinary`** (se não estiver já instalado): `npm install cloudinary`
- **`@types/cloudinary`** para TypeScript: `npm install -D @types/cloudinary`
- **`react-slick`** ou **`swiper`** para carousels: `npm install react-slick slick-carousel`
- **`@types/react-slick`**: `npm install -D @types/react-slick`

### Version Changes
- Nenhuma alteração de versão obrigatória para pacotes existentes

---

## Testing

### New Test Files

1. **`__tests__/components/restaurant/ReviewImageUpload.test.tsx`**
   - Testar renderização do componente
   - Testar seleção de múltiplas imagens
   - Testar preview das imagens
   - Testar remoção de imagens
   - Testar limite de imagens (maxImages)

2. **`__tests__/components/restaurant/ReviewImageCarousel.test.tsx`**
   - Testar renderização do carousel
   - Testar navegação (próximo/anterior)
   - Testar estado vazio (sem imagens)
   - Testar lightbox/expansão da imagem

3. **`__tests__/hooks/data/useReviewImages.test.ts`**
   - Testar upload de imagens
   - Testar delete de imagem
   - Testar estados de loading e erro
   - Mock do Cloudinary

4. **`__tests__/libs/image-upload.test.ts`**
   - Testar `uploadReviewImages`
   - Testar `deleteReviewImage`
   - Mock do Cloudinary SDK

### Existing Test Modifications
- Atualizar testes de API de reviews (`__tests__/api/reviews.test.ts`) para cobrir campo `images`
- Atualizar testes de ReviewForm para cobrir upload de imagens

---

## Implementation Order

1. **Database Migration**
   - Criar migration `supabase/migrations/YYYYMMDDHHMMSS_add_images_to_reviews.sql`
   - Adicionar coluna `images TEXT[]` à tabela `reviews`
   - Executar migration no Supabase

2. **Update Types**
   - Atualizar `types/database.ts` com novo campo
   - Adicionar interfaces a `libs/types.ts`
   - Verificar se tipos estão corretos com `npm run build`

3. **Create Image Upload Utilities**
   - Criar `libs/image-upload.ts`
   - Implementar `uploadReviewImages` usando Cloudinary
   - Implementar `deleteReviewImage`
   - Reutilizar lógica de `utils/cloudinaryConverter.ts` se possível
   - Testar isoladamente

4. **Create Custom Hook**
   - Criar `hooks/data/useReviewImages.ts`
   - Seguir padrão dos hooks existentes
   - Testar hook isoladamente

5. **Create UI Components**
   - Criar `ReviewImageUpload.tsx` com preview e drag-and-drop
   - Criar `ReviewImageCarousel.tsx` para imagens da review
   - Criar `RestaurantImageCarousel.tsx` para todas as imagens do restaurante
   - Criar `MenuImageCarousel.tsx` para imagens do menu
   - Usar biblioteca de carousel (react-slick ou swiper)

6. **Update Review Form**
   - Modificar formulário de review existente
   - Integrar `ReviewImageUpload`
   - Enviar imagens no submit
   - Mostrar loading durante upload

7. **Update API Routes**
   - Modificar `app/api/reviews/route.ts` (POST)
   - Modificar `app/api/reviews/[id]/route.ts` (PUT)
   - Adicionar lógica de upload e delete de imagens
   - Atualizar validação

8. **Update Restaurant Page**
   - Modificar página individual do restaurante
   - Adicionar `RestaurantImageCarousel` (todas as imagens)
   - Adicionar `MenuImageCarousel` (imagens do menu)
   - Posicionar carousels estrategicamente no layout

9. **Update Review Cards**
   - Modificar cards de review
   - Adicionar `ReviewImageCarousel` se review tem imagens
   - Mostrar indicador de quantas imagens a review tem

10. **Testing**
    - Criar testes para novos componentes
    - Criar testes para novo hook
    - Criar testes para utilitários
    - Atualizar testes existentes
    - Executar `npm test` e garantir que todos passam

11. **Final Validation**
    - Executar `npm run lint` - 0 erros
    - Executar `npm run build` - exit code 0
    - Executar `npm test` - todos os testes passam
    - Fazer commit: `feat(reviews): add photo upload and carousels to reviews`

---

## Acceptance Criteria Checklist

- [ ] Utilizadores podem adicionar fotos ao criar uma review
- [ ] Múltiplas fotos podem ser adicionadas (limite configurável, ex: 5 fotos)
- [ ] Fotos são exibidas em um carousel na review individual
- [ ] Todas as fotos de todas as reviews são exibidas em um carousel no restaurante (Restaurant Carousel)
- [ ] Fotos do menu de todas as reviews são exibidas em um carousel no restaurante (Menu Carousel)
- [ ] Upload de imagens para Cloudinary funcional
- [ ] Preview das imagens antes de submeter a review
- [ ] Possibilidade de remover imagens antes de submeter
- [ ] Imagens são deletadas do Cloudinary se removidas da review
- [ ] Carousels são responsivos (mobile e desktop)
- [ ] Testes unitários para novas funcionalidades
- [ ] Documentação atualizada (memory-bank/)