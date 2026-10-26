import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../..')
const css = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8')

const states = ['arrow', 'pointer', 'text', 'wait', 'not-allowed', 'grab', 'grabbing', 'spin']
const themes = ['dark', 'light']

describe('cursores personalizados', () => {
  it.each(states)('define o token --cursor-%s com fallback nativo', (state) => {
    const re = new RegExp(String.raw`--cursor-${state}:\s*url\("/cursors/dark/${state}\.svg"\)\s+\d+\s+\d+,\s*[a-z-]+;`)
    expect(css).toMatch(re)
  })

  it.each(states)('o token --cursor-%s tem variante clara em [data-theme="light"]', (state) => {
    expect(css).toMatch(new RegExp(String.raw`--cursor-${state}:\s*url\("/cursors/light/${state}\.svg"\)`))
  })

  it.each(themes.flatMap((t) => states.map((s) => [t, s])))('existe public/cursors/%s/%s.svg', (theme, state) => {
    expect(fs.existsSync(path.join(root, `public/cursors/${theme}/${state}.svg`))).toBe(true)
  })

  it('só aplica os cursores com @media (pointer: fine)', () => {
    const m = css.match(/@media \(pointer: fine\)\s*\{([\s\S]*?)\n\}/)
    expect(m).not.toBeNull()
    const block = m![1]
    expect(block).toMatch(/cursor:\s*var\(--cursor-arrow\)/)
    expect(block).toMatch(/cursor:\s*var\(--cursor-pointer\)/)
    expect(block).toMatch(/cursor:\s*var\(--cursor-text\)/)
    expect(block).toMatch(/cursor:\s*var\(--cursor-not-allowed\)/)
    expect(block).toMatch(/cursor:\s*var\(--cursor-wait\)/)
  })

  it('não usa cursores personalizados fora do @media (pointer: fine)', () => {
    const outside = css.replace(/@media \(pointer: fine\)\s*\{[\s\S]*?\n\}/, '')
    expect(outside).not.toMatch(/cursor:\s*var\(--cursor-/)
  })

  it('sobrepõe os cursores do Leaflet (arrastar do mapa)', () => {
    const block = css.match(/@media \(pointer: fine\)\s*\{([\s\S]*?)\n\}/)![1]
    expect(block).toMatch(/\.leaflet-container\.leaflet-grab[^{]*\{\s*cursor:\s*var\(--cursor-grab\)/)
    expect(block).toMatch(/\.leaflet-dragging[^{]*\{\s*cursor:\s*var\(--cursor-grabbing\)/)
  })

  it('a roleta usa .cursor-spin enquanto roda', () => {
    const src = fs.readFileSync(path.join(root, 'components/ui/RestaurantList/RestaurantRoulette.tsx'), 'utf8')
    expect(src).toMatch(/spinning \? ['"`][^'"`]*cursor-spin/)
  })
})
