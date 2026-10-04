-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE TEXT USING ("status"::text);
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'QUOTATION';

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "type" TYPE TEXT USING ("type"::text);

-- DropEnum
DROP TYPE "OrderStatus";
DROP TYPE "ItemType";
