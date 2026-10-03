import { Test } from '@nestjs/testing';
import { ConfigModule } from 'src/core/config/config.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { ProductDaoAdapterPrisma } from './product-prisma.dao';

function productData(code: string, overrides: Record<string, unknown> = {}) {
  return {
    code,
    description: `Descrição ${code}`,
    unitOfMeasure: 'UN',
    ncm: '84716053',
    unitCostInCents: 100,
    unitPriceInCents: 200,
    ...overrides,
  };
}

describe('ProductDaoAdapterPrisma - Integration tests', () => {
  let sut: ProductDaoAdapterPrisma;
  let prisma: PrismaService;

  beforeAll(async() => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [ProductDaoAdapterPrisma, PrismaService],
    }).compile();

    sut = module.get(ProductDaoAdapterPrisma);
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

  describe('findAll', () => {
    it('should return an empty page', async() => {
      // Act
      const [rows, total] = await sut.findAll({});

      // Assert
      expect(rows).toEqual([]);
      expect(total).toBe(0);
    });

    it('should paginate and order by createdAt desc', async() => {
      // Arrange
      await prisma.product.create({
        data: { ...productData('OLD'), createdAt: new Date('2026-01-01T00:00:00.000Z') },
      });
      await prisma.product.create({
        data: { ...productData('NEW'), createdAt: new Date('2026-02-01T00:00:00.000Z') },
      });

      // Act
      const [rows, total] = await sut.findAll({ page: 1, size: 1 });

      // Assert
      expect(total).toBe(2);
      expect(rows).toHaveLength(1);
      expect(rows[0].code).toBe('NEW');
    });

    it.each([
      ['code', { code: 'ALVO-1' }, 'alvo'],
      ['description', { description: 'Cabo HDMI' }, 'hdmi'],
      ['manufacturerCode', { manufacturerCode: 'FAB-99' }, 'fab-99'],
      ['brand', { brand: 'Acme' }, 'acme'],
      ['ean', { ean: '7890000000001' }, '789000'],
      ['ncm', { ncm: '12345678' }, '12345678'],
    ])('should search by %s case-insensitively', async(_field, overrides, search) => {
      // Arrange
      await prisma.product.create({ data: productData('KEEP', overrides) });
      await prisma.product.create({ data: productData('OTHER') });

      // Act
      const [rows, total] = await sut.findAll({ search });

      // Assert
      expect(total).toBe(1);
      expect(rows[0].code).toBe((overrides as { code?: string }).code ?? 'KEEP');
    });

    it('should filter by active', async() => {
      // Arrange
      await prisma.product.create({ data: productData('ON', { active: true }) });
      await prisma.product.create({ data: productData('OFF', { active: false }) });

      // Act
      const [rows, total] = await sut.findAll({ active: false });

      // Assert
      expect(total).toBe(1);
      expect(rows[0].code).toBe('OFF');
    });
  });

  describe('findById', () => {
    it('should return null when the product does not exist', async() => {
      expect(await sut.findById(999999)).toBeNull();
    });

    it('should return the product shape', async() => {
      // Arrange
      const created = await prisma.product.create({ data: productData('SHAPE') });

      // Act
      const result = await sut.findById(created.id);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        id: created.id,
        code: 'SHAPE',
        currency: 'BRL',
        minStock: 0,
        active: true,
      }));
    });
  });

  describe('findByCode', () => {
    it('should return the product with that exact code', async() => {
      // Arrange
      await prisma.product.create({ data: productData('PRD-EXACT') });

      // Act
      const found = await sut.findByCode('PRD-EXACT');
      const missing = await sut.findByCode('prd-exact');

      // Assert
      expect(found?.code).toBe('PRD-EXACT');
      expect(missing).toBeNull();
    });
  });

  describe('save', () => {
    it('should persist and return the id', async() => {
      // Act
      const id = await sut.save({
        code: 'PRD-SAVE',
        description: 'Salvo',
        unitOfMeasure: 'KG',
        ncm: '00000001',
        unitCostInCents: 10,
        unitPriceInCents: 20,
        brand: 'Marca',
      });

      // Assert
      const saved = await prisma.product.findUnique({ where: { id } });
      expect(saved?.description).toBe('Salvo');
      expect(saved?.brand).toBe('Marca');
    });
  });

  describe('edit', () => {
    it('should update only the given fields', async() => {
      // Arrange
      const created = await prisma.product.create({ data: productData('PRD-ED') });

      // Act
      await sut.edit(created.id, { description: 'Editado' });

      // Assert
      const saved = await prisma.product.findUnique({ where: { id: created.id } });
      expect(saved?.description).toBe('Editado');
      expect(saved?.code).toBe('PRD-ED');
    });
  });

  describe('delete', () => {
    it('should remove the row', async() => {
      // Arrange
      const created = await prisma.product.create({ data: productData('PRD-RM') });

      // Act
      await sut.delete(created.id);

      // Assert
      expect(await prisma.product.findUnique({ where: { id: created.id } })).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should set active', async() => {
      // Arrange
      const created = await prisma.product.create({ data: productData('PRD-ST', { active: true }) });

      // Act
      await sut.updateStatus(created.id, false);

      // Assert
      const saved = await prisma.product.findUnique({ where: { id: created.id } });
      expect(saved?.active).toBe(false);
    });
  });
});
