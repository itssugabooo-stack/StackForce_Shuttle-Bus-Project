ALTER TABLE "routes"
ADD COLUMN IF NOT EXISTS "geometry" geography;
