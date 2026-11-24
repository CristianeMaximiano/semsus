#!/usr/bin/env python3
"""Monta as páginas do site SEMSUS: cabeçalho e rodapé comuns + o conteúdo de pages/*.html.

Cada arquivo em pages/ começa com um bloco de metadados:
<!--
title: Título da página
description: Descrição para o Google
script: /js/arquivo.js   (opcional, pode repetir)
-->
O resultado vai para dist/, junto com styles.css e js/.
"""
import pathlib
import re
import shutil

ROOT = pathlib.Path(__file__).parent
DIST = ROOT / "dist"
SITE_NAME = "SEMSUS"

NAV = [
    ("/index.html", "Início"),
    ("/como-funciona.html", "Como funciona"),
    ("/industrias.html", "Para indústrias"),
    ("/artesaos.html", "Artesãos"),
    ("/calculadora.html", "Calculadora de impacto"),
    ("/sobre.html", "Sobre"),
]

HEAD = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="SEMSUS">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#2e6b34">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='30' fill='%232e6b34'/%3E%3Cpath d='M20 38c0-12 10-20 24-20-2 14-10 24-22 24' fill='none' stroke='%23f6f2e9' stroke-width='5' stroke-linecap='round'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/index.html">SEM<span>SUS</span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav class="nav" id="nav" aria-label="Principal">
{nav}
      <a class="btn" href="/contato.html">Fale conosco</a>
    </nav>
  </div>
</header>
<main>
"""

FOOT = """</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="cols">
      <div>
        <a class="brand" href="/index.html">SEMSUS</a>
        <p style="margin-top:12px">Seja + Sustentável. Economia circular que conecta resíduo industrial, artesãos e consumo consciente, com rastreabilidade do lote ao produto.</p>
      </div>
      <div>
        <strong style="color:#f6f2e9">Para quem</strong>
        <ul style="margin-top:12px">
          <li><a href="/industrias.html">Indústrias</a></li>
          <li><a href="/artesaos.html">Artesãos e cooperativas</a></li>
          <li><a href="/calculadora.html">Calculadora de impacto</a></li>
        </ul>
      </div>
      <div>
        <strong style="color:#f6f2e9">SEMSUS</strong>
        <ul style="margin-top:12px">
          <li><a href="/como-funciona.html">Como funciona</a></li>
          <li><a href="/sobre.html">Sobre e equipe</a></li>
          <li><a href="/contato.html">Contato</a></li>
        </ul>
      </div>
      <div>
        <strong style="color:#f6f2e9">Onde estamos</strong>
        <p style="margin-top:12px">Grande ABC Paulista, SP</p>
      </div>
    </div>
    <p class="legal">© SEMSUS. Economia circular com rastreabilidade de ponta a ponta.</p>
  </div>
</footer>
<script type="module" src="/js/site.js"></script>
{scripts}
</body>
</html>
"""


def build():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    shutil.copy(ROOT / "styles.css", DIST / "styles.css")
    shutil.copytree(ROOT / "js", DIST / "js")
    nav = "\n".join(f'      <a href="{href}">{label}</a>' for href, label in NAV)
    for page in sorted((ROOT / "pages").glob("*.html")):
        text = page.read_text(encoding="utf-8")
        m = re.match(r"\s*<!--(.*?)-->\s*", text, re.S)
        meta, body = {}, text
        scripts = []
        if m:
            for line in m.group(1).strip().splitlines():
                k, _, v = line.partition(":")
                k, v = k.strip(), v.strip()
                if k == "script":
                    scripts.append(v)
                elif k:
                    meta[k] = v
            body = text[m.end():]
        title = meta.get("title", SITE_NAME)
        html = HEAD.format(title=title, description=meta.get("description", ""), nav=nav)
        html += body
        html += FOOT.format(scripts="\n".join(f'<script type="module" src="{s}"></script>' for s in scripts))
        (DIST / page.name).write_text(html, encoding="utf-8")
        print("ok", page.name)


if __name__ == "__main__":
    build()
