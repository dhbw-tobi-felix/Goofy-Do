-- nur für lokale Entwicklung

DO
$$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app') THEN
            CREATE USER app WITH PASSWORD 'secret';
        END IF;
    END
$$ LANGUAGE plpgsql;

DO
$$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'appdb') THEN
            CREATE DATABASE appdb OWNER app;
        END IF;

        IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloakdb') THEN
            CREATE DATABASE keycloakdb OWNER root;
        END IF;
    END
$$ LANGUAGE plpgsql;