# Ziel
Ziel dieser Projektarbeit ist die Konzeption und Umsetzung einer kleinen Web-Applikation, an der die im Modul Security
by Design vermittelten Verfahren zur Gestaltung sicherer Software in der Praxis angewendet werden. 
Im Vordergrund steht dabei die durchgängige Berücksichtigung von Sicherheitsaspekten über den gesamten
Softwarelebenszyklus hinweg, von der Anforderungsdefinition und Architekturgestaltung, Threat Modeling und Secure Coding
bis zu automatisierten Sicherheitsanalysen sowie einer reproduzierbaren CI/CD-Pipeline mit signierten Container-Images
und Deployment in ein Kubernetes-Cluster.
# Beschreibung der Web-Applikation
Im Rahmen dieser Projektarbeit wird eine Web-Application erstellt, welche zum Managen von Aufgaben in individuellen
Listen dient. Sobald man sich bei der Application über den Identity Provider Keycloak registriert hat, kann man beliebig
viele ToDo-Listen erstellen. In diesen werden wiederum einzelne ToDo’s erstellt, welche eine Beschreibung,
Fälligkeitsdatum und eine Möglichkeit zum abhaken, falls diese erledigt wurde.
Das Frontend wird mit React und Tailwind erstellt. Das Backend wird innerhalb des Java-basierten Frameworks Quarkus
programmiert. Als Datenbank wird eine Postgres-Instanz verwendet.
