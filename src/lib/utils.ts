import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatWeight(tons: number): string {
  if (tons < 1) {
    return `${(tons * 2000).toFixed(0)} lbs`
  }
  return `${tons.toFixed(2)} tons`
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateTicketNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `WI-${year}${month}${day}-${random}`
}

export function generateAccountNumber(): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `SSW-${random}`
}

// Environmental impact calculations based on EPA WARM model approximations
export function calculateCO2Avoided(tonsOfWaste: number): number {
  // Approximate: 0.9 metric tons CO2e avoided per ton of organic waste diverted from landfill
  return tonsOfWaste * 0.9
}

export function calculateLandfillSpaceSaved(tonsOfWaste: number): number {
  // Approximate: 1.5 cubic yards per ton of waste
  return tonsOfWaste * 1.5
}

export function calculateCompostProduced(tonsOfWaste: number): number {
  // Approximate: 50% conversion rate from waste to finished compost
  return tonsOfWaste * 0.5
}

export function calculateMethaneAvoided(tonsOfWaste: number): number {
  // Approximate: 0.06 metric tons of methane avoided per ton of organic waste
  return tonsOfWaste * 0.06
}

export const WASTE_TYPES = [
  { value: 'food_waste', label: 'Food Waste', category: 'organic' },
  { value: 'expired_produce', label: 'Expired Produce', category: 'organic' },
  { value: 'food_scraps', label: 'Food Scraps', category: 'organic' },
  { value: 'brewery_grain', label: 'Brewery Grain', category: 'organic' },
  { value: 'green_waste', label: 'Green Waste / Yard Trimmings', category: 'green_waste' },
  { value: 'wood_chips', label: 'Wood Chips', category: 'wood' },
  { value: 'manure', label: 'Manure', category: 'manure' },
  { value: 'agricultural_waste', label: 'Agricultural Waste', category: 'organic' },
  { value: 'other_organic', label: 'Other Organic Material', category: 'other' },
]

export const PACKAGING_TYPES = [
  { value: 'loose', label: 'Loose / Bulk' },
  { value: 'totes', label: 'Totes / Bins' },
  { value: 'pallets', label: 'Palletized' },
  { value: 'bags', label: 'Bagged' },
  { value: 'roll_off', label: 'Roll-off Container' },
  { value: 'tanker', label: 'Tanker (Liquid)' },
]

export const VEHICLE_TYPES = [
  { value: 'semi_trailer', label: 'Semi-Trailer' },
  { value: 'roll_off_truck', label: 'Roll-off Truck' },
  { value: 'dump_truck', label: 'Dump Truck' },
  { value: 'pickup_truck', label: 'Pickup Truck' },
  { value: 'box_truck', label: 'Box Truck' },
]

export const INTAKE_STATUSES = [
  { value: 'pending', label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'approved', label: 'Approved', color: 'bg-blue-100 text-blue-800' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-purple-100 text-purple-800' },
  { value: 'in_transit', label: 'In Transit', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'received', label: 'Received', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
]

export const CONTAMINANT_TYPES = [
  { value: 'plastic', label: 'Plastic Packaging/Wrappers' },
  { value: 'glass', label: 'Glass' },
  { value: 'metal', label: 'Metal Objects' },
  { value: 'stones', label: 'Stones/Gravel' },
  { value: 'chemicals', label: 'Chemicals/Solvents' },
  { value: 'treated_wood', label: 'Treated/Painted Wood' },
  { value: 'hazardous', label: 'Medical/Biohazard Waste' },
  { value: 'other', label: 'Other Debris' },
]

// ==========================================
// SCALE HOUSE UTILITIES
// ==========================================

/**
 * Generate a weight ticket number in format: WT-YYMMDD-XXXX
 */
export function generateWeightTicketNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `WT-${year}${month}${day}-${random}`
}

/**
 * Generate a BOL number in format: BOL-YYMMDD-XXXX
 */
export function generateBOLNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `BOL-${year}${month}${day}-${random}`
}

/**
 * Format weight in pounds with commas
 */
export function formatWeightLbs(pounds: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(pounds)) + ' lbs'
}

/**
 * Convert pounds to tons and format
 */
export function lbsToTons(pounds: number): number {
  return pounds / 2000
}

/**
 * Format weight showing both lbs and tons
 */
export function formatWeightBoth(pounds: number): string {
  const tons = lbsToTons(pounds)
  const lbsFormatted = new Intl.NumberFormat('en-US').format(Math.round(pounds))
  return `${lbsFormatted} lbs (${tons.toFixed(2)} tons)`
}

/**
 * Calculate net weight from gross and tare
 */
export function calculateNetWeight(grossWeight: number, tareWeight: number): number {
  return Math.abs(grossWeight - tareWeight)
}

// Scale transaction statuses
export const SCALE_TRANSACTION_STATUSES = [
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'pending_signature', label: 'Pending Signature', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'voided', label: 'Voided', color: 'bg-red-100 text-red-800' },
]

// Scale transaction types
export const SCALE_TRANSACTION_TYPES = [
  { value: 'inbound', label: 'Inbound (Receiving)', description: 'External truck delivering waste to us' },
  { value: 'outbound_pickup', label: 'Outbound Pickup', description: 'Our truck going to pick up waste' },
]

// SSW Brand colors
export const SSW_BRAND_COLORS = {
  brown: '#8B5A2B',
  blue: '#5BA3C6',
  greenLight: '#A4C639',
  greenDark: '#6B8E23',
}
