-- Connect to PostgreSQL as superuser (postgres)
-- psql -U postgres -h localhost

-- Create the user
CREATE USER sura_d4rky WITH PASSWORD 'Mr.D4rky007@sura';

-- Create the database
CREATE DATABASE sura OWNER sura_d4rky;

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE sura TO sura_d4rky;

-- Connect to the sura database
\c sura

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO sura_d4rky;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sura_d4rky;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sura_d4rky;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO sura_d4rky;

-- Grant default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sura_d4rky;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sura_d4rky;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO sura_d4rky;

-- Optional: Make the user able to create databases (if needed for testing)
ALTER USER sura_d4rky CREATEDB;

-- Verify the setup
\du sura_d4rky
\l sura