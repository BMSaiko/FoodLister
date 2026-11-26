import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location("pg", Path(__file__).with_name("protected-guard.py"))
pg = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(pg)


def test_tocados_exato_e_glob():
    pads = ["AGENTS.md", ".env*"]
    assert pg.tocados(["AGENTS.md", "src/a.py", ".env.local"], pads) == ["AGENTS.md", ".env.local"]


def test_sem_padroes(tmp_path):
    assert pg.padroes(tmp_path) == []


def test_padroes_ignora_comentarios(tmp_path):
    (tmp_path / ".kaizen").mkdir()
    (tmp_path / ".kaizen" / "protegidos.txt").write_text("# c\n\nCLAUDE.md\n", encoding="utf-8")
    assert pg.padroes(tmp_path) == ["CLAUDE.md"]
