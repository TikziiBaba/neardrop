-- 20260903000002_fix_free_quota_2gb.sql
-- Downscale all legacy free accounts from 10 GB / 1 TB to 2 GB and set column default to 2 GB (2147483648 bytes)

UPDATE profiles
SET quota_bytes = 2147483648
WHERE (subscription_tier = 'free' OR subscription_tier IS NULL)
  AND quota_bytes > 2147483648;

ALTER TABLE profiles
ALTER COLUMN quota_bytes SET DEFAULT 2147483648;
