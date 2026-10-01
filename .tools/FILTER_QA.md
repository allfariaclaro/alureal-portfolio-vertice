# Validação de filtros — 2026-10-01

Base: 47d9e5331827282bac388ca7eaafa10005973dd2. Branch: fix/listing-filter-state.

- `node --check vertice-app.js`: passou.
- `node tests/filters.test.cjs`: 4 testes passaram (teto, filtros combinados, serialização/limpeza, allowlist).
- `node --test tests/*.test.cjs`: passou.
- `git diff --check`: passou.
- Chromium headless real, Playwright, 1440×1000 e 390×844: ambos passaram.
- Fluxos: home Pinheiros/Casa => Pátio; teto 6000000 => zero; 6200000 => Pátio; quartos/palavra-chave combinados; contagem/vazio; reload; voltar/avançar; detalhe/retorno; limpeza não reintroduz critérios; favoritos entre páginas; cliques repetidos; Alameda/Pátio na comparação; claro/escuro; sem overflow horizontal ou pageerrors.
- Fotos/fontes externas bloqueadas por roteamento no QA local; nenhum formulário pessoal, visita, contato ou financiamento foi acionado.
- Capturas locais: /tmp/vertice-{desktop,mobile}-{light,dark}.png. Mobile escuro inspecionado visualmente.
- Reproduzir: com Playwright disponível, `node tests/browser-qa.cjs`. Aceita CHROMIUM_PATH se o binário padrão não estiver disponível. O script serve apenas o checkout local em porta aleatória loopback.

Limites: sandbox bloqueou sockets/Chromium; execução escalada autorizada resolveu. A porta 8765 estava ocupada; não alteramos o processo existente e usamos porta aleatória. O binário instalado era revisão 1243, enquanto Playwright esperava 1234; usado binário existente explicitamente, sem instalação. Produção não foi alterada ou validada com o novo código.

CI: workflow PR separado, apenas contents: read; deploy-pages.yml intacto, sem gatilho PR.
