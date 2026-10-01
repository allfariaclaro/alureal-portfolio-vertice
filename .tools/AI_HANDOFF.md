# Filtros Vértice — 2026-10-01
ESCOPO: filtros existentes e label imediato de favorito. PR draft, sem merge/deploy.
NÃO FAZER: DNS, catálogo/preços/dados, contatos, financiamento, outros projetos.
FEITO: clone isolado; branch fix/listing-filter-state; leitura regras globais; código auditado.
TESTADO: estado base 47d9e5331827282bac388ca7eaafa10005973dd2; controles sem listeners, faixa descartada.
PENDENTE: implementação, testes Node, QA navegador, PR draft/checks.
PRÓXIMO PASSO: sincronizar estado com URL e inputs.
ARQUIVOS ALTERADOS: este checkpoint.
SERVIÇOS: nenhum iniciado; nada publicado.
BACKUP/ROLLBACK: ../vertice-base.bundle; base preservada em main.
ITENS QUE NÃO DEVEM SER REPETIDOS: clone sandbox sem rede falhou; clone escalado autorizado funcionou.
MODELO: solicitado 6.1 Sol Medium / Fast off; efetivo não comprovado por metadados.

ETAPA VALIDADA: estado único na URL para bairro/tipo/precoMax/quartos/q, home transmite teto, limpar/vazio/contagem, retorno relativo allowlist, label favorito imediato e handlers substituídos sem duplicação.
ARQUIVOS: vertice-app.js, index.html, imoveis.html, imovel.html, tests, .github/workflows/pr-checks.yml, .tools.
TESTADO: 4 regressões Node; sintaxe/diff; Chromium desktop/mobile com todos os fluxos e temas (detalhes em FILTER_QA.md).
PENDENTE: commit/push, PR draft, verificar CI. Nada publicado; deploy não modificado.
PRÓXIMO PASSO: commit e criar PR draft; registrar HEAD/PR/checks.
