# Intranet Mall — Relay

Ponte HTTP para os 12 sites WordPress (tema `tema-sorocaba`) conseguirem falar com a API
de vagas da Intranet Mall.

## Por que isso existe

Os servidores WordPress na Hostinger (hospedagem compartilhada) saem para a internet por
um IP (`147.79.88.25`) que a Intranet Mall bloqueia — timeout, não erro de credencial. Um
projeto irmão da UWEX na Vercel (`lp-vagas-uwex`, que atende `vagas.palladiumcuritiba.com.br`)
prova que a Vercel **não** é bloqueada: a mesma API responde normalmente a partir de lá.

Este repositório é uma cópia enxuta daquele projeto, mantendo só a parte de servidor
(`server/intranetmall.ts`: login, token, chamadas autenticadas) e trocando o front-end da
LP por três rotas que o tema WordPress já sabe chamar sozinho — não foi preciso mudar uma
linha do tema, ele já tem suporte a relay pronto
(`integracao/intranetmall-api.php`, função `intranetmall_relay()`).

## Modelo: um projeto Vercel por shopping

Cada shopping tem suas próprias credenciais (login, senha, grupo, código) já cadastradas
no ACF do respectivo site WordPress. Este mesmo repositório é publicado **uma vez por
shopping**, como um Vercel Project separado, com as variáveis de ambiente daquele
shopping — exatamente como o `lp-vagas-uwex` já é publicado várias vezes para diferentes
LPs (Curitiba, Estação, Ponta Grossa etc., ver `DEPLOY-VERCEL.md`).

Cada projeto:
- só enxerga as credenciais do seu próprio shopping (variável de ambiente);
- não recebe nem processa login/senha por header, mesmo que o WordPress mande (ele
  sempre manda, mas essas rotas ignoram e usam a própria variável de ambiente);
- só responde a quem apresentar a `RELAY_KEY` correta no header `x-relay-key`.

## Rotas

| Rota | Método | O que faz |
|---|---|---|
| `/api/vagas` | GET | Login + `BuscaVagas`, devolve o array cru |
| `/api/areas` | GET | Login + `Adm`, devolve o array cru (com `IdArea` e `Nome`) |
| `/api/curriculo` | POST | Login + `Curriculum`, repassa o corpo recebido |

Todas exigem o header `x-relay-key` com o valor de `RELAY_KEY`. Sem ele, ou com o valor
errado: `401`.

`api/jobs.ts` e o restante do app de LP (páginas React, `wordpress-lojas.ts`,
`store-floor-from-wp.ts`) não são usados por este relay — ficaram no repositório porque
vieram da cópia do `lp-vagas-uwex`, mas nada os chama.

## Variáveis de ambiente (por projeto/shopping)

```env
INTRANETMALL_LOGIN=usuario-do-shopping
INTRANETMALL_PASSWORD=senha-do-shopping
INTRANETMALL_GROUP=grupo-do-shopping
INTRANETMALL_SHOPPING_CODE=codigo-do-shopping
RELAY_KEY=uma-chave-forte-qualquer
```

`INTRANETMALL_LOGIN`/`PASSWORD`/`GROUP`/`SHOPPING_CODE` são os mesmos valores já
cadastrados hoje no painel ACF daquele site WordPress ("Usuário API vagas", "Senha API
vagas", "Grupo API vagas", "Shopping API vagas"). `RELAY_KEY` pode ser a mesma em todos
os 12 projetos — ela só autentica "isso veio do nosso WordPress", não isola credencial
por shopping (isso já é feito pela variável de ambiente do projeto).

## Rodar localmente

```bash
npm install
cp .env.example .env   # preencher com as credenciais de um shopping de teste
npm run dev
```

`npm run dev` sobe o Vite (front-end da LP, não usado aqui). Para testar as rotas de API
como a Vercel as executa, use a CLI da Vercel:

```bash
npx vercel dev
```

E teste com `curl`:

```bash
curl -H "x-relay-key: SEU_RELAY_KEY" http://localhost:3000/api/vagas
curl -H "x-relay-key: SEU_RELAY_KEY" http://localhost:3000/api/areas
curl -X POST -H "x-relay-key: SEU_RELAY_KEY" -H "Content-Type: application/json" \
  -d '{"Nome":"Teste","Email":"teste@teste.com","Celular":"11999999999","Curriculo":"","Curriculo_extensao":"pdf","IdVaga":1,"IdArea":1}' \
  http://localhost:3000/api/curriculo
```

## Publicar (Vercel)

Repetir para cada um dos 12 shoppings:

1. **New Project** na Vercel, importando este repositório.
2. Colar as 5 variáveis de ambiente daquele shopping (seção acima).
3. Deploy. A Vercel gera um domínio `algo.vercel.app` com HTTPS.
4. Testar as 3 rotas com `curl` (chave certa e chave errada) antes do próximo passo.

## Ligar o relay em cada site WordPress

No `wp-config.php` do site (via hPanel, FTP ou SSH da Hostinger), antes da linha
`/* That's all, stop editing! */`:

```php
define('INTRANETMALL_RELAY_URL', 'https://SEU-PROJETO-NA-VERCEL.vercel.app/api');
define('INTRANETMALL_RELAY_KEY', 'A_MESMA_RELAY_KEY_DO_PROJETO');
```

Depois:
1. Salvar a página de opções do tema no WP admin (limpa o cache de transients da
   integração).
2. Purgar o cache do LiteSpeed/Cloudflare do site.
3. Conferir `/trabalhe-conosco/` — vagas e áreas devem aparecer.

Para desligar o relay (por exemplo, quando a Intranet Mall liberar o IP da Hostinger),
basta remover essas duas linhas do `wp-config.php`.
