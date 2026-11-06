# Novo layout: History of Great Britain

Site estático, sem build. Funciona direto na Vercel com o preset **Other**.

## Estrutura

```
index.html         Página inicial: as 8 eras em capítulos
timeline.html      Os 526 eventos, com busca, filtro por era e ordem
rulers.html        Gráfico de reinados + lista por casa / por duração
houses.html        As 24 casas reais e nobres
legacy.html        Legado
bibliography.html  Fontes
about.html         Sobre
assets/style.css   Todo o visual (cores e fontes no topo, em :root)
assets/site.js     Busca, filtros, menu mobile, tooltip do gráfico
vercel.json        URLs limpas (/timeline, /rulers...) e redirecionamentos das URLs antigas
```

## Imagens

As páginas usam as mesmas imagens do site atual (`/img/events/...`, `/img/houses/...`,
`/img/british-history-intro.jpg`). Copie a pasta `img/` do site antigo para dentro desta pasta:

```
cp -r ~/sites/english-history.com/img ./img
```

Sem ela o site continua funcionando, com blocos coloridos no lugar das fotos.

## Testar localmente

```
python3 -m http.server 8000
```

Abra http://localhost:8000. As URLs limpas (`/timeline` sem `.html`) só funcionam na Vercel;
localmente use `/timeline.html`.

## Publicar

```
vercel        # preview
vercel --prod # produção
```

## Mudar cores e fontes

No começo de `assets/style.css`, em `:root`:
- `--paper`, `--ink`, `--accent`: fundo, texto e cor de destaque
- `--era-*`: a cor de cada era
- `--serif` / `--sans`: as fontes (carregadas do Google Fonts no `<head>` de cada página)
