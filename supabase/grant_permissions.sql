-- Grants basic permissions that might be missing
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant access to tables explicitly
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Ensure sequences are accessible
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
