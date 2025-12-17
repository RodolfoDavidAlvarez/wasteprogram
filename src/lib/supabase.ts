import { createClient } from '@supabase/supabase-js'

// Supabase client for server-side operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Supabase client for client-side operations (uses anon key)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Storage bucket names
export const STORAGE_BUCKETS = {
  SCALE_PHOTOS: 'scale-photos',
  SIGNATURES: 'signatures',
  DOCUMENTS: 'documents',
} as const

/**
 * Upload a scale photo to Supabase Storage
 */
export async function uploadScalePhoto(
  file: File | Blob,
  transactionId: string,
  type: 'gross' | 'tare'
): Promise<string> {
  const fileName = `${transactionId}/${type}-${Date.now()}.jpg`

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.SCALE_PHOTOS)
    .upload(fileName, file, {
      contentType: 'image/jpeg',
      upsert: true
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.SCALE_PHOTOS)
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

/**
 * Upload a signature image to Supabase Storage
 */
export async function uploadSignature(
  base64Data: string,
  transactionId: string
): Promise<string> {
  // Convert base64 to blob
  const base64Response = await fetch(base64Data)
  const blob = await base64Response.blob()

  const fileName = `${transactionId}/signature-${Date.now()}.png`

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.SIGNATURES)
    .upload(fileName, blob, {
      contentType: 'image/png',
      upsert: true
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.SIGNATURES)
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

/**
 * Upload a generated PDF document to Supabase Storage
 */
export async function uploadDocument(
  pdfBuffer: Buffer | Blob,
  transactionId: string,
  type: 'weight-ticket' | 'bol'
): Promise<string> {
  const fileName = `${transactionId}/${type}-${Date.now()}.pdf`

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.DOCUMENTS)
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.DOCUMENTS)
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

/**
 * Delete files from storage
 */
export async function deleteStorageFiles(
  bucket: keyof typeof STORAGE_BUCKETS,
  paths: string[]
): Promise<void> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .remove(paths)

  if (error) throw error
}
