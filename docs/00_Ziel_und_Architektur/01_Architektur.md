# Architektur

## 1 Systemübersicht

Die Web-Applikation ist als moderne Microservice-Anwendung konzipiert.
Nutzer greifen über einen Webbrowser auf das im Kubernetes-Cluster betriebene Frontend zu. Dieses ist als
Single-Page-Application mit React umgesetzt und wird vom Cluster als statischer Webservice ausgeliefert. Das Frontend
kommuniziert über eine REST-API mit dem im selben Cluster betriebenen Backend, das auf dem Java-Framework Quarkus
basiert. Persistente Daten werden in einer separaten PostgreSQL-Datenbank gespeichert, auf die ausschließlich das
Backend per SQL zugreift. Für Authentifizierung und Autorisierung wird ein Identity Provider auf Basis von Keycloak
eingebunden, der sowohl vom Frontend als auch vom Backend über Client-Authentifizierung angesprochen wird und zentral
Tokens sowie Rolleninformationen bereitstellt. Dieser läuft ebenso lokal im Kubernetes-Cluster.
Die Bereitstellung der Anwendung erfolgt containerbasiert und wird vollständig über GitHub und GitHub Actions
automatisiert. Änderungen am Quellcode werden von den Entwicklern in ein zentrales GitHub-Repository eingecheckt,
woraufhin eine CI-Pipeline angestoßen wird. Diese erzeugt zunächst ein Software Bill of Materials (SBOM) und führt
anschließend statische Codeanalyse (SAST), Dependency-Scans (SCA) sowie Secret-Scanning durch. Nur bei erfolgreichem
Durchlauf wird das Container-Image gebaut, über ein Quality Gate geprüft und in ein Image-Repository übertragen. Von
dort aus wird das geprüfte Image in das Kubernetes-Cluster ausgerollt, sodass ausschließlich durch den definierten
Sicherheitsprozess geprüfte Versionen der Web-Applikation produktiv betrieben werden.

## 2 Softwareumgebung

- **Frontend:** React mit TypeScript
- **Styling:** Tailwind mit CSS
- **Authentifizierung:** Keycloak
- **Backend:** Quarkus mit Java
- **Datenbank:** PostgreSQL
- **Kommunikation:** REST-API
- **Deployment:** Kubernetes mit Minikube

## 3 Architekturdiagramm
Die in Abbildung 1 dargestellte Übersicht visualisiert die beschriebene System- und Deployment-Architektur der
Anwendung. Das Diagramm zeigt sowohl die Interaktionen der Laufzeitkomponenten als auch die Anbindung der CI/CD-Pipeline
über GitHub Actions und das Container-Image-Repository.  
  
![Architekturdiagramm](../05_Files/Architektur.png)  
*Abbildung 1: Architekturdiagramm der Web-Applikation*

## 4 Data-Flow-Diagramm
Das in Abbildung 2 dargestellte Data-Flow-Diagramm beschreibt die wesentlichen Datenflüsse sowie die zugehörigen 
Vertrauensgrenzen der Anwendung vom Entwicklungsprozess bis zur Nutzung durch die Endanwender. Auf der linken Seite ist 
der Weg des Quellcodes von der lokalen Entwicklerumgebung über das GitHub-Code-Repository in die automatisierte 
CI-Pipeline mit GitHub Actions und das anschließende Ablegen der erzeugten Container-Images im Image-Repository 
dargestellt. Auf der rechten Seite wird die Laufzeitumgebung im Kubernetes-Cluster dargestellt. Der Browser der 
Nutzer kommuniziert mit dem Frontend-Pod, welcher Access-Tokens vom Keycloak-Pod bezieht und REST-Anfragen an den 
Backend-Pod stellt. Dieser greift lesend und schreibend auf den Datenbank-Pod zu, in dem sowohl die Anwendungsdaten 
als auch die Keycloak-spezifischen Daten gespeichert werden.  
  
![Data-Flow-Diagramm](../05_Files/DFD.png)  
*Abbildung 2: Data-Flow-Diagramm der Web-Applikation*