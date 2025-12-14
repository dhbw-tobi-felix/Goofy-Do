# STRIDE
Basierend auf dem Data-Flow-Diagramm ([Abbildung 2](../00_Ziel_und_Architektur/01_Architektur.md#data-flow-diagramm)) 
werden im Folgenden potenzielle Bedrohungen gemäß dem STRIDE-Modell identifiziert und dokumentiert. Die Analyse umfasst 
sowohl die einzelnen Systemkomponenten als auch die Datenflüsse über die definierten Vertrauensgrenzen hinweg.
## 1 Komponenten
### 1.1 Frontend
| ID  | STRIDE | Beschreibung | Beispielangriff | Voraussetzungen | Gegenmaßnahmen | Status        |
|-----| --- | --- | --- | --- | --- |---------------|
| F01 | Spoofing | DNS-Spoofing: Nutzer landet auf gefälschtem Frontend. | Angreifer manipuliert DNS-Eintrag und leitet auf eine Phishing-Seite um | Unsichere oder kompromittierte DNS-Infrastruktur, fehlende Überprüfung der DNS-Integrität | Einsatz von DNSSEC, konsequentes HTTPS mit gültigen Zertifikaten | Akzeptiert    |
| F02 | Tampering | Manipulation des ausgelieferten HTML/CSS/JS | Kompromittiertes Frontend-Image liefert manipuliertes JS | Supply-Chain-Schwachstellen | Signierte Images, CI-gesteuertes Deployment | Implementiert |
| F03 | Repudiation | Fehlende request-bezogene Logs | Fehlende Logs verhindern Zuordnung von UI-Aktionen zu Usern | Kein Request-Logging | Zentralisiertes Logging | Akzeptiert    |
| F04 | Information disclouser | UI zeigt zu viele interne Daten | Stacktrace-Fehlerseiten mit Details der Infrastruktur | Debug-Mode in Prod, fehlende Maskierung | Generische Fehlerseiten, Output-Filter | Implementiert |
| F05 | Denial of service | Frontend-Service überlastet | Botnet sendet viele HTTP-Requests an Frontend | Keine Drosselung, WAF oder ähnliches | Rate-Limits, WAF, Autoscaling, Circuit-Breaker | Akzeptiert    |
| F06 | Elevation of privilege | Angreifer nutzt Schwachstellen im Frontend | Template-Injection | Veraltete Frameworks, fehlende Patches | Regelmäßige Updates, Security-Headers, Container-Härtung | Implementiert |

### 1.2 Backend
| ID  | STRIDE | Beschreibung                                                                     | Beispielangriff | Voraussetzungen                                                                       | Gegenmaßnahmen | Status        |
|-----| --- |----------------------------------------------------------------------------------| --- |----------------------------------------------------------------------------------------| --- |---------------|
| B01 | Spoofing | Andere Dienste geben sich als berechtigter Client aus                            | Angreifer-Pod ruft Backend-API mit gefälschtem Service-Account auf | Keine mTLS-Service-Identität, geteilte Secrets                                         | mTLS, Service-Account-Bindung, NetworkPolicies, Auth-Middleware | Implementiert |
| B02 | Tampering | Manipulation von REST-Requests                                                   | SQL-Injection ändert Daten im DB | Fehlende Input-Validierung, direkte SQL-Strings                                        | Prepared Statements, Input-Validation | Implementiert |
| B03 | Repudiation | Änderungen nicht nachvollziehbar                                                 | Unklar, wer Datensatz angelegt/geändert hat | Kein Audit-Feld, kein Änderungs-Log                                                    | Audit-Tabellen, Änderungs-Metadaten | Akzeptiert    |
| B04 | Information disclouser | UI bekommt zu viele interne Daten über API                                       | Client triggert einen Fehler (z. B. ungültige ID) und erhält Stacktrace | Keine zentrale Error-Handling-Policy, Fehlende Output-Filterung   | Standardisierte Fehlerantworten | Implementiert |
| B05 | Denial of service | Backend überlastet durch große Requests                                          | Angreifer ruft komplexe Reports in Schleife auf | Ressourcenintensive Endpunkte ohne Limitierung                                         | Rate-Limits, Caching, Zeit-/Ressourcen-Limits, Queues | Akzeptiert    |
| B06 | Elevation of privilege | Unbefugte Adminaktionen durch fehlerhafte oder fehlende Autorisierung im Backend | Ein normaler Benutzer kann über die Backend-API Admin-Endpunkte aufrufen | Fehlende oder falsch konfigurierte RBAC/ABAC-Regeln im Backend, fehlende Rollenprüfung | Strikte serverseitige RBAC/ABAC-Durchsetzung, „deny by default“ für alle sensiblen Endpunkte | Implementiert |

### 1.3 Keycloak
| ID  | STRIDE | Beschreibung | Beispielangriff | Voraussetzungen | Gegenmaßnahmen | Status        |
|-----| --- | --- | --- | --- | --- |---------------|
| K01 | Spoofing | Angreifer gibt sich als legitimer Benutzer aus | Credential-Stuffing auf Keycloak-Login | Schwache Passwörter, kein MFA | MFA, Passwort-Richtlinien, IP-Reputation, Lockout, Bot-Schutz | Implementiert |
| K02 | Tampering | Manipulation von Rollen/Konfiguration | Kompromittierter Admin ändert Rollen und vergibt Admin-Rechte | Weitreichende Admin-Konten, keine 4-Augen-Freigabe | Least-Privilege-Admin-Rollen, Change-Management, Approval-Prozess | Implementiert |
| K03 | Repudiation | Änderungen an Identitäten nicht nachvollziehbar | Unklar, wer wann welche Rolle verändert oder Client registriert hat | Kein Audit-Log an Keycloak | Aktivierte Admin-/Auth-Logs, zentrale Log-Aggregation | Implementiert |
| K04 | Information disclouser | Offenlegung von Token-/Profil-Daten | Fehlkonfiguration erlaubt Auslesen aller Userprofile per Admin-API | Fehlkonfigurierte Admin-Rechte, kein Realm-Split | Feingranulare Admin-Rechte, Zugriffskontrolle, Verschlüsselung sensibler Felder | Implementiert |
| K05 | Denial of service | Auth-Service nicht erreichbar | Login-DoS durch massenhaft falsche Logins | Kein Rate-Limit, schwache Skalierung | Rate-Limits, CAPTCHA, Autoscaling | Akzeptiert    |
| K06 | Elevation of privilege | Aus normalen Konten werden Admins | Schwachstelle erlaubt direkte Token-Manipulation oder Admin-Creation | Alte Version, bekannte CVEs | Regelmäßige Updates,  Monitoring von Admin-Aktionen | Implementiert |

### 1.4 Datenbank
| ID   | STRIDE | Beschreibung | Beispielangriff | Voraussetzungen                                                                         | Gegenmaßnahmen                                                                        | Status        |
|------| --- | --- | --- |------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|---------------|
| DB01 | Spoofing | Unbefugter gibt sich als legitimer DB-Client aus | Angreifer erlangt DB-Credentials und verbindet sich direkt zur DB als Applikationsuser | DB aus untrusted Netzen erreichbar, statische Credentials                                | DB nur privat/segmentiert, Allowlist nur App-Subnetze | Akzeptiert    |
| DB02 | Tampering | Veränderung oder Löschung von Daten | SQL-Injection ändert Kontensalden oder löscht Tabellen | Unsichere Queries im Backend                                                             | Prepared Statements, Rechte-Trennung (kein DROP/ALTER für App-User), regelmäßige Backups | Implementiert |
| DB03 | Repudiation | Änderungen an Daten nicht nachvollziehbar | Unklar, wer sensible Datensätze bearbeitet oder gelöscht hat | Kein DB-Audit, keine Änderungs-Historie                                                  | DB-Audit-Logging, Change-Tables                                                       | Implementiert |
| DB04 | Information disclouser | Sensible Daten werden unberechtigt gelesen | Fehlkonfigurierte DB-Rolle erlaubt SELECT auf Tabellen | Weitreichende Lese-Rechte, fehlende Klassifizierung/Maskierung, unverschlüsselte Backups | Feingranulare Admin-Rechte, Zugriffskontrolle, Verschlüsselung sensibler Felder       | Implementiert |
| DB05 | Denial of service | DB nicht erreichbar / extrem langsam | Komplexe Queries | Keine Query-Limits, kein Monitoring                                                      | Query-Time-Limit, Indexierung, Ressourcen-Monitoring                                  | Akzeptiert    |
| DB06 | Elevation of privilege | App-User bekommt DB-Admin-Rechte | App-User besitzt SUPERUSER oder kann SET ROLE zu höherem Account | Falsches Rollen-Konzept                                                                  | Strenges RBAC auf DB-Ebene, kein SUPERUSER für App-Accounts                           | Implementiert |

## 2 Datenflüsse über Vertrauensgrenzen

### 2.1 User-Client zu Frontend
| ID   | STRIDE | Beschreibung | Beispielangriff | Voraussetzungen | Gegenmaßnahmen | Status        |
|------| --- | --- | --- | --- | --- |---------------|
| CF01 | Spoofing | Angreifer gibt sich als legitimer User/Service aus | Session-Hijacking, gefälschte Requests mit gestohlenem Access-Token | Unsichere Cookies, kein TLS | HTTPS, Secure/HttpOnly-Cookies, MFA, Token-Binding | Implementiert |
| CF02 | Tampering | Manipulation von Requests/Responses | Proxy ändert Formulardaten oder Response-Body | Kein TLS | TLS erzwingen, Input-Validierung, Output-Encoding | Implementiert |
| CF03 | Repudiation | User-Aktionen nicht nachweisbar | Nutzer bestreitet Änderung, Logs fehlen | Keine korrelierten Logs | Request-/Audit-Logging mit User-ID, Zeit, IP, Signatur wichtiger Transaktionen | Implementiert |
| CF04 | Information disclouser | Vertrauliche Daten UI offengelegt | Session-ID in URL, PII in Fehlermeldungen | Unsichere Defaults, Debug-Infos | TLS, PII-Minimierung, generische Fehlermeldungen, keine IDs in URL | Implementiert |
| CF05 | Denial of service | Dienst über UI-Schnittstelle überlastet | Botnet sendet massenhaft Requests an Frontend-Endpoints | Öffentliche API ohne Rate-Limit | Rate-Limit, WAF, Captcha, Throttling | Akzeptiert    |
| CF06 | Elevation of privilege | Unbefugte Admin-Aktionen über UI | Normaler User manipuliert Client-Side-Role-Flags und ruft Admin-API auf | Autorisierung nur im Frontend, kein Backend-Check | Strikte RBAC/ABAC im Backend, „deny by default“, keine Client-Side-Security-Entscheidungen |       Implementiert        |

### 2.2 Entwickler-Umgebung zu GitHub

| ID   | STRIDE | Beschreibung | Beispielangriff | Voraussetzungen | Gegenmaßnahmen | Status     |
|------| --- | --- | --- | --- |----------------|------------|
| EG01 | Spoofing | Angreifer gibt sich als Dev gegenüber GitHub aus | Gestohlener SSH-Key | Unsichere Schlüssel, kein MFA | SSH/TLS, MFA, IP-Restriktionen | Implementiert |
| EG02 | Tampering | Manipulation von Code während Übertragung | Ändert Git-Objekte bei ungeschützter Verbindung | Kein TLS/SSH | Erzwinge TLS/SSH, Zertifikats-Pinning | Implementiert |
| EG03 | Repudiation | Commit-Herkunft bestreitbar | Developer streitet commit ab, Identität unklar | Keine Signaturen | GPG/SSH-Commit-Signaturen, Logs auf GitHub | Implementiert |
| EG04 | Information disclouser | Code/Secrets auf Transportweg abgegriffen | Mitschnitt von HTTP/SSH-Traffic in unsicheren Netzen | Kein TLS, offene WLANs | Ende-zu-Ende-Verschlüsselung, VPN, keine Nutzung ungesicherter Netze | Implementiert |
| EG05 | Denial of service | Git-Service für Devs gestört | Massives Clone/Push, Rate-Limit überschritten | Kein Limit, öffentlich erreichbar | Rate-Limits, Abuse-Detection, Spiegel-Repos | Akzeptiert |
| EG06 | Elevation of privilege | CI/CD über Code-Push missbraucht | Änderung von Pipeline-Configs im Repo führt zu mehr Rechten | CI nutzt Repo-Konfiguration ungeprüft | Separate Infrastruktur Repos, Reviews für CI-Config, Policies für Änderungen von Pipelines | Akzeptiert |

