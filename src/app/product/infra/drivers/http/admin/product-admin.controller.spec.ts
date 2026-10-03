import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { AuthenticationGuardsModule } from 'src/app/authentication/application/guards/guards.module';
import { ProductDto } from 'src/app/product/application/dtos/product.dto';
import { CreateProduct } from 'src/app/product/application/usecases/create-product/create-product.service';
import { CreateProductInputDto, CreateProductOutputDto } from 'src/app/product/application/usecases/create-product/dtos/create-product.dto';
import { DeleteProduct } from 'src/app/product/application/usecases/delete-product/delete-product.service';
import { EditProductInputDto } from 'src/app/product/application/usecases/edit-product/dtos/edit-product.dto';
import { EditProduct } from 'src/app/product/application/usecases/edit-product/edit-product.service';
import { FindAllProductQueryDto } from 'src/app/product/application/usecases/find-all-product/dtos/find-all-product.dto';
import { FindAllProduct } from 'src/app/product/application/usecases/find-all-product/find-all-product.service';
import { FindProductById } from 'src/app/product/application/usecases/find-product-by-id/find-product-by-id.service';
import { UpdateProductStatus } from 'src/app/product/application/usecases/update-product-status/update-product-status.service';
import { SuccessMessage } from 'src/core/dtos/success-message.dto';
import { Params } from 'src/infra/validators/class/dtos/params';
import { IPagination } from 'src/shared/value-objects/pagination/pagination.vo';
import { ProductAdminController } from './product-admin.controller';

describe('ProductAdminController - Unit tests', () => {
  let sut: ProductAdminController;
  let createProduct: CreateProduct;
  let findAllProduct: FindAllProduct;
  let findProductById: FindProductById;
  let editProduct: EditProduct;
  let deleteProduct: DeleteProduct;
  let updateProductStatus: UpdateProductStatus;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      imports: [AuthenticationGuardsModule],
      controllers: [ProductAdminController],
      providers: [
        { provide: CreateProduct, useValue: createMock<CreateProduct>() },
        { provide: FindAllProduct, useValue: createMock<FindAllProduct>() },
        { provide: FindProductById, useValue: createMock<FindProductById>() },
        { provide: EditProduct, useValue: createMock<EditProduct>() },
        { provide: DeleteProduct, useValue: createMock<DeleteProduct>() },
        { provide: UpdateProductStatus, useValue: createMock<UpdateProductStatus>() },
      ],
    }).compile();

    sut = module.get(ProductAdminController);
    createProduct = module.get(CreateProduct);
    findAllProduct = module.get(FindAllProduct);
    findProductById = module.get(FindProductById);
    editProduct = module.get(EditProduct);
    deleteProduct = module.get(DeleteProduct);
    updateProductStatus = module.get(UpdateProductStatus);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should delegate create', async() => {
    // Arrange
    const body = createMock<CreateProductInputDto>();
    const output = createMock<CreateProductOutputDto>();
    const spy = jest.spyOn(createProduct, 'execute').mockResolvedValue(output);

    // Act
    const result = await sut.create(body);

    // Assert
    expect(result).toEqual(output);
    expect(spy).toHaveBeenCalledWith(body);
  });

  it('should delegate findAll', async() => {
    // Arrange
    const queries = createMock<FindAllProductQueryDto>();
    const output = createMock<IPagination<ProductDto>>();
    const spy = jest.spyOn(findAllProduct, 'execute').mockResolvedValue(output);

    // Act
    const result = await sut.findAll(queries);

    // Assert
    expect(result).toEqual(output);
    expect(spy).toHaveBeenCalledWith(queries);
  });

  it('should delegate findOne', async() => {
    // Arrange
    const params = createMock<Params>();
    const output = createMock<ProductDto>();
    const spy = jest.spyOn(findProductById, 'execute').mockResolvedValue(output);

    // Act
    const result = await sut.findOne(params);

    // Assert
    expect(result).toEqual(output);
    expect(spy).toHaveBeenCalledWith(params.id);
  });

  it('should delegate update', async() => {
    // Arrange
    const params = createMock<Params>();
    const body = createMock<EditProductInputDto>();
    const output = createMock<SuccessMessage>();
    const spy = jest.spyOn(editProduct, 'execute').mockResolvedValue(output);

    // Act
    const result = await sut.update(params, body);

    // Assert
    expect(result).toEqual(output);
    expect(spy).toHaveBeenCalledWith(params.id, body);
  });

  it('should delegate updateStatus', async() => {
    // Arrange
    const params = createMock<Params>();
    const output = createMock<SuccessMessage>();
    const spy = jest.spyOn(updateProductStatus, 'execute').mockResolvedValue(output);

    // Act
    const result = await sut.updateStatus(params);

    // Assert
    expect(result).toEqual(output);
    expect(spy).toHaveBeenCalledWith(params.id);
  });

  it('should delegate remove', async() => {
    // Arrange
    const params = createMock<Params>();
    const output = createMock<SuccessMessage>();
    const spy = jest.spyOn(deleteProduct, 'execute').mockResolvedValue(output);

    // Act
    const result = await sut.remove(params);

    // Assert
    expect(result).toEqual(output);
    expect(spy).toHaveBeenCalledWith(params.id);
  });
});
