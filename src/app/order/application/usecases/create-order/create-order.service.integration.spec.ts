import { Test } from '@nestjs/testing';
import { ClientInvoiceType } from 'src/app/client/client/domain/enums/client-invoice-type.enum';
import { ClientType } from 'src/app/client/client/domain/enums/client-type.enum';
import { ItemType } from 'src/app/order/domain/enums/item-type.enum';
import { OrderModule } from 'src/app/order/order.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { buildMinimalCompanyData } from 'src/test/fixtures/minimal-company';
import { buildMinimalResaleData, nextResaleFixtureId } from 'src/test/fixtures/minimal-resale';
import { CreateOrder } from './create-order.service';

describe('CreateOrder - Integration tests', () => {
  let sut: CreateOrder;
  let prisma: PrismaService;

  beforeAll(async() => {
    const module = await Test.createTestingModule({ imports: [OrderModule] }).compile();
    sut = module.get(CreateOrder);
    prisma = module.get(PrismaService);
  });

  beforeEach(async() => {
    await prisma.truncate();
  });

  afterAll(async() => {
    await prisma.truncate();
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should persist a quotation with the catalog snapshot and a generated code', async() => {
    // Arrange
    const company = await prisma.company.create({ data: buildMinimalCompanyData() });
    const group = await prisma.clientGroup.create({ data: { name: `Grupo ${Date.now()}`, active: true } });
    const resale = await prisma.resale.create({ data: buildMinimalResaleData(nextResaleFixtureId()) });
    const clientId = Math.floor(Math.random() * 1_000_000) + 1;
    await prisma.client.create({
      data: {
        id: clientId,
        type: ClientType.PJ,
        document: `${clientId}`.padStart(14, '0'),
        groupId: group.id,
        resaleId: resale.id,
        companyId: company.id,
        companyName: 'Cliente LTDA',
        headquarters: 'São Paulo',
        invoiceType: ClientInvoiceType.CONTRACT,
        generateInvoice: true,
        active: true,
      },
    });
    const product = await prisma.product.create({
      data: {
        code: `PRD-${Date.now()}`,
        description: 'Leitor de código de barras',
        unitOfMeasure: 'UN',
        ncm: '84716053',
        unitCostInCents: 500,
        unitPriceInCents: 1000,
      },
    });

    // Act
    const result = await sut.execute({
      clientId,
      companyId: company.id,
      freightValueInCents: 250,
      items: [{ type: ItemType.PRODUCT, productId: product.id, quantity: 2 }],
    });

    // Assert
    expect(result.code).toMatch(/^ORC-\d{4}-001$/);
    const saved = await prisma.order.findUnique({ where: { id: result.id }, include: { items: true } });
    expect(saved?.status).toBe('QUOTATION');
    expect(saved?.totalItemsInCents).toBe(2000);
    expect(saved?.totalValueInCents).toBe(2250);
    expect(saved?.items[0]).toEqual(expect.objectContaining({
      code: product.code,
      description: 'Leitor de código de barras',
      quantity: 2,
      unitValueInCents: 1000,
      totalValueInCents: 2000,
    }));
  });
});
