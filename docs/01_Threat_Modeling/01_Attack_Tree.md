# Attack Tree
[K01](./00_STRIDE.md#13-keycloak) stellt aus unserer Sicht das Worst-Case-Szenario dar, weil es die Identitäts- und Zugriffsebene Keycloak direkt 
angreift. Keycloak ist die zentrale Vertrauenskomponente für Authentifizierung und Autorisierung. Gelingt es einem 
Angreifer, sich als legitimer Admin auszugeben, kompromittiert er nicht nur einen einzelnen Account, sondern potenziell 
die gesamte Zugriffskontrolllogik der Plattform.  

Mit einem Keycloak-Admin-Account kann ein Angreifer typischerweise Rollen und Berechtigungen verändern, neue 
privilegierte Konten anlegen, Clients/Redirect-URIs und Token-/Scope-Konfigurationen manipulieren und damit 
persistenten Zugriff etablieren. Dadurch sind sowohl Vertraulichkeit (Zugriff auf geschützte Daten), Integrität 
(Manipulation von Rollen, Policies und ggf. Geschäftsdaten über privilegierte APIs) als auch Verfügbarkeit 
(z. B. durch Deaktivierung von Clients oder Auth-Flows) in großem Umfang gefährdet.  

![Attack Tree](../05_Files/Attack_Tree.png)
*Abbildung 3: Attack Tree zu K01*