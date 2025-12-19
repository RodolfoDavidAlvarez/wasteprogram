-- Create Supabase Storage bucket for delivery documentation photos
-- Bucket: delivery-photos

-- 1) Create bucket if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'delivery-photos'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('delivery-photos', 'delivery-photos', true);
  ELSE
    -- ensure public (idempotent)
    UPDATE storage.buckets
    SET public = true
    WHERE id = 'delivery-photos';
  END IF;
END $$;

