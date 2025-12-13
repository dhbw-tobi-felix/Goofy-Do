# Sicherheitsfeatures
## 1 Frontend
### F01 Spoofing - Risiko akzeptiert
In produktiven Szenarien wäre die Härtung der Namensauflösung (z. B. DNSSEC) eine erforderliche Maßnahme. In 
unserem Projekt wird die Anwendung jedoch nicht als öffentlich erreichbarer Dienst unter eigener Domain betrieben, 
sondern im Rahmen der Entwicklung lokal ausgeführt. Damit fehlt die technische Voraussetzung, DNSSEC oder vergleichbare 
DNS-seitige Integritätsmechanismen überhaupt korrekt zu konfigurieren und nachweisbar zu verifizieren. 
Aus diesem Grund wurde das Risiko in der Frontend-Komponente akzeptiert. Als Baseline wurde dennoch 
konsequentes HTTPS mit gültigen Zertifikaten als Zielzustand implementiert.
### F02 Tampering: - Implementiert
Dieses Risiko ist für Single-Page-Applications besonders relevant, da manipuliertes JavaScript unmittelbar zur 
Token-Exfiltration, zu unautorisierten API-Aufrufen oder zur verdeckten Datenabgabe genutzt werden kann. Die Integrität
der Auslieferung wird über eine abgesicherte Supply-Chain realisiert. 
Das Repository wird über GitHub verwaltet, die CI/CD-Pipeline mittels GitHub Actions integriert
SBOM-Erzeugung, SAST, SCA sowie Secret Scanning, bevor ein Container-Image gebaut wird. Dieses Image wird signiert und 
anschließend in ein Kubernetes-Cluster ausgerollt. Dadurch wird die Wahrscheinlichkeit reduziert, dass manipulierte 
Artefakte unbemerkt in die Auslieferung gelangen, und es entsteht eine nachvollziehbare Kette von Prüf- und 
Kontrollpunkten zwischen Code, Build und Deployment. 
### F03 Repudiation - Risiko akzeptiert
Für das Frontend wurde diese Kategorie nicht als primärer Implementierungsschwerpunkt gewählt, da eine robuste 
Repudiation-Abwehr an der Stelle erfolgen muss, an der zustandsverändernde Operationen autoritativ entschieden und 
persistiert werden. Dies ist in der Systemarchitektur das Backend in Verbindung mit der Datenhaltung, nicht die 
UI-Schicht. Eine Frontend-seitige Protokollierung würde zudem entweder nur eingeschränkt aussagekräftige Daten liefern 
oder den Umfang der erhobenen Client-Telemetrie erhöhen und damit zusätzliche datenschutzrechtliche und konzeptionelle 
Anforderungen (Zweckbindung, Datenminimierung, Aufbewahrungsfristen) erzeugen.
### F04 Information Disclosure - Implementiert
Diese Kategorie wurde durch generische Fehlerseiten und eine standardisierte, zurückhaltende Fehlerkommunikation gegenüber dem
Client implementiert. Ziel ist, keine Rückschlüsse auf interne Infrastruktur, Bibliotheksstände oder Systemzustände zu ermöglichen 
und zugleich die Datenminimierung in der UI zu unterstützen. Ergänzend trägt eine konsistente Input-Validierung dazu 
bei, fehlerinduzierte Informationsabflüsse zu reduzieren, auch wenn die sicherheitsrelevante Validierung zwingend serverseitig erfolgen muss.
### F05 Denial of Service - Risiko akzeptiert
Wirksame Abwehrmaßnahmen liegen typischerweise an der Perimeter-/Ingress-Schicht (z. B. WAF, Rate-Limits, 
Bot-Protection) und benötigen eine produktionsnahe Konfiguration, Monitoring sowie aussagekräftige Last- und 
Stabilitätstests, um Effektivität und Nebenwirkungen beurteilen zu können. Diese Voraussetzungen waren im Rahmen des 
Projektumfangs und der vorgesehenen Umgebung nur eingeschränkt gegeben, wodurch eine saubere Implementierung und 
Verifikation nicht zuverlässig möglich wäre. Das Risiko wird daher akzeptiert und als Empfehlung für ein 
produktionsnahes Setup (Rate-Limits am Ingress, Request-Limits, Caching, Monitoring/Alerting) dokumentiert.
### F06 Elevation of Privilege - Implementiert
Die Abwehr dieser Kategorie erfolgt durch eine strikte Trennung von Rollen und Berechtigungen im Zusammenspiel
mit dem Identity Provider Keycloak. Das Frontend fordert Access-Tokens mit den jeweils erforderlichen Rollen an und 
übermittelt diese bei API-Aufrufen an das Backend. Dadurch wird sichergestellt, dass nur autorisierte Operationen 
durchgeführt werden können. Ergänzend wird die UI so gestaltet, dass nur die für die jeweilige Rolle relevanten 
Funktionalitäten angezeigt werden, um die Angriffsfläche zu reduzieren und versehentliche Fehlbedienungen zu vermeiden.
## 2 Backend
### B01 Spoofing - Implementiert
Die Benutzerauthentifizierung erfolgt über den Identity Provider Keycloak, der E-Mail, Passwort und 2FA unterstützt. 
Die Kommunikation zwischen Frontend, Backend und Keycloak erfolgt ausschließlich über HTTPS mit gültigen Zertifikaten,
um Man-in-the-Middle-Angriffe zu verhindern. Zusätzlich werden Access-Tokens verwendet, die vom Backend validiert werden,
um sicherzustellen, dass nur authentifizierte Benutzer Zugriff auf geschützte Ressourcen erhalten.
### B02 Tampering - Implementiert
Die Umsetzung erfolgt durch serverseitige Input-Validierung und die Nutzung sicherer Datenbankzugriffe mittels 
parametrisierter Queries bzw. Prepared Statements, sodass Benutzereingaben nicht als ausführbare Query-Bestandteile 
interpretiert werden können. Dadurch wird die Manipulation von Daten durch Eingabe-basiertes Tampering wirksam reduziert
und die Konsistenz der Datenhaltung geschützt.
### B03 Repudiation - Risiko akzeptiert
Die Protokollierung von Benutzer- und Administratoraktionen ist zwar grundsätzlich implementiert, jedoch wurde
auf eine umfassende, manipulationssichere Audit-Log-Funktionalität verzichtet. Dies liegt daran, dass eine robuste Repudiation-Abwehr
eine sorgfältige Konzeption der Log-Struktur, -Inhalte und -Aufbewahrung erfordert, um Manipulationen zu verhindern und 
rechtliche Anforderungen zu erfüllen. Im Rahmen des Projektumfangs war dies nur eingeschränkt umsetzbar, weshalb das Risiko akzeptiert wird.
### B04 Information Disclosure - Implementiert
Die Umsetzung erfolgt durch standardisierte Fehlerantworten und ein zentrales Error-Handling, das technische Details 
konsequent unterdrückt und nur notwendige, fachlich sinnvolle Informationen an den Client zurückgibt. Ergänzend 
reduziert serverseitige Input-Validierung die Wahrscheinlichkeit unerwarteter Exceptions und damit die Gefahr, dass 
interne Zustände unbeabsichtigt nach außen sichtbar werden.
### B05 Denial of Service - Risiko akzeptiert
Obwohl Gegenmaßnahmen wie Rate-Limits, Caching, Zeit-/Ressourcenlimits oder asynchrone Verarbeitung grundsätzlich 
geeignet sind, wurde diese Kategorie im Projekt nicht vollständig implementiert. Der wesentliche Grund ist, dass eine 
wirksame DoS-Resilienz eine produktionsnahe Dimensionierung und Validierung erfordert, insbesondere durch Monitoring, 
definierte Grenzwerte und aussagekräftige Last- und Stabilitätstests. Ohne diese Voraussetzungen besteht das Risiko, 
Schutzmechanismen entweder ineffektiv oder funktional störend zu konfigurieren. Das Risiko wird daher akzeptiert und 
als Empfehlung für produktionsnahe Setups dokumentiert
### B06 Elevation of Privilege - Implementiert
Diese Kategorie wurde implementiert, da Autorisierung im Sicherheitsmodell bewusst ausschließlich serverseitig 
durchgesetzt wird und clientseitige Einschränkungen nicht als Sicherheitskontrolle gelten. Die Umsetzung erfolgt durch 
strikte RBAC/ABAC-Prüfungen mithilfe Keycloaks pro Endpoint nach dem Prinzip „deny by default“, wobei die Rollen- und 
Claim-Informationen aus den von Keycloak ausgestellten Access-Tokens abgeleitet werden. Dadurch wird sichergestellt, 
dass auch bei manipulierten Frontend-Requests oder dem direkten Aufruf von Endpunkten keine Privilegieneskalation 
möglich ist, sofern die erforderlichen Rollen bzw. Berechtigungen nicht nachweislich im Token vorhanden sind.
## 3 Keycloak
### K01 Spoofing - Implementiert
Die Umsetzung erfolgt durch die Aktivierung von 
Multi-Faktor-Authentisierung (MFA) sowie durch geeignete Richtlinien zur Erhöhung der Authentisierungsstärke, 
insbesondere Passwort-Richtlinien und Schutzmechanismen gegen automatisierte Login-Versuche.
### K02 Tampering - Implementiert
Die Umsetzung erfolgt durch die Einschränkung administrativer Berechtigungen nach dem Least-Privilege-Prinzip sowie 
durch organisatorische und technische Kontrollen zur Nachvollziehbarkeit und Kontrolle von Änderungen.
### K03 Repudiation - Implementiert
Die Umsetzung erfolgt durch aktivierte Admin- und Authentisierungs-Logs sowie deren Einbindung in ein zentrales 
Logging-Konzept.
### K04 Information Disclosure - Implementiert
Die Umsetzung erfolgt durch feingranulare administrative Berechtigungen und eine restriktive Zugriffskontrolle auf 
administrative Schnittstellen, sodass nur explizit berechtigte Akteure auf sensitive Identitäts- oder 
Konfigurationsdaten zugreifen können. 
### K05 Denial of Service - Risiko akzeptiert
Eine wirksame DoS-Abwehr erfordert eine produktionsnahe Konfiguration am Perimeter (z. B. WAF/Ingress), belastbare 
Last- und Stabilitätstests sowie Monitoring und Tuning, um Schutzmechanismen angemessen zu dimensionieren und 
Nebenwirkungen (z. B. Lockouts legitimer Nutzer) zu vermeiden. Diese Voraussetzungen waren im Projektumfang nur 
eingeschränkt gegeben, weshalb das Risiko akzeptiert und als Empfehlung für produktionsnahe Deployments dokumentiert 
wurde.
### K06 Elevation of Privilege - Implementiert
Die Umsetzung erfolgt durch konsequente Härtung und Pflege der Keycloak-Instanz, insbesondere durch regelmäßige Updates 
zur Reduktion bekannter Schwachstellen, sowie durch Monitoring und Protokollierung administrativer Aktionen. Ergänzend 
wird das Rollen- und Admin-Rechtemodell restriktiv gehalten, sodass privilegierte Operationen nur explizit berechtigten 
Konten möglich sind und sicherheitsrelevante Änderungen nachvollziehbar bleiben.
## 4 Datenbank
### DB01 Spoofing - Risiko akzeptiert
In produktiven Umgebungen würde dies typischerweise durch strikte Netzwerksegmentierung (keine Erreichbarkeit aus 
untrusted Netzen), starke Authentisierung, Secret-Rotation und eine eng gefasste Allowlist auf DB-Ebene adressiert. Im 
Projekt wurde diese Kategorie nicht vollständig umgesetzt und als Risiko akzeptiert, da eine robuste Spoofing-Abwehr eine
produktive Netzwerktopologie und eine sorgfältige Konfiguration erfordert, die im Rahmen des Projektumfangs nur 
eingeschränkt realisierbar war.
### DB02 Tampering - Implementiert
Die Umsetzung erfolgt durch die Nutzung sicherer Datenbankzugriffe mittels parametrisierter Queries bzw. Prepared 
Statements, sodass Benutzereingaben nicht als ausführbare Query-Bestandteile interpretiert werden können, sowie sowie 
durch eine restriktive Rechtevergabe für den Applications-DB-User, sodass gefährliche Operationen wie DROP/ALTER nicht 
durch den regulären Anwendungskontext ausgeführt werden können.
### DB03 Repudiation - Risiko akzeptiert
Die Umsetzung erfolgt durch aktiviertes Datenbank-Audit-Logging bzw. Change-Tracking-Mechanismen (z. B. Change-Tables), 
sodass relevante Änderungen protokolliert und im Nachhinein ausgewertet werden können. Dadurch wird die Transparenz 
über Datenänderungen erhöht und die Analyse von unerwarteten Manipulations- oder Fehlzuständen erleichtert.
### DB04 Information Disclosure - Implementiert
Die Umsetzung erfolgt durch feingranulare Rollen- und Rechtekonzepte sowie eine restriktive Zugriffskontrolle, sodass 
der Applikationskontext nur auf fachlich erforderliche Tabellen und Operationen zugreifen kann. Zusätzlich werden im 
laufenden Betrieb sensible Datenfelder und Backups verschlüsselt.
### DB05 Denial of Service - Risiko akzeptiert
Eine wirksame DoS-Abwehr erfordert eine produktionsnahe Konfiguration am Perimeter (z. B. WAF/Ingress), belastbare
Last- und Stabilitätstests sowie Monitoring und Tuning, um Schutzmechanismen angemessen zu dimensionieren und
Nebenwirkungen (z. B. Lockouts legitimer Nutzer) zu vermeiden. Diese Voraussetzungen waren im Projektumfang nur
eingeschränkt gegeben, weshalb das Risiko akzeptiert und als Empfehlung für produktionsnahe Deployments dokumentiert
wurde.
### DB06 Elevation of Privilege - Implementiert
Die Umsetzung erfolgt durch ein strenges Rollen- und Rechtekonzept mit klarer Trennung zwischen Applikations- und 
Administrationsrechten, sodass der Applikations-User keine erweiterten Privilegien besitzt und keine administrativen 
Operationen durchführen kann.
## 5 Datenfluss zwischen User-Client und Frontend
### CF01 Spoofing - Implementiert
Die Umsetzung erfolgt durch konsequentes TLS/HTTPS zur Absicherung der Transportauthentizität sowie durch die Nutzung 
sicherer Cookie-Attribute (Secure, HttpOnly) zur Reduktion von Token- und Session-Exposure im Browser. Ergänzend stärkt
die Keycloak-Integration mit MFA die Authentisierung, wodurch das Risiko unautorisierter Accountnutzung bei 
kompromittierten Credentials reduziert wird.
### CF02 Tampering - Implementiert
Die Umsetzung erfolgt durch erzwungenes TLS/HTTPS, wodurch Manipulationen auf dem Transportweg wirksam erschwert werden.
Ergänzend werden Eingaben validiert und Ausgaben kontextgerecht behandelt, um sicherzustellen, dass auch bei 
unerwarteten Eingaben keine sicherheitsrelevanten Folgezustände entstehen.
### CF03 Repudiation - Implementiert
Die Umsetzung erfolgt durch Request- und Audit-Logging mit Bezug zur Benutzeridentität (User-ID), Zeitstempel und 
weiteren Kontextinformationen, sodass Aktionen systematisch nachvollzogen werden können.
### CF04 Information Disclosure - Implementiert
Die Umsetzung erfolgt durch TLS/HTTPS, die Minimierung personenbezogener Daten in der Client-Kommunikation sowie durch 
generische Fehlermeldungen ohne sensitive Details. Ergänzend wird darauf geachtet, dass keine sensitiven Identifikatoren 
über URL-Parameter transportiert werden, um unbeabsichtigte Offenlegungen über Referrer-Header, Browser-Historie oder 
Logs zu verhindern.
### CF05 Denial of Service - Risiko akzeptiert
Eine wirksame DoS-Abwehr erfordert eine produktionsnahe Konfiguration am Perimeter (z. B. WAF/Ingress), belastbare
Last- und Stabilitätstests sowie Monitoring und Tuning, um Schutzmechanismen angemessen zu dimensionieren und
Nebenwirkungen (z. B. Lockouts legitimer Nutzer) zu vermeiden. Diese Voraussetzungen waren im Projektumfang nur
eingeschränkt gegeben, weshalb das Risiko akzeptiert und als Empfehlung für produktionsnahe Deployments dokumentiert
wurde.
### CF06 Elevation of Privilege - Implementiert
Die Umsetzung erfolgt durch die konsequente serverseitige Durchsetzung von RBAC/ABAC im Backend nach dem Prinzip 
„deny by default“, sodass privilegierte Operationen ausschließlich bei nachweislich vorhandenen Berechtigungen im 
Access-Token ausgeführt werden.
## 6 Datenfluss zwischen Entwickler und GitHub
### EG01 Spoofing - Implementiert
Die Umsetzung erfolgt durch abgesicherte Authentisierung gegenüber GitHub, insbesondere durch die Nutzung sicherer 
Transport- und Authentisierungsmechanismen (SSH/TLS) sowie durch den Schutz der Entwicklerkonten mittels 
Multi-Faktor-Authentisierung.
### EG02 Tampering - Implementiert
Die Umsetzung erfolgt durch die konsequente Nutzung von TLS/SSH für Git-Operationen, wodurch die Integrität und 
Authentizität der Verbindung abgesichert und Manipulationen auf dem Transportweg wirksam erschwert werden.
### EG03 Repudiation - Implementiert
Die Umsetzung erfolgt durch die Verwendung von Commit-Signaturen (GPG oder SSH-Signaturen), sodass Commits 
kryptographisch an eine Entwickleridentität gebunden werden. Ergänzend stellen die GitHub-internen Audit- und 
Ereignisprotokolle die Nachvollziehbarkeit von Push-, Review- und Merge-Vorgängen sicher und erhöhen damit die 
Transparenz über den Änderungsverlauf.
### EG04 Information Disclosure - Implementiert
Die Umsetzung erfolgt durch die Nutzung von Repositories mit restriktiven Zugriffsrechten, sodass nur autorisierte 
Entwickler Änderungen auf den Quellcode und die zugehörigen Artefakte haben.
### EG05 Denial of Service - Risiko akzeptiert
Eine wirksame DoS-Abwehr erfordert eine produktionsnahe Konfiguration am Perimeter (z. B. WAF/Ingress), belastbare
Last- und Stabilitätstests sowie Monitoring und Tuning, um Schutzmechanismen angemessen zu dimensionieren und
Nebenwirkungen (z. B. Lockouts legitimer Nutzer) zu vermeiden. Diese Voraussetzungen waren im Projektumfang nur
eingeschränkt gegeben, weshalb das Risiko akzeptiert und als Empfehlung für produktionsnahe Deployments dokumentiert
wurde.
### EG06 Elevation of Privilege - Risiko akzeptiert
Diese Kategorie wurde im Projekt als Risiko akzeptiert, da eine vollständige Absicherung typischerweise weitergehende 
organisatorische und technische Kontrollen erfordert, etwa eine strikte Trennung von Infrastruktur- und 
Applikations-Repositories, verpflichtende Reviews für Workflow-Änderungen, branch protection rules sowie Policy-as-Code 
zur Durchsetzung von Freigabeprozessen. Obwohl im Projekt bereits Sicherheitsprüfungen in der Pipeline 
(SBOM, SAST, SCA, Secret Scanning) sowie restriktive Token-Rechte integriert sind, wurde die umfassende Governance für
CI/CD-Änderungen nicht vollumfänglich umgesetzt, da dies über den vorgesehenen Implementierungsumfang hinausgeht.