# Deploy na Vercel (Guia Pratico)

Este guia documenta o processo completo para publicar a LP de vagas com seguranca.

## Objetivo

- Subir o projeto para GitHub sem expor segredos.
- Configurar a Vercel corretamente.
- Publicar com variaveis de ambiente por shopping (API + nome do site + logo e cores).

## 1) Antes de subir para GitHub

Checklist:

- `.env` deve estar no `.gitignore`.
- `.env.example` deve conter somente placeholders (sem senha real).
- Logos por shopping: arquivos em `public/logos/` (ex.: `palladium-curitiba.webp`) com nomes estaveis; commit no repo.
- Branding no ar (nome, logo, cores principais): via variaveis `VITE_MALL_*` na Vercel (ou no `.env` local); valores padrao ficam em `src/config/mall.ts` se voce nao definir nada.
- Garantir que nao ha segredo em nenhum arquivo versionado.

Recomendacao de seguranca:

- Se alguma senha/token ja foi compartilhada em conversa, rotacionar credenciais.

## 2) Subir para GitHub

Se ainda nao existir repositorio remoto:

```bash
git init
git add .
git commit -m "chore: prepare project for secure deploy"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

Se o repo ja existe, apenas `git add`, `git commit` e `git push`.

## 3) Importar projeto na Vercel

1. Acesse Vercel Dashboard.
2. Clique em `Add New...` -> `Project`.
3. Selecione o repositorio no GitHub.
4. Confirme configuracoes de build (Vite).
5. Continue para configurar variaveis de ambiente.

## 4) Como cadastrar variaveis na Vercel

Caminho:

- Projeto na Vercel -> `Settings` -> `Environment Variables`.

Importante:

- O campo **Name** recebe o nome da variavel.
- O campo **Value** recebe o valor real.

Exemplo:

- Name: `INTRANETMALL_API_BASE_URL`
- Value: `https://www.intranetmall.com/ApiVagasCurriculum/api`

### Variaveis obrigatorias (API + app)

- `INTRANETMALL_API_BASE_URL`
- `INTRANETMALL_LOGIN`
- `INTRANETMALL_PASSWORD`
- `INTRANETMALL_GROUP`
- `INTRANETMALL_SHOPPING_CODE`
- `VITE_PUBLIC_APP_URL`

### Variavel opcional (API)

- `INTRANETMALL_DB_ENTITY`

### Variaveis opcionais (WordPress + performance)

| Name | Quando usar |
|------|----------------|
| `WORDPRESS_LOJAS_BASE_URL` | **Novo shopping / outro WordPress.** URL da REST do CPT `loja` (ex.: `https://shoppingestacao.com.br/wp-json/wp/v2/loja`). **Nao** use a pagina publica `/lojas/` do site. Se omitir, o codigo assume Palladium Curitiba. |
| `WORDPRESS_LOJAS_CACHE_TTL_MS` | Opcional. Tempo em ms que a lista de lojas fica em cache no servidor (padrao 15 min). `0` desliga o cache (util em debug). |
| `INTRANETMALL_TOKEN_CACHE_TTL_MS` | Opcional. Tempo em ms do token de login na Intranet (padrao 12 min). `0` desliga. |

Observacao:

- O backend usa `INTRANETMALL_SHOPPING_CODE`.
- Se ela nao existir, usa `INTRANETMALL_DB_ENTITY` como fallback.

### Variaveis opcionais (nome do site, logo, cores)

Todas com prefixo `VITE_`: o Vite **injeta no build** do front. Cada projeto Vercel pode ter valores diferentes; apos mudar qualquer `VITE_*`, e obrigatorio **Redeploy** para o site refletir.

| Name | Exemplo de Value | Observacao |
|------|------------------|------------|
| `VITE_MALL_NAME` | `Palladium Curitiba` | Nome exibido (titulo da pagina, contexto do shopping). |
| `VITE_MALL_LOGO_URL` | `/logos/palladium-curitiba.webp` | Caminho comecando em `/` para arquivo em `public/logos/`, ou URL absoluta `https://...` (CDN). |
| `VITE_MALL_LOGO_ALT` | `Palladium Curitiba` | Texto alternativo do logo (acessibilidade). Se omitir, usa `VITE_MALL_NAME`. |
| `VITE_MALL_COLOR_PRIMARY` | `#3772FF` | Cor primaria (botoes, links). |
| `VITE_MALL_COLOR_HEADING` | `#111214` | Cor de titulos principais. |
| `VITE_MALL_COLOR_BACKGROUND` | `#FBFEFF` | Cor de fundo da aplicacao. |

Fluxo do logo no repositorio:

1. Coloque o arquivo em `public/logos/nome-do-arquivo.webp` (sem acentos no nome do arquivo evita dor de cabeca).
2. Faca push para o GitHub.
3. No projeto Vercel **desse** shopping, defina `VITE_MALL_LOGO_URL=/logos/nome-do-arquivo.webp` (o mesmo caminho que o navegador usaria na URL publica).

Exemplo completo para um shopping Curitiba:

- `VITE_MALL_NAME` = `Palladium Curitiba`
- `VITE_MALL_LOGO_URL` = `/logos/palladium-curitiba.webp`

Detalhe das chaves tambem esta comentado em `.env.example`.

### SEO / Open Graph / Twitter (SPA)

