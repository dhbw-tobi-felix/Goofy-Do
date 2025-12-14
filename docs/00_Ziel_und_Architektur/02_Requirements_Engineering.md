# Requirements Engineering

## SEC-01
| Feld               | Inhalt                                                                                                                                                                                            |
|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Anforderung        | Das System muss eine Benutzerauthentifizierung mit E-Mail, Passwort und 2FA unterstützen.                                                                                                         |
| Priorität          | Verpflichtend                                                                                                                                                                                     |
| Akzeptanzkriterien | Nutzer kann sich mit E-Mail/Passwort anmelden. <br> Nutzer kann 2FA aktivieren/deaktivieren. <br> Bei aktivierter 2FA ist Login ohne zweiten Faktor nicht möglich. Es gibt einen Recovery-Prozess |

## SEC-02
| Feld               | Inhalt                                                                                                                                                                                        |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Anforderung        | Passwörter müssen mit einem salt und hash verschlüsselt in der Datenbank gespeichert werden.                                                                                                  |
| Priorität          | Verpflichtend                                                                                                                                                                                 |
| Akzeptanzkriterien | In der DB existiert kein Klartextpasswort. <br> Pro Passwort wird ein einzigartiges Salt verwendet. <br> Hashing-Algorithmus ist ein passwortspezifischer KDF (z. B. Argon2id/bcrypt/scrypt). |

## SEC-03
| Feld               | Inhalt                                                                                                                                                 |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| Anforderung        | Nach 30 Minuten Inaktivität, d.h. keine Usereingaben wurden mehr durchgeführt, muss die Session automatisch ablaufen und der Benutzer wird abgemeldet. |
| Priorität          | Verpflichtend                                                                                                                                          |
| Akzeptanzkriterien | Nach 30 Minuten ohne Aktivität sind geschützte Aktionen nicht mehr möglich <br> UI zeigt Re-Login an.                                                  |

## SEC-04
| Feld               | Inhalt                                                                                                                                                             |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Anforderung        | Alle Benutzer-/Administratoranmeldungen am System müssen in Logs gespeichert werden, sowie alle administrativen Handlungen der Admins.                             |
| Priorität          | Verpflichtend                                                                                                                                                      |
| Akzeptanzkriterien | Für jedes Login/Logout wird ein Logeintrag erstellt. <br> Für jede Admin-Aktion wird ein Logeintrag erstellt. <br> Logs sind nur für berechtigte Rollen einsehbar. |

## SEC-05
| Feld               | Inhalt                                                                                                                                        |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| Anforderung        | Benutzer dürfen nicht auf Listen von anderen Benutzern zugreifen können.                                                                      |
| Priorität          | Verpflichtend                                                                                                                                 |
| Akzeptanzkriterien | Ein User kann nur seine eigenen Daten abrufen. <br> Versuche, fremde IDs abzufragen, liefern 403/404. <br> UI zeigt keine fremden Userlisten. |
