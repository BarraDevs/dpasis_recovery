# Integração frontend — CRUD de produtos

Cadastro administrativo de produtos. Não existe rota `user/`. Valores de custo e preço vão em **centavos inteiros**.

## Base URL admin

JWT de admin. Subject CASL: `product`.

| Método | Rota | Claim |
|---|---|---|
| `POST` | `/admin/product` | `PRODUCT_WRITE` |
| `GET` | `/admin/product` | `PRODUCT_READ` |
| `GET` | `/admin/product/:id` | `PRODUCT_READ` |
| `PATCH` | `/admin/product/:id/status` | `PRODUCT_WRITE` |
| `PATCH` | `/admin/product/:id` | `PRODUCT_WRITE` |
| `DELETE` | `/admin/product/:id` | `PRODUCT_WRITE` |

Todas as rotas respondem JSON. Sem claim, o CASL nega (fail-closed). Admins já seedados só ganham `PRODUCT_READ` / `PRODUCT_WRITE` no próximo `db:seed` (o seed percorre o catálogo inteiro).

## Resumo das mudanças

| Área | O que mudou | Breaking? |
|---|---|---|
| CRUD `/admin/product` | Recurso novo | Não (aditivo) |
| Claims | `PRODUCT_READ`, `PRODUCT_WRITE`, subject `product` | Não |

## Create — `POST /admin/product`

Resposta `201`: `{ id: number }`.

| Campo | Obrigatório | Regra |
|---|---|---|
| `code` | sim | string, único, máx. 64. Trim |
| `description` | sim | string, máx. 512 |
| `unitOfMeasure` | sim | string, máx. 16 (ex.: `UN`, `KG`) |
| `ncm` | sim | string, máx. 8 |
| `unitCostInCents` | sim | inteiro `>= 0` |
| `unitPriceInCents` | sim | inteiro `>= 0` |
| `group1`, `group2`, `brand` | não | string, máx. 128. String vazia é rejeitada |
| `complement` | não | string, máx. 512 |
| `manufacturerCode` | não | string, máx. 64 |
| `currency` | não | string, máx. 3. Omitido grava `BRL` |
| `ean` | não | string, máx. 14 |
| `additionalInfo` | não | string, máx. 8192 |
| `economicLot`, `minStock`, `maxStock`, `weightInGrams`, `heightInCm`, `lengthInCm`, `widthInCm`, `markup`, `marginB`, `quotation` | não | número `>= 0`. `minStock` omitido grava `0` |
| `warrantyDays` | não | inteiro `>= 0` |
| `active` | não | boolean. Omitido grava `true` |

`code` duplicado → `409` com `message` `O código <code> já está em uso.`

## Listagem — `GET /admin/product`

Query herdada de paginação:

| Query | Tipo | Notas |
|---|---|---|
| `page`, `size` | inteiro positivo | Opcional. Sem os dois, a API devolve a página inteira |
| `search` | string | Opcional. Contém, sem diferenciar maiúsculas, em `code`, `description`, `manufacturerCode`, `brand`, `ean` e `ncm` |
| `active` | `true` \| `false` | Opcional. Query string `'true'` / `'false'` |

Resposta:

```json
{
  "currentPage": 1,
  "itemsPerPage": 10,
  "totalItems": 1,
  "totalPages": 1,
  "data": []
}
```

Ordenação: `createdAt` decrescente. Cada item de `data` é o produto completo (mesmo shape do GET por id).

## Detalhe — `GET /admin/product/:id`

`200` com o produto. `404`: `Produto não encontrado na base de dados.`

Campos nulos no banco (`group1`, `group2`, `complement`, `manufacturerCode`, `brand`, `economicLot`, `maxStock`, `warrantyDays`, `weightInGrams`, `heightInCm`, `lengthInCm`, `widthInCm`, `markup`, `marginB`, `quotation`, `ean`, `additionalInfo`) vêm `null`, não string vazia.

`currency`, `minStock` e `active` sempre vêm preenchidos.

## Status — `PATCH /admin/product/:id/status`

Sem body. Inverte `active`. Resposta: `{ message: "Status do produto atualizado com sucesso" }`.

## Edit — `PATCH /admin/product/:id`

Body parcial: qualquer campo do create. Omitir um campo não apaga o valor atual. String vazia em campo opcional é `400`.

Trocar `code` para um código de outro produto → `409`. Manter o próprio `code` é permitido.

Resposta: `{ message: "Produto atualizado com sucesso" }`.

## Delete — `DELETE /admin/product/:id`

Resposta: `{ message: "Produto excluído com sucesso" }`. `404` se o id não existir.

## Erros / UX

Contrato `{ message: string }`.

| Status | Quando |
|---|---|
| `400` | Validação (mensagem em pt-BR, com o nome do campo) |
| `404` | Id inexistente em GET, PATCH, DELETE e status |
| `409` | `code` já usado no create ou no edit |

## Checklist

1. Gerar tipos a partir do OpenAPI (`ProductDto`, create, edit, query).
2. Form de create: só os seis campos obrigatórios; preço e custo como inteiro em centavos (exibir dividido por 100).
3. Listagem: `search` e filtro `active`; paginação `page` / `size`.
4. Toggle de status chama `PATCH /admin/product/:id/status` sem body.
5. Edit envia só o que mudou. Não mande `""` para limpar opcional — a API rejeita.
6. Liberar as claims `PRODUCT_READ` e `PRODUCT_WRITE` no admin (seed ou tela de permissões) antes de esconder o menu.
