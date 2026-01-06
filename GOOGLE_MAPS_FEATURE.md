# Feature: Google Maps Integration

## Descrição
Esta feature permite extrair informações de um restaurante diretamente de um link do Google Maps durante o processo de criação de um novo restaurante na webapp.

## Como Funciona

### 1. **Abrir a Feature**
Ao clicar em "Adicionar Novo Restaurante" (rota `/restaurants/create`), você verá um botão "Google Maps" ao lado do campo de Nome.

### 2. **Adicionar Link do Google Maps**
- Clique no botão "Google Maps"
- Uma modal irá abrir pedindo para colar o link
- No Google Maps, encontre o restaurante desejado
- Clique no nome do restaurante para abrir o card
- Copie a URL do navegador
- Cola no campo de input da modal

### 3. **Extrair Informações**
- Clique em "Extrair Informações"
- O sistema irá processar o link e extrair:
  - **Nome** do restaurante
  - **Endereço/Localização** (coordenadas ou endereço)
  - **URL do Google Maps** (como fonte)

### 4. **Confirmar e Usar**
- Revise as informações extraídas
- Clique em "Confirmar e Usar"
- Os dados serão automaticamente preenchidos no formulário:
  - Campo "Nome" recebe o nome do restaurante
  - Campo "Localização" recebe as coordenadas ou endereço
  - Campo "Fonte" recebe o link do Google Maps

## Arquivos Criados/Modificados

### Novos Arquivos:
- **`utils/googleMapsExtractor.ts`**: Funções utilitárias para extrair dados do Google Maps
  - `extractGoogleMapsData()`: Extrai informações do URL
  - `isValidGoogleMapsUrl()`: Valida se é um link válido
  - `formatLocationString()`: Formata a string de localização
  - Interface `GoogleMapsData`: Define a estrutura dos dados extraídos

- **`components/ui/GoogleMapsModal.tsx`**: Componente modal para adicionar link do Google Maps
  - Validação de URL
  - Exibição de informações extraídas
  - Confirmação antes de aplicar os dados

### Arquivos Modificados:
- **`components/pages/CreateRestaurant.jsx`**: 
  - Importação do GoogleMapsModal
  - Importação da função extractGoogleMapsData
  - Adição do estado `googleMapsModalOpen`
  - Função `handleGoogleMapsData` para processar dados extraídos
  - Botão "Google Maps" ao lado do campo Nome
  - Integração do componente GoogleMapsModal no render

## Formatos de URL Suportados

A função de extração suporta vários formatos de URLs do Google Maps:

1. **URL padrão com place**: `https://www.google.com/maps/place/Restaurant+Name/@lat,lng`
2. **URL com coordenadas**: `https://www.google.com/maps/@lat,lng,zoom`
3. **URL com query**: `https://www.google.com/maps?q=Restaurant`
4. **URLs de compartilhamento**: Links copiadas diretamente do Google Maps

## Tratamento de Erros

- ❌ URL inválida: Exibe mensagem de erro
- ❌ Dados incompletos: Avisa que algumas informações não puderam ser extraídas
- ✅ Sucesso: Mostra os dados extraídos para confirmação

## Fluxo Completo

```
Clicar em "Google Maps" 
    ↓
Modal abre para colar URL
    ↓
Usuário cola link do Google Maps
    ↓
Clica "Extrair Informações"
    ↓
Sistema valida e extrai dados
    ↓
Exibe dados extraídos para revisão
    ↓
Usuário clica "Confirmar e Usar"
    ↓
Dados são preenchidos no formulário
    ↓
Modal fecha
    ↓
Usuário continua preenchendo o resto do formulário
    ↓
Salva o restaurante
```

## Notas Técnicas

- A extração funciona **sem necessidade de API keys** do Google
- Os dados são extraídos **apenas do URL**, analisando seus parâmetros
- A validação é básica mas eficaz para URLs do Google Maps
- Os dados extraídos podem ser editados no formulário antes de salvar
- A URL do Google Maps é automaticamente salva no campo "Fonte"
