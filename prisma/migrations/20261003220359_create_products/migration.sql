-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "group1" TEXT,
    "group2" TEXT,
    "description" TEXT NOT NULL,
    "complement" TEXT,
    "manufacturerCode" TEXT,
    "unitOfMeasure" TEXT NOT NULL,
    "ncm" TEXT NOT NULL,
    "brand" TEXT,
    "economicLot" DOUBLE PRECISION,
    "minStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxStock" DOUBLE PRECISION,
    "warrantyDays" INTEGER,
    "weightInGrams" DOUBLE PRECISION,
    "heightInCm" DOUBLE PRECISION,
    "lengthInCm" DOUBLE PRECISION,
    "widthInCm" DOUBLE PRECISION,
    "markup" DOUBLE PRECISION,
    "marginB" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "quotation" DOUBLE PRECISION,
    "unitCostInCents" INTEGER NOT NULL,
    "unitPriceInCents" INTEGER NOT NULL,
    "ean" TEXT,
    "additionalInfo" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");
