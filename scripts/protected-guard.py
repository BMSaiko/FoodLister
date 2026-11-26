#!/usr/bin/env python3
"""Falha se um diff tocar ficheiros protegidos (lista em .kaizen/protegidos.txt).

Uso: python3 scripts/protected-guard.py <base-ref> [head-ref]
Linhas da lista: nomes exatos ou padroes fnmatch; '#' comenta.
"""
import fnmatch
import subprocess
import sys
from pathlib import Path


def padroes(raiz: Path) -> list[str]:
    ficheiro = raiz / ".kaizen" / "protegidos.txt"
    if not ficheiro.is_file():
        return []
    linhas = (ln.strip() for ln in ficheiro.read_text(encoding="utf-8").splitlines())
    return [ln for ln in linhas if ln and not ln.startswith("#")]


def alterados(base: str, head: str) -> list[str]:
    out = subprocess.run(
        ["git", "diff", "--name-only", f"{base}...{head}"],
        check=True, capture_output=True, text=True,
    ).stdout
    return [ln for ln in out.splitlines() if ln]


def tocados(ficheiros: list[str], pads: list[str]) -> list[str]:
    return [f for f in ficheiros if any(fnmatch.fnmatch(f, p) for p in pads)]


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(__doc__)
        return 2
    base, head = argv[1], (argv[2] if len(argv) > 2 else "HEAD")
    raiz = Path(subprocess.run(["git", "rev-parse", "--show-toplevel"], check=True,
                               capture_output=True, text=True).stdout.strip())
    hits = tocados(alterados(base, head), padroes(raiz))
    if hits:
        print("Ficheiros protegidos alterados:")
        for h in hits:
            print(f"  - {h}")
        return 1
    print("protected-guard: ok")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
