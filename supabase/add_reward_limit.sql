-- Add limit_quantity column to cf_reward table if it doesn't exist

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'cf_reward'
        AND column_name = 'limit_quantity'
    ) THEN
        ALTER TABLE cf_reward ADD COLUMN limit_quantity INTEGER;
    END IF;
END $$;
