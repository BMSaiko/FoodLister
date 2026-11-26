/** Categorias das notas de release (Keep a Changelog → PT). */
export type ReleaseCategory = 'novo' | 'melhorado' | 'corrigido'

export type ReleaseItems = Record<ReleaseCategory, string[]>

export interface ReleaseNote {
  /** Semver sem prefixo `v` (ex.: `1.2.0`). */
  version: string
  /** Data ISO `YYYY-MM-DD`, ou `null` se o CHANGELOG não a indica. */
  releasedAt: string | null
  /** Título em PT (por defeito `Versão X.Y.Z`). */
  title: string
  items: ReleaseItems
}
