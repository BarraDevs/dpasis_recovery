export enum OrderStatus {
  QUOTATION = 'QUOTATION',
  APPROVED = 'APPROVED',
  PRODUCTION = 'PRODUCTION',
  INVOICING = 'INVOICING',
  SEPARATION = 'SEPARATION',
  TRANSPORT = 'TRANSPORT',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  OrderStatus.QUOTATION,
  OrderStatus.APPROVED,
  OrderStatus.PRODUCTION,
  OrderStatus.INVOICING,
  OrderStatus.SEPARATION,
  OrderStatus.TRANSPORT,
  OrderStatus.DELIVERED,
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.QUOTATION]: 'cotação',
  [OrderStatus.APPROVED]: 'aprovado',
  [OrderStatus.PRODUCTION]: 'produção',
  [OrderStatus.INVOICING]: 'faturamento',
  [OrderStatus.SEPARATION]: 'separação',
  [OrderStatus.TRANSPORT]: 'transporte',
  [OrderStatus.DELIVERED]: 'entregue',
  [OrderStatus.CANCELED]: 'cancelado',
};
