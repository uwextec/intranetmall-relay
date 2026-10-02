# Intranet Mall — Relay

Ponte HTTP para os 12 sites WordPress (tema `tema-sorocaba`) conseguirem falar com a API
de vagas da Intranet Mall. É só backend — não tem página nenhuma, só as rotas abaixo.

## Por que isso existe

Os servidores WordPress na Hostinger (hospedagem compartilhada) saem para a internet por
um IP (`147.79.88.25`) que a Intranet Mall bloqueia — timeout, não erro de credencial. Um
projeto irmão da UWEX na Vercel (`lp-vagas-uwex`, que atende `vagas.palladiumcuritiba.com.br`)
prova que a Vercel **não** é bloqueada. Este repositório expõe, na Vercel, as mesmas
chamadas que aquele projeto faz — sem front-end, sem uma LP por trás, só a API.

O tema WordPress já sabe chamar um relay sem precisar de nenhuma alteração
(`integracao/intranetmall-api.php`, função `intranetmall_relay()`).

## Um projeto só, para os 12 shoppings

Cada site WordPress já manda, em toda chamada, as credenciais do seu próprio shopping
(login, senha, grupo, código) pelos headers `x-login`/`x-senha`/`x-grupo`/`x-shopping`
(função `intranetmall_relay_headers()` do tema). Este relay lê esses headers em vez de ter
credencial fixa — por isso **um único deploy atende todos os 12 sites**. Não precisa criar
um projeto Vercel por shopping.

O que o relay guarda no servidor é só uma coisa: a `RELAY_KEY`, que confirma que a chamada
veio do WordPress e não de um visitante qualquer.

## Rotas

| Rota | Método | Headers exigidos | O que faz |
|---|---|---|---|
| `/api/vagas` | GET | `x-relay-key`, `x-login`, `x-senha`, `x-grupo`, `x-shopping` | Login + `BuscaVagas`, devolve o array cru |
| `/api/areas` | GET | idem | Login + `Adm`, devolve o array cru (com `IdArea` e `Nome`) |
| `/api/curriculo` | POST | idem + `Content-Type: application/json` | Login + `Curriculum`, repassa o corpo recebido |
| `/api/sac` | POST | idem + `Content-Type: application/json` | Login + `Sac`, repassa o contato do Fale Conosco (`Nome`, `Email`, `Telefone`, `Observacoes`) |

Sem `x-relay-key` correta: `401`. Com a chave certa mas sem as credenciais do shopping:
`400`. O token de login é cacheado em memória por shopping (12 min), então dois sites não
disputam o mesmo token.

## Variável de ambiente (uma só, no projeto Vercel)

```env
RELAY_KEY=uma-chave-forte-qualquer
```

Veja `.env.example` para as opcionais (base da API, TTL do cache de token).

## Rodar localmente

```bash
npm install
cp .env.example .env   # preencher RELAY_KEY
npx vercel dev
```

Testar com `curl` (troque pelas credenciais de um shopping de teste):

```bash
curl -H "x-relay-key: SEU_RELAY_KEY" \
  -H "x-login: LOGIN" -H "x-senha: SENHA" -H "x-grupo: GRUPO" -H "x-shopping: SHOPPING" \
  http://localhost:3000/api/vagas
```

## Publicar (Vercel)

1. **New Project** na Vercel, importando este repositório — uma vez só.
2. Variável de ambiente: `RELAY_KEY`.
3. Deploy. A Vercel gera um domínio `algo.vercel.app` com HTTPS.
4. Testar as 3 rotas com `curl` (chave certa e chave errada) antes do próximo passo.

## Ligar o relay em cada um dos 12 sites WordPress

No `wp-config.php` do site (via hPanel, FTP ou SSH da Hostinger), antes da linha
`/* That's all, stop editing! */` — **as mesmas duas linhas em todos os 12 sites**,
mudando só o domínio se um dia existir mais de um deploy:

```php
define('INTRANETMALL_RELAY_URL', 'https://SEU-PROJETO-NA-VERCEL.vercel.app/api');
define('INTRANETMALL_RELAY_KEY', 'A_MESMA_RELAY_KEY_DO_PROJETO');
```

Depois, em cada site:
1. Salvar a página de opções do tema no WP admin (Empreendimento → API Vagas → Salvar) —
   limpa o cache de transients da integração.
2. Purgar o cache do LiteSpeed/Cloudflare do site.
3. Conferir `/trabalhe-conosco/` — vagas e áreas devem aparecer.

Para desligar o relay (por exemplo, quando a Intranet Mall liberar o IP da Hostinger),
basta remover essas duas linhas do `wp-config.php` daquele site.
