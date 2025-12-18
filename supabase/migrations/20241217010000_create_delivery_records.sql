-- CreateTable for Delivery Records (Schedule Tracking)
CREATE TABLE IF NOT EXISTS "wd_delivery_records" (
    "id" TEXT NOT NULL,
    "vrNumber" TEXT NOT NULL,
    "loadNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "deliveredAt" TIMESTAMP(3),
    "deliveredBy" TEXT,
    "photoUrls" TEXT,
    "notes" TEXT,
    "tonnage" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wd_delivery_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "wd_delivery_records_vrNumber_key" ON "wd_delivery_records"("vrNumber");
