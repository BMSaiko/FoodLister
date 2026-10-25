import type { RestaurantWithDetails } from "@/libs/types";

const TOVI = ["a-celebrar", "a-dormir", "a-pensar", "a-piscar-o-olho", "apaixonada", "feliz", "fixe", "surpreendida", "triste", "zangada"];

// Emote do Tovi estável por restaurante (hash do id, não muda a cada render)
export function toviFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return `/mascot/tovi-${TOVI[h % TOVI.length]}.svg`;
}

// Imagem principal do restaurante, ou um Tovi se não houver
export function thumbFor(r: RestaurantWithDetails): string {
  const img = r.images?.[r.display_image_index ?? 0] || r.images?.[0] || "";
  return img.startsWith("http") || img.startsWith("/") ? img : toviFor(r.id);
}
