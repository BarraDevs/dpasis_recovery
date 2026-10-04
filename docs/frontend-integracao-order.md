# Integração frontend — orçamentos e pedidos

Recurso novo em `/admin/order`. O pedido nasce como orçamento (`QUOTATION`). Itens, totais e o código `ORC-AAAA-001` são calculados pela API. Não existe rota `user/`.

## Base URL admin

JWT de admin. Subject CASL: `order`.

| Método | Rota | Claim |
|---|---|---|
| `POST` | `/admin/order` | `ORDER_WRITE` |
| `GET` | `/admin/order` | `ORDER_READ` |
| `GET` | `/admin/order/:id` | `ORDER_READ` |
| `PATCH` | `/admin/order/:id/status` | `ORDER_WRITE` |
| `PATCH` | `/admin/order/:id/activate` | `ORDER_WRITE` |
| `PATCH` | `/admin/order/:id/deactivate` | `ORDER_WRITE` |
| `PATCH` | `/admin/order/:id` | `ORDER_WRITE` |
| `DELETE` | `/admin/order/:id` | `ORDER_WRITE` |

Admins já seedados só recebem `ORDER_READ` e `ORDER_WRITE` no próximo `db:seed`.

## Resumo

| Área | O que mudou | Breaking? |
|---|---|---|
| CRUD `/admin/order` | Recurso novo | Não (aditivo) |
| Claims | `ORDER_READ`, `ORDER_WRITE`, subject `order` | Não |

## Create — `POST /admin/order`

JSON. Resposta `201`: `{ id, code }`. O cliente não envia `code`, `status` nem totais.

| Campo | Obrigatório | Regra |
|---|---|---|
| `clientId`, `companyId` | sim | inteiro `>= 1`. Inexistente → 404 do módulo de origem. Inativo → 400 |
| `sellerId` | não | inteiro `>= 1` |
| `freightMode`, `carrierName`, `commercialProcess` | não | string, máx. 128. Vazio é rejeitado |
| `freightValueInCents` | não | inteiro `>= 0`. Omitido grava `0` |
| `observation`, `commercialNote` | não | string, máx. 8192 |
| `items` | sim | lista. Pode ser vazia |

Cada item:

| Campo | Regra |
|---|---|
| `type` | `PRODUCT` ou `SERVICE` |
| `productId` | obrigatório se `PRODUCT`. Proibido junto com `serviceId` |
| `serviceId` | obrigatório se `SERVICE`. Proibido junto com `productId` |
| `quantity` | número `> 0` |
| `unitValueInCents` | opcional, inteiro `>= 0`. Omitido usa o preço do catálogo. Se vier, substitui o preço e `lastAdjustment` recebe a data |
| `serviceActivityCode` | opcional, máx. 32 |

A API copia `code` e `description` do produto. No serviço, `code` recebe `name` e `description` recebe a descrição do catálogo.

`totalItemsInCents` = soma de `round(quantity * unitValueInCents)`. `totalValueInCents` = itens + frete.

`code` sai `ORC-AAAA-001`, sequencial por ano. `status` inicial: `QUOTATION`. `active` inicial: `true`.

## Listagem — `GET /admin/order`

| Query | Notas |
|---|---|
| `page`, `size`, `search`, `active` | iguais às outras listagens. `search` olha só `code` |
| `clientId`, `companyId`, `sellerId` | opcionais |
| `status` | `QUOTATION`, `APPROVED`, `PRODUCTION`, `INVOICING`, `SEPARATION`, `TRANSPORT`, `DELIVERED`, `CANCELED` |

Resposta paginada (`currentPage`, `itemsPerPage`, `totalItems`, `totalPages`, `data`). Cada item de `data` traz o pedido com `items`. Ordenação: `createdAt` decrescente.

## Detalhe

`GET /admin/order/:id` devolve o mesmo shape, com `items`. `404`: `Orçamento não encontrado na base de dados.`

## Status — `PATCH /admin/order/:id/status`

Body: `{ "status": "APPROVED" }`. Sem body vazio.

Avanço de um passo: `QUOTATION → APPROVED → PRODUCTION → INVOICING → SEPARATION → TRANSPORT → DELIVERED`.

`CANCELED` é permitido a partir de qualquer status, exceto `DELIVERED` e um pedido já cancelado.

Pulo de etapa → `400` com `Não é possível mudar o status de <origem> para <destino>.` Os nomes na mensagem estão em português (`cotação`, `aprovado`, `produção`, `faturamento`, `separação`, `transporte`, `entregue`, `cancelado`).

## Edit — `PATCH /admin/order/:id`

Body parcial do create.

- `clientId`, `companyId`, `sellerId` e `items` só enquanto o status é `QUOTATION`. Fora disso → `400` `Orçamento não pode ser alterado neste status.`
- `items` enviado substitui a lista inteira e recalcula os totais.
- Frete, transportadora, processo e notas mudam até antes de `DELIVERED` ou `CANCELED`.
- `sellerId: null` tira o vendedor.

Resposta: `{ message: "Orçamento atualizado com sucesso" }`.

## Ativar, desativar, excluir

`PATCH .../activate` e `.../deactivate` só mudam `active`. Não mudam o status.

`DELETE` só em `QUOTATION`. Os itens saem junto. Fora de cotação: `400` `Só é possível excluir um orçamento em cotação.`

## Erros / UX

Contrato `{ message: string }`.

| Status | Quando |
|---|---|
| `400` | Validação, item sem produto e sem serviço (ou com os dois), referência inativa, transição inválida, edição ou exclusão fora da regra |
| `404` | Pedido, cliente, empresa, vendedor, produto ou serviço inexistente |
| `409` | Disputa rara do código `ORC-AAAA-SEQ`. A API tenta de novo uma vez |

## Checklist

1. Gerar tipos a partir do OpenAPI. Não enviar `code`, `status` nem totais no create.
2. Form de item: escolher produto ou serviço, quantidade e preço opcional. Mostrar o snapshot que voltar no GET.
3. Preço e frete em centavos na API; dividir por 100 na tela.
4. Status como stepper. O botão cancelar some em `DELIVERED` e `CANCELED`.
5. Edição de itens e de cliente/empresa/vendedor só na cotação.
6. Excluir só em cotação. Ativar/desativar é independente do status.
7. Liberar `ORDER_READ` e `ORDER_WRITE` antes de mostrar o menu.
