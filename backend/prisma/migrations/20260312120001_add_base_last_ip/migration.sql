-- Add BaseDevice.lastIp (required by seed.js and runtime notifications)
ALTER TABLE "BaseDevice" ADD COLUMN IF NOT EXISTS "lastIp" TEXT;