- O app e **Vite + React** (sem SSR): meta tags dinamicas sao aplicadas no **navegador** pelo componente `GlobalSeo` (`src/components/global-seo.tsx`), usando o **logo do shopping** (`VITE_MALL_LOGO_URL` ou o import padrao) como `og:image` e `twitter:image` com **URL absoluta** (`VITE_PUBLIC_APP_URL` + caminho).
- **Importante em producao:** defina `VITE_PUBLIC_APP_URL` com a URL publica final (ex.: `https://vagas.seudominio.com.br`) para previews no WhatsApp/LinkedIn/Facebook funcionarem. Sem isso, o fallback e `window.location.origin` (ok no browser, mas o build de preview offline pode falhar).
- Texto da **description** / OG / Twitter: padrao gerado com `VITE_MALL_NAME`, ou sobrescreva com `VITE_SEO_DESCRIPTION`. Opcional: `VITE_TWITTER_SITE`, `VITE_TWITTER_CREATOR` (handles com ou sem `@`).
- O `index.html` traz uma `<meta name="description">` generica para o HTML inicial; o JS substitui alinhado ao shopping apos carregar.

### WordPress — piso no card das vagas (o que foi implementado)

- **Comportamento:** na rota `/api/jobs`, alem das vagas da Intranet, o servidor busca as lojas publicadas no WordPress (endpoint REST `wp/v2/loja`), cruza o campo `NomeDaLoja` da vaga com titulo/slug da loja (e usa `numero-loja` do ACF so para desambiguar match), e envia em cada vaga o campo extra `storeFloorLabel` com o valor de **`piso-loja`** (somente o piso, sem numero no texto exibido).
- **Onde esta no codigo:** `server/wordpress-lojas.ts` (busca paginada + cache), `server/store-floor-from-wp.ts` (match + anexo do campo), `server/intranetmall.ts` (`fetchJobsPayloadWithWpFloors`), handlers em `api/jobs.ts` e `vite.config.ts` (dev), tipo `storeFloorLabel` em `src/features/jobs/types.ts` e uso em `src/features/jobs/normalizers.ts`. O card ja exibia "Piso"; agora prioriza esse dado quando existir.
- **WordPress:** cada loja precisa do ACF **`piso-loja`** preenchido para aparecer piso no card apos match. **`numero-loja`** ajuda no cruzamento quando o nome na Intranet traz codigo ou sufixo; nao e exibido no card.
- **Vagas `TipoVaga` administracao:** nao recebem piso vindo do guia de lojas (nome costuma nao ser loja).
- **Cache:** lista de lojas e token Intranet sao cacheados em memoria no processo do servidor (ver tabela acima). Ate expirar o TTL, uma loja **nova** no WP pode nao entrar no match; depois do refresh, passa a valer.

## 5) Deploy e redeploy

Depois de salvar as variaveis:

1. Execute o primeiro deploy.
2. Se alterar qualquer variavel depois, faca `Redeploy`.

Sem redeploy, a alteracao de env pode nao refletir na aplicacao.

## 6) Dominio

1. Vercel -> `Settings` -> `Domains`.
2. Adicione o dominio/subdominio final.
3. Ajuste DNS no provedor conforme instrucoes da Vercel.
4. Quando ficar valido, atualize `VITE_PUBLIC_APP_URL` para o dominio final.
5. Faca novo redeploy.

## 7) Validacao final em producao

Testar:

- Home abre corretamente.
- Logo e nome do shopping batem com o projeto (env `VITE_MALL_*`).
- Lista de vagas carrega.
- No card, **Piso** reflete o WordPress quando houver loja correspondente com `piso-loja`.
- Detalhe da vaga abre.
- QR Code aparece e funciona.

Se falhar carregamento de vagas:

- conferir `INTRANETMALL_*` na Vercel;
- conferir se fez redeploy apos mudar env;
- conferir valor correto do `INTRANETMALL_SHOPPING_CODE`.

Se o piso nao aparecer (mas as vagas carregarem):

- conferir `WORDPRESS_LOJAS_BASE_URL` (REST `.../wp-json/wp/v2/loja`, nao a URL `/lojas/`);
- conferir ACF `piso-loja` no WordPress e se o nome da loja na Intranet bate com o titulo/slug no WP;
- lembrar do cache de lojas (TTL); em duvida, aguarde o intervalo ou use `WORDPRESS_LOJAS_CACHE_TTL_MS=0` so para testar.

Se o logo nao aparecer ou estiver errado:

- conferir se o arquivo existe em `public/logos/` no commit que foi deployado;
- conferir `VITE_MALL_LOGO_URL` (caminho exato, com `/` no inicio para arquivos em `public/`);
- conferir redeploy apos alterar `VITE_*`.

## 8) Proximos shoppings (sem novo GitHub)

Voce pode manter o mesmo repositorio e repetir o fluxo.

Opcao operacional simples:

- 1 projeto Vercel por shopping (recomendado no inicio).
- mesmas chaves de env em cada projeto, com valores diferentes por shopping (incluindo `INTRANETMALL_*`, `VITE_MALL_*` e, quando nao for o WP padrao Curitiba, `WORDPRESS_LOJAS_BASE_URL`).

Exemplo:

- Projeto A: Curitiba -> envs de Curitiba + `VITE_MALL_LOGO_URL=/logos/palladium-curitiba.webp`
- Projeto B: Umuarama -> envs de Umuarama + logo correspondente em `public/logos/`
- Projeto C: Estacao -> envs de Estacao + logo correspondente em `public/logos/`

Novos logos: adicione o arquivo no repo em `public/logos/`, faca push, e aponte `VITE_MALL_LOGO_URL` no projeto certo na Vercel.

## 9) Regra de ouro de seguranca

- Nunca versionar login/senha/token.
- Segredos apenas em:
  - `.env` local (na maquina)
  - `Environment Variables` da Vercel
