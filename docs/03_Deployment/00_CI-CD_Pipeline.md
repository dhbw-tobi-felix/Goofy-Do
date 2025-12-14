# CI/CD Pipeline 
Im Folgenden wird der Deployment-Prozess der Web-Applikation beschrieben. Der Quellcode wird in einem GitHub-Repository 
versioniert. Jeder Commit auf den main-Branch triggert automatisch die CI/CD-Pipeline, die in GitHub Actions umgesetzt 
ist. Innerhalb dieser Pipeline werden zunächst sicherheitsrelevante Prüfungen durchgeführt.
### SAST-Scan 
Zur statischen Analyse des Quellcodes. CodeQL läuft dabei in einer Matrix für zwei Sprachwelten: einmal Java/Kotlin 
(Backend) mit manuellem Build und einmal JavaScript/TypeScript (Frontend) ohne Build-Schritt. Für Java/Kotlin wird 
JDK 21 eingerichtet, ein Gradle-Cache genutzt, anschließend CodeQL initialisiert und das Backend (ohne Tests) gebaut. 
Danach erfolgt die CodeQL-Analyse mit den „security-and-quality“-Queries.
#### Output
Die Ergebnisse werden als SARIF in GitHub hochgeladen und erscheinen im Security Tab als CodeQL-Alerts (kategorisiert je Sprache).
#### Quality Gate
Ein explizites inhaltliches Gate ist in der Workflow-Definition nicht hinterlegt. Findings werden zuverlässig reportet,
blockieren aber auf Workflow-Ebene nicht automatisch aufgrund einer Severity-Schwelle.
### SBOM + SCA
Zunächst wird der Code ausgecheckt und JDK 21 eingerichtet. Danach werden Syft sowie Trivy installiert. Für eine 
verwertbare Abhängigkeitsanalyse wird das Backend gebaut (Quarkus), und im Frontend werden die Dependencies via npm ci 
installiert. Anschließend werden SBOMs erstellt:
- Backend Project SBOM (CycloneDX) via Trivy FS-Scan (ohne backend/build)
- Backend Runtime SBOM (SPDX) via Syft auf dem gebauten Quarkus Runtime-Lib-Verzeichnis
- Frontend SBOM (CycloneDX) via Trivy FS-Scan (ohne node_modules)  

Auf Basis dieser SBOMs wird dann SCA durchgeführt, jeweils als JSON-Report und zusätzlich als SARIF für die GitHub 
Security-Ansicht.
#### Output
- SBOM-Artefakte als Pipeline-Artifacts (CycloneDX und SPDX)
- SCA JSON-Reports (sca-backend.json, sca-frontend.json)
- SCA SARIF-Reports (Backend/Frontend) im Security Tab + als Artifact-Upload  

#### Quality Gate
Die Pipeline bricht fehl (Exit 1), sobald im SCA-JSON HIGH oder CRITICAL Vulnerabilities gefunden werden oder ein Score 
CVSS ≥ 7 auftritt. Zusätzlich werden unfixed Findings ignoriert.

### Secret-Scan
Es wird mit vollständiger Historie ausgecheckt, anschließend wird Gitleaks installiert und ein Secret-Scan über das
Repository ausgeführt. Die Ergebnisse werden als SARIF erzeugt und in GitHub hochgeladen.
#### Output
- reports/gitleaks.sarif als Artifact
- Upload in den GitHub Security Tab
#### Quality Gate
- Gitleaks läuft mit --exit-code 1, d. h. gefundene Secrets führen zu einem Job-Fail.
- Auf Pull Requests wird derselbe Scan zwar ausgeführt, aber mit continue-on-error, damit PRs nicht sofort hart blockiert werden, sondern Findings zuerst sichtbar gemacht werden können.
- Die Action erzwingt, dass eine SARIF-Datei existiert („Ensure SARIF exists“), sodass Reporting nicht stillschweigend ausfällt.

### Build, Publish & Sign (Backend, Frontend, Keycloak)
Die drei Build-Workflows folgen demselben Grundmuster: Images werden gebaut, in GHCR veröffentlicht und anschließend 
keyless signiert. Unterschiede bestehen im jeweiligen Build-Pre-Step (Backend mit Quarkus/Gradle) sowie in den Trigger-Pfaden.
Danach unterscheidet sich der Ablauf je Event:
- Pull Request: Container-Image wird mit Buildx gebaut, aber nicht gepusht.
- main: Login in GHCR, Tagging, Multi-Arch Build & Push (linux/amd64, linux/arm64) inkl. Registry-Cache. Danach wird Cosign installiert und das Image keyless signiert. Abschließend werden image-ref.txt und digest.txt als Artifact hochgeladen.

Nach dem Push wird Cosign installiert und das Image keyless über OIDC signiert. 
Signiert wird dabei der Image-Digest, nicht nur ein Tag.
#### Output
- Pull Request: Kein Registry-Output; Ergebnis hintlässt primär den Build-Erfolg als Signal, dass das Image technisch baubar ist.
- main:
  - Gepushte GHCR-Images je Komponente mit Tags latest und <SHA12>
  - Signatur (Cosign, keyless) auf dem Digest
  - Artifact mit Image-Referenz + Digest zur späteren Verifikation/Referenzierung

#### Quality Gate
- Build-Gate: Schlägt der Docker-Build fehl (oder beim Backend zusätzlich der Quarkus/Gradle-Build), bricht der Workflow ab. Das ist das zentrale Gate für „deploybar gebaut“.
- Publishing-Gate (main): Login/Pull-Push nach GHCR muss funktionieren; Fehler beim Push beendet den Job.
- Supply-Chain-Gate (main): Das Cosign-Signing ist verpflichtend; schlägt es fehl, gilt der Run als fehlgeschlagen. Damit ist „Image vorhanden“ und „Image signiert“ zusammen ein hartes Qualitätskriterium für Releases auf main.

### Deployment
Für das eigentliche Deployment wird ein Kubernetes-Cluster auf Basis von Minikube gestartet, wobei Minikube in einer 
Docker-Umgebung ausgeführt wird. Der Cluster pullt die benötigten Container-Images aus der GHCR.