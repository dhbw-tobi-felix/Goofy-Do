# Requirements Engineering

## SEC-01
### Anforderung  
Das System muss eine Benutzerauthentifizierung mit E-Mail, Passwort und 2FA unterstützen.

## SEC-02
### Anforderung
Passwörter müssen mit einem salt und hash verschlüsselt in der Datenbank gespeichert werden.

## SEC-03
### Anforderung
Nach 30 Minuten Inaktivität muss die Session automatisch ablaufen und der Benutzer wird abgemeldet.

## SEC-04
### Anforderung
Alle Benutzer-/Administatoranmeldungen am System müssen in Logs gespeichert werden, sowie alle administrativen Handlungen der Admins. 

## SEC-05
### Anforderung
Benutzer dürfen nicht auf Listen von anderen Benutzern zugreifen können.
