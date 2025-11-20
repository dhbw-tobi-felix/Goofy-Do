-- Nur für lokale Entwicklung – NICHT für Produktion

-- User app anlegen
CREATE USER app WITH PASSWORD 'secret';

-- Datenbanken erstellen
CREATE DATABASE appdb OWNER app;
CREATE DATABASE keycloakdb OWNER root;