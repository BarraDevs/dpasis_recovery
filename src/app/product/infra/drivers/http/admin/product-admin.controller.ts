import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AccountRole } from 'src/app/account/domain/enums/account-role.enum';
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
import { Claim } from 'src/app/authentication/domain/authorization/claim';
import { RequiredClaims } from 'src/app/authentication/infra/decorators/required-claims.decorator';
import { RequiredRoles } from 'src/app/authentication/infra/decorators/required-role.decorator';
import { SuccessMessage } from 'src/core/dtos/success-message.dto';
import { Swagger } from 'src/infra/openapi/swagger';
import { Params } from 'src/infra/validators/class/dtos/params';
import { IPagination } from 'src/shared/value-objects/pagination/pagination.vo';

@Controller('admin/product')
@RequiredRoles(AccountRole.ADMIN)
export class ProductAdminController {
  constructor(
    private readonly createProduct: CreateProduct,
    private readonly findAllProduct: FindAllProduct,
    private readonly findProductById: FindProductById,
    private readonly editProduct: EditProduct,
    private readonly updateProductStatus: UpdateProductStatus,
    private readonly deleteProduct: DeleteProduct,
  ) {}

  @Post()
  @RequiredClaims(Claim.PRODUCT_WRITE)
  @Swagger({
    tags: ['Produtos'],
    summary: 'Criar produto',
    applyBadRequest: true,
    applyConflict: true,
    createdResponse: CreateProductOutputDto,
  })
  public create(@Body() body: CreateProductInputDto): Promise<CreateProductOutputDto> {
    return this.createProduct.execute(body);
  }

  @Get()
  @RequiredClaims(Claim.PRODUCT_READ)
  @Swagger({
    tags: ['Produtos'],
    summary: 'Listar produtos com paginação e busca',
    applyBadRequest: true,
    okPaginatedResponse: ProductDto,
  })
  public findAll(@Query() queries: FindAllProductQueryDto): Promise<IPagination<ProductDto>> {
    return this.findAllProduct.execute(queries);
  }

  @Patch(':id/status')
  @RequiredClaims(Claim.PRODUCT_WRITE)
  @Swagger({
    tags: ['Produtos'],
    summary: 'Inverter status ativo do produto',
    applyBadRequest: true,
    applyNotFound: true,
    okResponse: SuccessMessage,
  })
  public updateStatus(@Param() params: Params): Promise<SuccessMessage> {
    return this.updateProductStatus.execute(params.id);
  }

  @Get(':id')
  @RequiredClaims(Claim.PRODUCT_READ)
  @Swagger({
    tags: ['Produtos'],
    summary: 'Buscar produto por ID',
    applyBadRequest: true,
    applyNotFound: true,
    okResponse: ProductDto,
  })
  public findOne(@Param() params: Params): Promise<ProductDto> {
    return this.findProductById.execute(params.id);
  }

  @Patch(':id')
  @RequiredClaims(Claim.PRODUCT_WRITE)
  @Swagger({
    tags: ['Produtos'],
    summary: 'Editar produto',
    applyBadRequest: true,
    applyNotFound: true,
    applyConflict: true,
    okResponse: SuccessMessage,
  })
  public update(@Param() params: Params, @Body() body: EditProductInputDto): Promise<SuccessMessage> {
    return this.editProduct.execute(params.id, body);
  }

  @Delete(':id')
  @RequiredClaims(Claim.PRODUCT_WRITE)
  @Swagger({
    tags: ['Produtos'],
    summary: 'Excluir produto',
    applyBadRequest: true,
    applyNotFound: true,
    okResponse: SuccessMessage,
  })
  public remove(@Param() params: Params): Promise<SuccessMessage> {
    return this.deleteProduct.execute(params.id);
  }
}
