-- Add weightTicketUrls field to delivery records
ALTER TABLE "wd_delivery_records" 
ADD COLUMN IF NOT EXISTS "weightTicketUrls" TEXT;

-- Add comment
COMMENT ON COLUMN "wd_delivery_records"."weightTicketUrls" IS 'JSON array of weight ticket document URLs (PDF or HTML)';


