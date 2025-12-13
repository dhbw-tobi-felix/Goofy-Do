# Deployment 
Im Folgenden wird der Deployment-Prozess der Web-Applikation beschrieben. Der Quellcode wird in einem GitHub-Repository 
versioniert. Jeder Commit auf den main-Branch triggert automatisch die CI/CD-Pipeline, die in GitHub Actions umgesetzt 
ist. Innerhalb dieser Pipeline werden zunächst sicherheitsrelevante Prüfungen durchgeführt: ein SAST-Scan zur statischen
Analyse des Quellcodes, die Generierung einer SBOM (Software Bill of Materials) zur transparenten Auflistung verwendeter 
Komponenten, ein SCA-Scan zur Erkennung bekannter Schwachstellen in Abhängigkeiten sowie ein Secret-Scan zur 
Identifikation versehentlich eingecheckter Zugangsdaten oder Tokens.  

Nach erfolgreichem Abschluss der Scans werden die Deployable Artefakte als Container-Images erstellt. Konkret werden 
getrennte Images für Frontend, Backend sowie Keycloak gebaut und anschließend signiert, um Integrität und Herkunft der 
Images nachweisbar zu machen. Die signierten Images werden danach in der GitHub Container Registry (GHCR) abgelegt, 
sodass sie versioniert und zentral abrufbar sind.  

Für das eigentliche Deployment wird ein Kubernetes-Cluster auf Basis von Minikube gestartet, wobei Minikube in einer 
Docker-Umgebung ausgeführt wird. Der Cluster pullt die benötigten Container-Images aus der GHCR. Der Zugriff auf die 
Registry ist dabei abgesichert: Ein Image-Pull ist nur möglich, wenn ein gültiges Authentifizierungs-Token für die GHCR 
vorliegt. Dadurch wird sichergestellt, dass ausschließlich autorisierte Deployments die gebauten Artefakte beziehen und 
ausführen können.