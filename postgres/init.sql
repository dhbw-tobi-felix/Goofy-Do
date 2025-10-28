-- User zuerst
DO
$$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app') THEN
            CREATE USER app WITH PASSWORD 'secret';
        END IF;
    END
$$;

-- DBs dem richtigen Owner geben
CREATE DATABASE appdb OWNER app;
CREATE DATABASE keycloakdb OWNER root;