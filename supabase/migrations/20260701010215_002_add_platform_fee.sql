/*
# Add platform fee field to call_ups

## Changes
- Add `platform_fee_percent` column to call_ups table (default 10%)
- Add `net_amount` column to show what the player receives

This allows organizers to see the breakdown of gross payment vs net payment.
*/

ALTER TABLE call_ups 
ADD COLUMN IF NOT EXISTS platform_fee_percent numeric(5,2) DEFAULT 10.00;

ALTER TABLE call_ups
ADD COLUMN IF NOT EXISTS net_amount numeric(10,2);

-- Update existing records to calculate net_amount
UPDATE call_ups 
SET net_amount = CASE 
  WHEN payment_amount IS NOT NULL THEN ROUND(payment_amount * (1 - COALESCE(platform_fee_percent, 10) / 100), 2)
  ELSE NULL 
END
WHERE payment_amount IS NOT NULL;