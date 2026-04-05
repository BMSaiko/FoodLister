## Brief overview
  Regras de idioma para o código do projeto FoodLister (Next.js + Supabase).

## Convenções de idioma

### Frontend (português)
  - **Todo texto visível ao utilizador deve estar em português**
  - Isto inclui:
    - Mensagens de UI (botões, labels, placeholders, títulos)
    - Mensagens de erro e sucesso (toast, alertas, notificações)
    - Textos de confirmação e modais
    - Descrições e tooltips
  - Nomes de variáveis e funções relacionadas com UI podem ser em português
  - Exemplo: `handleEliminarLista`, `carregarRestaurantes`, `listaVazia`

### Backend e código técnico (inglês)
  - Nomes de ficheiros, rotas de API, funções de servidor
  - Queries SQL, migrations, tipos de base de dados
  - Logs, comentários técnicos, documentação de API
  - **Todas as mensagens de API visíveis ao cliente devem ser em inglês**
    - Mensagens de erro: `{ error: 'List not found' }`
    - Mensagens de sucesso: `{ message: 'List created successfully' }`
    - Validações: `{ error: 'Email is required' }`
  - Exemplo: `getUserLists`, `createRestaurant`, `handleDeleteError`

## Exemplos

### Correto (frontend)
```tsx
const handleEliminar = async () => {
  toast.success('Lista eliminada com sucesso!');
};
```

### Correto (backend)
```ts
export async function DELETE(req: NextRequest) {
  const { error } = await supabase.from('lists').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
}