export class OrderItemDto {
  id: number;
  type: string;
  productId: number | null;
  serviceId: number | null;
  code: string;
  description: string;
  serviceActivityCode: string | null;
  quantity: number;
  unitValueInCents: number;
  totalValueInCents: number;
  lastAdjustment: Date | null;
}

export class OrderDto {
  id: number;
  code: string;
  clientId: number;
  companyId: number;
  sellerId: number | null;
  freightMode: string | null;
  carrierName: string | null;
  freightValueInCents: number;
  commercialProcess: string | null;
  observation: string | null;
  commercialNote: string | null;
  status: string;
  totalItemsInCents: number;
  totalValueInCents: number;
  active: boolean;
  items: OrderItemDto[];
  createdAt: Date;
  updatedAt: Date;
}
