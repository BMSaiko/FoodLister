// Exemplos de URLs do Google Maps que a função pode processar:

// Exemplo 1: URL com nome e coordenadas
const url1 = "https://www.google.com/maps/place/Restaurante+Bella+Italia/@41.3851,2.1734,15z/data=!4m6!3m5!1s0x12a49...";
// Resultado esperado:
// {
//   name: "Restaurante Bella Italia",
//   latitude: 41.3851,
//   longitude: 2.1734,
//   location: "41.3851, 2.1734",
//   source_url: "https://www.google.com/maps/place/Restaurante+Bella+Italia/@41.3851,2.1734,15z/data=!4m6!3m5!1s0x12a49..."
// }

// Exemplo 2: URL com query parameter
const url2 = "https://www.google.com/maps?q=Pizza+Place+Barcelona";
// Resultado esperado:
// {
//   address: "Pizza Place Barcelona",
//   location: "Pizza Place Barcelona",
//   source_url: "https://www.google.com/maps?q=Pizza+Place+Barcelona"
// }

// Exemplo 3: URL com apenas coordenadas
const url3 = "https://www.google.com/maps/@41.3851,2.1734,17z";
// Resultado esperado:
// {
//   latitude: 41.3851,
//   longitude: 2.1734,
//   location: "41.3851, 2.1734",
//   source_url: "https://www.google.com/maps/@41.3851,2.1734,17z"
// }

// Como usar a função no código:
import { extractGoogleMapsData, isValidGoogleMapsUrl } from '@/utils/googleMapsExtractor';

const googleMapsUrl = "https://www.google.com/maps/place/...";

// Verificar se é uma URL válida
if (isValidGoogleMapsUrl(googleMapsUrl)) {
  // Extrair dados
  const data = extractGoogleMapsData(googleMapsUrl);
  
  console.log(data);
  // {
  //   name?: string,
  //   address?: string,
  //   location?: string,
  //   latitude?: number,
  //   longitude?: number,
  //   source_url: string
  // }
} else {
  console.error("URL inválida");
}
