# Lessons learned
Im Laufe dieses Projekts konnten wir sowohl unsere theoretischen Kenntnisse als auch unsere praktischen Fähigkeiten im 
Bereich Secure Software Engineering deutlich erweitern. Insbesondere wurde uns klar, dass Sicherheit nicht als 
nachträgliche Ergänzung verstanden werden darf, sondern von Beginn an ein durchgängiger Bestandteil von Design, 
Implementierung und Betrieb sein muss. Dadurch haben wir ein besseres Verständnis dafür entwickelt, welche Auswirkungen 
Entscheidungen in der Architektur und der Auswahl von technischen Komponenten auf die spätere Angriffsfläche einer 
Anwendung haben und wie sich Sicherheitsanforderungen frühzeitig in den Entwicklungsprozess integrieren lassen.  

Zunächst haben wir uns grundlegende Sicherheitsprinzipien wie sichere Authentifizierung und Autorisierung, der Umgang 
mit Tokens, der Schutz von Kommunikationswegen über TLS sowie das richtige Arbeiten mit Zertifikaten angeeignet.
Ein weiterer Schwerpunkt lag auf dem Aufbau einer vollständigen CI/CD-Pipeline und der Integration von Security-Checks 
in diesen Prozess. Wir haben gelernt, wie man eine Pipeline so strukturiert, dass Sicherheitsprüfungen automatisch und 
reproduzierbar ablaufen und nicht von manuellen Kontrollen abhängig sind. Dies umfasst die Implementierung von 
SAST-Scans, SCA-Scans, Secret-Scanning sowie die Generierung von SBOMs.  

Außerdem konnten wir unser Verständnis für sichere Softwarebereitstellung deutlich verbessern. Durch das Bauen, 
Signieren und Verwalten von Container-Images haben wir praktische Erfahrungen im Umgang mit Container-Sicherheit gesammelt.
Die Nutzung von Kubernetes als Deployment-Plattform hat uns gezeigt, wie man Anwendungen in einer isolierten und kontrollierten
Umgebung betreibt und welche Sicherheitsaspekte dabei zu beachten sind.

Insgesamt hat uns dieses Projekt verdeutlicht, dass Secure Software Engineering ein ganzheitlicher Ansatz ist, der
technische, organisatorische und prozessuale Aspekte umfasst und uns deutlich gemacht, wie eng Entwicklung, Betrieb und 
Security zusammenhängen und dass eine gute Lösung nur dann entsteht, wenn man diese Bereiche gemeinsam denkt und 
konsequent umsetzt. 