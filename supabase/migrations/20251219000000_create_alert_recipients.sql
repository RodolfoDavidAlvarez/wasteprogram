-- CreateTable: Alert recipients for SMS/email notifications
CREATE TABLE IF NOT EXISTS "wd_alert_recipients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "site" TEXT NOT NULL DEFAULT 'congress_az',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wd_alert_recipients_pkey" PRIMARY KEY ("id")
);

-- Ensure one phone per site
CREATE UNIQUE INDEX IF NOT EXISTS "wd_alert_recipients_phone_site_key"
  ON "wd_alert_recipients" ("phone", "site");

-- Seed the first SSW admin contact (Rodolfo Alvarez)
INSERT INTO "wd_alert_recipients" ("id", "name", "phone", "email", "site", "active", "createdAt", "updatedAt")
VALUES ('admin-ralvarez', 'Rodolfo Alvarez', '+19285501649', 'ralvarez@soilseedandwater.com', 'congress_az', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;
