# Weitere Features
Neben den grundlegenden Sicherheitsfunktionen bietet unser System eine Reihe weiterer Features, die den Schutz und die 
Benutzerfreundlichkeit erhöhen.
## Zwei-Faktor-Authentifizierung über One-Time-Passwords
Ein zentrales Extra ist die Unterstützung von One-Time Passwords (OTP) als zweite Authentifizierungsstufe (2FA). 
Dadurch kann ein zusätzlicher Faktor in den Login-Prozess eingebunden werden, sodass ein kompromittiertes Passwort 
allein nicht ausreicht, um Zugriff auf ein Konto zu erhalten. Damit erhöht sich die Widerstandsfähigkeit gegenüber 
typischen Angriffsszenarien wie Credential Stuffing oder Passwort-Leaks deutlich.
## Session-Timeout
Um das Risiko unbefugter Zugriffe durch vergessene oder unbeaufsichtigte Sessions zu minimieren, haben wir ein automatisches Session-Timeout 
implementiert. Nach 30 Minuten Inaktivität wird der Benutzer automatisch abgemeldet und muss sich erneut authentifizieren, um weiterarbeiten zu können. 
## Single Sign-On mit Keycloak
Darüber hinaus ist Single Sign-On (SSO) über Keycloak nicht nur für die Hauptanwendung umgesetzt, sondern auch für 
weitere interne bzw. administrative Bereiche. Konkret sind die Pfade .local/auth, /swagger und /openapi in das SSO-Konzept 
integriert. Dadurch wird sichergestellt, dass auch Dokumentation und Schnittstellen-Tools konsistent über denselben 
Authentifizierungs- und Autorisierungsmechanismus abgesichert werden. Gleichzeitig reduziert dies den 
Administrationsaufwand, da zentrale Rollen- und Sessionverwaltung über Keycloak erfolgt.
## Passkeys
Als weiteres Feature unterstützt die Anwendung Passkeys. Damit steht eine moderne, phishing-resistentere Alternative zu 
klassischen Passwörtern zur Verfügung. Passkeys ermöglichen eine benutzerfreundliche Anmeldung, die in der Praxis sowohl 
Sicherheit als auch Usability verbessert, da keine wiederverwendbaren Geheimnisse übertragen oder gespeichert werden müssen
und sich die Anmeldung stärker an Geräte- bzw. Plattformmechanismen anlehnen kann.