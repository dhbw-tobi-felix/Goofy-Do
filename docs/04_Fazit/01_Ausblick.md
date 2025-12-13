# Ausblick
Aufgrund des begrenzten Projektumfangs konnten einige sinnvolle Erweiterungen nicht mehr in die aktuelle Version 
übernommen werden, sind jedoch fachlich und technisch naheliegende nächste Schritte.  

Ein naheliegender Ausbau wäre die Erweiterung des bestehenden Authentifizierungskonzepts um Single Sign-On (SSO) über 
externe Identity Provider wie Google oder GitHub mittels Keycloak. Die grundlegende Konfiguration ist hierfür bereits 
vorbereitet, wurde jedoch in der aktuellen Version bewusst nicht aktiviert. Grund dafür ist, dass für die produktive 
Nutzung Client-Credentials und weitere Secrets sicher in der Keycloak-Instanz hinterlegt und verwaltet werden müssten. 
Da dieses Secret-Handling in der vorgesehenen Projektumgebung nicht in einer ausreichend sauberen und überprüfbaren 
Form umgesetzt werden konnte, wurde die Funktion zunächst zurückgestellt.  

Ein weiterer Punkt betrifft die Absicherung gegen Denial-of-Service-Angriffe. Wirksame Maßnahmen liegen typischerweise 
an der Perimeter- bzw. Ingress-Schicht (z. B. Rate-Limits, Request-Limits, WAF/Bot-Protection) und erfordern eine 
produktionsnahe Konfiguration, kontinuierliches Monitoring sowie aussagekräftige Last- und Stabilitätstests, um 
Effektivität und Nebenwirkungen bewerten zu können. Diese Voraussetzungen waren im Projektkontext nur eingeschränkt 
gegeben, weshalb eine zuverlässige Implementierung und Verifikation nicht sinnvoll möglich gewesen wäre. Das Risiko 
wird daher für den Projektstand akzeptiert und als Empfehlung für ein produktionsnahes Setup dokumentiert (Rate-Limits 
am Ingress, Request-Limits, ggf. Caching sowie Monitoring/Alerting).  

Ein weiterer Aspekt ist DNSSEC. Da die Anwendung im aktuellen Projektstand ausschließlich lokal betrieben wird und 
keine eigene Domain besitzt, war eine Umsetzung von DNSSEC nicht sinnvoll möglich. Für ein produktionsnahes Setup mit 
eigener Domain wäre DNSSEC jedoch eine sinnvolle Ergänzung, um DNS-Antworten kryptografisch abzusichern und 
Manipulationen wie DNS-Spoofing bzw. Cache-Poisoning zu erschweren.