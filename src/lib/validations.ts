import { z } from "zod"

// Client validation schemas
export const createClientSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(255),
  operationalContact: z.string().min(1, "Operational contact is required").max(255),
  operationalEmail: z.string().email("Invalid email address"),
  operationalPhone: z.string().min(1, "Phone number is required").max(50),
  billingContact: z.string().max(255).optional().nullable(),
  billingEmail: z.string().email().optional().nullable().or(z.literal("")),
  billingPhone: z.string().max(50).optional().nullable(),
  address: z.string().min(1, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(2),
  zipCode: z.string().min(1, "ZIP code is required").max(10),
  contractReference: z.string().max(100).optional().nullable(),
  tippingFeeRate: z.coerce.number().min(0).default(45.00),
  notes: z.string().max(2000).optional().nullable(),
})

export const updateClientSchema = createClientSchema.partial().extend({
  status: z.enum(["active", "inactive", "suspended"]).optional(),
})

// Intake validation schemas
export const createIntakeSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
  wasteType: z.enum([
    "food_waste",
    "green_waste",
    "wood_chips",
    "manure",
    "brewery_grain",
    "coffee_grounds",
    "produce_trim",
    "dairy_waste",
    "mixed_organic",
  ]),
  wasteDescription: z.string().max(1000).optional().nullable(),
  estimatedWeight: z.coerce.number().positive("Weight must be greater than 0"),
  packagingType: z.enum([
    "loose",
    "totes",
    "pallets",
    "bags",
    "roll_off",
    "tanker",
  ]),
  deliveryType: z.enum(["client_delivery", "ssw_pickup"]),
  scheduledDate: z.string().or(z.date()).transform((val) => new Date(val)),
  scheduledTimeWindow: z.string().max(50).optional().nullable(),
  pickupAddress: z.string().max(500).optional().nullable(),
  pickupCity: z.string().max(100).optional().nullable(),
  pickupState: z.string().max(2).optional().nullable(),
  pickupZip: z.string().max(10).optional().nullable(),
  vehicleType: z.enum([
    "semi_trailer",
    "roll_off",
    "dump_truck",
    "pickup",
    "box_truck",
  ]).optional().nullable(),
  driverContact: z.string().max(255).optional().nullable(),
  onSiteContact: z.string().max(255).optional().nullable(),
  onSitePhone: z.string().max(50).optional().nullable(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(["daily", "weekly", "biweekly", "monthly"]).optional().nullable(),
  temperatureRequirement: z.string().max(100).optional().nullable(),
  hasOdorConcerns: z.boolean().default(false),
  hasLeakageConcerns: z.boolean().default(false),
  equipmentNeeded: z.string().max(500).optional().nullable(),
  specialInstructions: z.string().max(2000).optional().nullable(),
  contaminationCertified: z.boolean().default(false),
  contaminationNotes: z.string().max(1000).optional().nullable(),
  tippingFeeRate: z.coerce.number().min(0).optional(),
  poNumber: z.string().max(100).optional().nullable(),
})

export const updateIntakeSchema = createIntakeSchema.partial().extend({
  status: z.enum([
    "pending",
    "approved",
    "scheduled",
    "in_transit",
    "received",
    "processed",
    "cancelled",
  ]).optional(),
  actualWeight: z.coerce.number().positive().optional().nullable(),
  receivedAt: z.string().or(z.date()).transform((val) => new Date(val)).optional().nullable(),
  contaminationFound: z.boolean().optional(),
  inspectionNotes: z.string().max(2000).optional().nullable(),
  totalCharge: z.coerce.number().min(0).optional().nullable(),
})

// Query parameter schemas
export const clientQuerySchema = z.object({
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const intakeQuerySchema = z.object({
  status: z.enum([
    "pending",
    "approved",
    "scheduled",
    "in_transit",
    "received",
    "processed",
    "cancelled",
  ]).optional(),
  clientId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

// Helper function to format Zod errors
export function formatZodError(error: z.ZodError<unknown>) {
  return error.issues.map((e) => ({
    field: e.path.join("."),
    message: e.message,
  }))
}

// Type exports
export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type CreateIntakeInput = z.infer<typeof createIntakeSchema>
export type UpdateIntakeInput = z.infer<typeof updateIntakeSchema>
