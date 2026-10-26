"""
Versiona os arquivos do site para o navegador nunca usar cópias antigas.

Por que existe: o Safari (e o GitHub Pages, que guarda arquivos por ~10 min)
pode continuar usando versões antigas dos módulos JavaScript mesmo depois de
recarregar a página. Este script coloca no endereço de cada arquivo um
"carimbo" calculado a partir do conteúdo (ex.: atom-system.js?v=3f9a1c2b).
Arquivo alterado = carimbo novo = o navegador é obrigado a baixar de novo.

O que ele atualiza no index.html:
  - <link rel="stylesheet" href="css/style.css?v=...">
  - <script type="module" src="js/script.js?v=...">
  - <link rel="modulepreload" href="js/...?v=...">
  - o importmap: cada módulo local ganha uma entrada com o carimbo, assim os
    imports entre módulos (ex.: './modules/atom-system.js') também são
    redirecionados para a versão carimbada.

Uso (rodar sempre antes de salvar/publicar uma alteração):
  python3 tools/versionar.py
"""
import hashlib
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"

# Bibliotecas externas (mantidas como estão no importmap)
LIBS = {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js",
    "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm",
}


def stamp(path: pathlib.Path) -> str:
    return hashlib.sha1(path.read_bytes()).hexdigest()[:8]


def main() -> None:
    html = INDEX.read_text(encoding="utf-8")
    modules = sorted(p.relative_to(ROOT).as_posix() for p in (ROOT / "js").rglob("*.js"))
    stamps = {m: stamp(ROOT / m) for m in modules}

    # 1. Folha de estilos
    css = "css/style.css"
    html, n_css = re.subn(r'href="css/style\.css(\?v=[0-9a-f]*)?"', f'href="{css}?v={stamp(ROOT / css)}"', html)

    # 2. Ponto de entrada e pré-carregamentos dos módulos
    def versioned(match: re.Match) -> str:
        attr, path = match.group(1), match.group(2)
        return f'{attr}="{path}?v={stamps[path]}"' if path in stamps else match.group(0)

    html, n_js = re.subn(r'(src|href)="(js/[^"?]+\.js)(?:\?v=[0-9a-f]*)?"', versioned, html)

    # 3. Importmap: bibliotecas + cada módulo local apontando para a versão carimbada
    imports = dict(LIBS)
    for m in modules:
        imports[f"./{m}"] = f"./{m}?v={stamps[m]}"
    block = json.dumps({"imports": imports}, indent=2).replace("\n", "\n    ")
    html, n_map = re.subn(
        r'(<script type="importmap">\s*)\{.*?\}(\s*</script>)',
        lambda m: f"{m.group(1)}{block}{m.group(2)}",
        html,
        count=1,
        flags=re.S,
    )

    INDEX.write_text(html, encoding="utf-8")
    print(f"Versionado: {n_css} folha de estilos, {n_js} referências JS, importmap com {len(modules)} módulos ({n_map} bloco).")


if __name__ == "__main__":
    main()
