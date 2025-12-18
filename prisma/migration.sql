-- CreateTable
CREATE TABLE "wd_clients" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "operationalContact" TEXT NOT NULL,
    "operationalEmail" TEXT NOT NULL,
    "operationalPhone" TEXT NOT NULL,
    "billingContact" TEXT,
    "billingEmail" TEXT,
    "billingPhone" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "contractReference" TEXT,
    "tippingFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 45.00,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wd_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wd_contracts" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "tippingFeeRate" DOUBLE PRECISION NOT NULL,
    "wasteTypes" TEXT NOT NULL,
    "terms" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wd_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wd_waste_intakes" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "wasteType" TEXT NOT NULL,
    "wasteDescription" TEXT,
    "estimatedWeight" DOUBLE PRECISION NOT NULL,
    "actualWeight" DOUBLE PRECISION,
    "packagingType" TEXT NOT NULL,
    "deliveryType" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTimeWindow" TEXT,
    "confirmedDate" TIMESTAMP(3),
    "pickupAddress" TEXT,
    "pickupCity" TEXT,
    "pickupState" TEXT,
    "pickupZip" TEXT,
    "vehicleType" TEXT,
    "driverContact" TEXT,
    "onSiteContact" TEXT,
    "onSitePhone" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringFrequency" TEXT,
    "temperatureRequirement" TEXT,
    "hasOdorConcerns" BOOLEAN NOT NULL DEFAULT false,
    "hasLeakageConcerns" BOOLEAN NOT NULL DEFAULT false,
    "equipmentNeeded" TEXT,
    "specialInstructions" TEXT,
    "contaminationCertified" BOOLEAN NOT NULL DEFAULT false,
    "contaminationNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "processingNote" TEXT,
    "destinationSite" TEXT,
    "inspectionPassed" BOOLEAN,
    "inspectionNotes" TEXT,
    "contaminationFound" BOOLEAN NOT NULL DEFAULT false,
    "tippingFeeRate" DOUBLE PRECISION,
    "totalCharge" DOUBLE PRECISION,
    "invoiceId" TEXT,
    "poNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wd_waste_intakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wd_contamination_reports" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "contaminantType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actionTaken" TEXT,
    "feeAdjustment" DOUBLE PRECISION,
    "reportedBy" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photos" TEXT,

    CONSTRAINT "wd_contamination_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wd_waste_type_configs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "acceptedStatus" TEXT NOT NULL DEFAULT 'accepted',
    "defaultRate" DOUBLE PRECISION,
    "processingNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wd_waste_type_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wd_daily_operations" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalIntakes" INTEGER NOT NULL DEFAULT 0,
    "totalWeightReceived" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPickups" INTEGER NOT NULL DEFAULT 0,
    "missedPickups" INTEGER NOT NULL DEFAULT 0,
    "contaminationIncidents" INTEGER NOT NULL DEFAULT 0,
    "tippingRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wd_daily_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wd_environmental_metrics" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalWasteDiverted" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "co2Avoided" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "landfillSpaceSaved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "compostProduced" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "methaneAvoided" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tippingRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wd_environmental_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wd_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'operator',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wd_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wd_scale_transactions" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "clientId" TEXT,
    "haulerName" TEXT,
    "haulerCompany" TEXT,
    "licensePlate" TEXT NOT NULL,
    "vehicleType" TEXT,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT,
    "driverEmail" TEXT,
    "materialType" TEXT NOT NULL,
    "materialDescription" TEXT,
    "grossWeight" DOUBLE PRECISION,
    "tareWeight" DOUBLE PRECISION,
    "netWeight" DOUBLE PRECISION,
    "timeIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeOut" TIMESTAMP(3),
    "grossWeightPhotoUrl" TEXT,
    "tareWeightPhotoUrl" TEXT,
    "grossWeightOcrValue" DOUBLE PRECISION,
    "tareWeightOcrValue" DOUBLE PRECISION,
    "signatureDataUrl" TEXT,
    "signatureSignedAt" TIMESTAMP(3),
    "signerName" TEXT,
    "weightTicketPdfUrl" TEXT,
    "bolPdfUrl" TEXT,
    "tippingFeeRate" DOUBLE PRECISION,
    "totalCharge" DOUBLE PRECISION,
    "clientEmailSentAt" TIMESTAMP(3),
    "driverSmsSentAt" TIMESTAMP(3),
    "operatorNotes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wd_scale_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wd_bills_of_lading" (
    "id" TEXT NOT NULL,
    "bolNumber" TEXT NOT NULL,
    "scaleTransactionId" TEXT NOT NULL,
    "shipperName" TEXT NOT NULL,
    "shipperAddress" TEXT NOT NULL,
    "shipperCity" TEXT,
    "shipperState" TEXT,
    "shipperZip" TEXT,
    "shipperContact" TEXT,
    "shipperPhone" TEXT,
    "consigneeName" TEXT NOT NULL,
    "consigneeAddress" TEXT NOT NULL,
    "consigneeCity" TEXT,
    "consigneeState" TEXT,
    "consigneeZip" TEXT,
    "consigneeContact" TEXT,
    "consigneePhone" TEXT,
    "materialDescription" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "quantityUnit" TEXT NOT NULL DEFAULT 'lbs',
    "specialInstructions" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wd_bills_of_lading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wd_company_trucks" (
    "id" TEXT NOT NULL,
    "truckNumber" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "capacity" DOUBLE PRECISION,
    "tareWeight" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wd_company_trucks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wd_drivers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "licenseNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wd_drivers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wd_clients_accountNumber_key" ON "wd_clients"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "wd_contracts_contractNumber_key" ON "wd_contracts"("contractNumber");

-- CreateIndex
CREATE UNIQUE INDEX "wd_waste_intakes_ticketNumber_key" ON "wd_waste_intakes"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "wd_waste_type_configs_code_key" ON "wd_waste_type_configs"("code");

-- CreateIndex
CREATE UNIQUE INDEX "wd_daily_operations_date_key" ON "wd_daily_operations"("date");

-- CreateIndex
CREATE UNIQUE INDEX "wd_environmental_metrics_month_year_key" ON "wd_environmental_metrics"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "wd_users_email_key" ON "wd_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "wd_scale_transactions_ticketNumber_key" ON "wd_scale_transactions"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "wd_bills_of_lading_bolNumber_key" ON "wd_bills_of_lading"("bolNumber");

-- CreateIndex
CREATE UNIQUE INDEX "wd_bills_of_lading_scaleTransactionId_key" ON "wd_bills_of_lading"("scaleTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "wd_company_trucks_truckNumber_key" ON "wd_company_trucks"("truckNumber");

-- AddForeignKey
ALTER TABLE "wd_contracts" ADD CONSTRAINT "wd_contracts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "wd_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wd_waste_intakes" ADD CONSTRAINT "wd_waste_intakes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "wd_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wd_contamination_reports" ADD CONSTRAINT "wd_contamination_reports_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "wd_waste_intakes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wd_scale_transactions" ADD CONSTRAINT "wd_scale_transactions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "wd_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wd_bills_of_lading" ADD CONSTRAINT "wd_bills_of_lading_scaleTransactionId_fkey" FOREIGN KEY ("scaleTransactionId") REFERENCES "wd_scale_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

