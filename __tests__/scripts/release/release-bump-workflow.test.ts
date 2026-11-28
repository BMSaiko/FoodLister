import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const raiz = join(__dirname, '../../..')
const bump = readFileSync(join(raiz, '.github/workflows/release-bump.yml'), 'utf8')
const ci = readFileSync(join(raiz, '.github/workflows/ci.yml'), 'utf8')

describe('release-bump.yml', () => {
  it('corre à mão e em PR para main', () => {
    expect(bump).toMatch(/workflow_dispatch:/)
    expect(bump).toMatch(/pull_request:\s*\n\s+branches: \[main\]/)
  })
  it('permissões mínimas', () => {
    expect(bump).toMatch(/permissions:\s*\n\s+contents: write\s*\n\s+pull-requests: write\s*\n\s+actions: write/)
  })
  it('usa o script de bump com a base main', () => {
    expect(bump).toContain('node scripts/release/bump-version.mjs --base origin/main')
  })
  it('só publica se houver alterações e nunca empurra para dev/main', () => {
    expect(bump).toContain('git diff --quiet')
    expect(bump).not.toMatch(/git push[^\n]*\b(dev|main)\b(?!-)/)
    expect(bump).toContain('release-bump/auto')
  })
  it('abre o PR para dev e dispara o CI no ramo do bump', () => {
    expect(bump).toContain('gh pr create --base dev')
    expect(bump).toContain('gh workflow run ci.yml --ref "$RAMO"')
  })
  it('sem atribuição a agentes', () => {
    expect(bump).not.toMatch(/Co-Authored-By|Generated with/i)
  })
})

describe('ci.yml', () => {
  it('aceita workflow_dispatch para o PR de bump (GITHUB_TOKEN não dispara pull_request)', () => {
    expect(ci).toMatch(/workflow_dispatch:/)
  })
})
