## Security by Design
Projekt von:
| Name | Matrikelnummer | E-Mail |
|---|---|---|
| Felix Paul Uhlig | 4419060 | inf23173@lehre.dhbw-stuttgart.de |
| Tobias Wiedemann | 8556196 | inf23183@lehre.dhbw-stuttgart.de |

## 📋 Voraussetzungen

* [Docker](https://www.docker.com/) (Runtime)
* [Minikube](https://minikube.sigs.k8s.io/) (K8s Cluster)
* [Kubectl](https://kubernetes.io/docs/reference/kubectl/) (CLI)
* [OpenSSL](https://www.openssl.org/) (Für lokale Secret-Generierung)
* *Optional:* [mkcert](https://github.com/FiloSottile/mkcert) (Für vertrauenswürdige lokale TLS-Zertifikate)

---

## 🚀 Setup & Start (Quickstart)

### 1. Cluster starten & Deployen

Der folgende Befehl fährt Minikube hoch, generiert zufällige Passwörter, erstellt Zertifikate und deployt die Anwendung.

```bash
make up
```

### 2. Tunnel starten & Hosts Konfiguration

Führe diesen Befehl aus, um zu sehen, was für dein System (macOS vs. Linux) zu tun ist:

```bash
make tunnel
```

*   **macOS:** Der Befehl fragt nach dem sudo-Passwort und **muss offen bleiben**, damit die URL erreichbar ist.
*   **Linux:** Der Befehl zeigt dir nur deine Minikube-IP an. Du brauchst **kein** offenes Terminal.

### 3. Hosts-Datei Eintrag (WICHTIG)

Damit `https://goofydo.local` funktioniert, muss die Domain in `/etc/hosts` eingetragen werden:

**macOS:**
```bash
echo '127.0.0.1 goofydo.local' | sudo tee -a /etc/hosts > /dev/null
```

**Linux:**
Ersetze `MINIKUBE_IP` mit der IP, die `make tunnel` (oder `minikube ip`) dir angezeigt hat (oft `192.168.49.2`).

```bash
# echo 'IP-ADRESSE goofydo.local' | sudo tee -a /etc/hosts
echo '192.168.49.2 goofydo.local' | sudo tee -a /etc/hosts > /dev/null
```


### 5 Zugriff
[https://goofydo.local](https://goofydo.local)

---

## ❓ Troubleshooting

### ⚠️ SSL-Warnung: "Potential Security Risk" (Firefox / Linux)

Auf macOS vertrauen Browser den lokalen Zertifikaten meist automatisch. Unter Linux (speziell Ubuntu mit **Firefox als Snap**) wird der System-Zertifikatsspeicher oft ignoriert.

**Das Problem:** Der Browser kennt die lokale "Zertifizierungsstelle" (mkcert) nicht.

**Lösung 1 (Schnell):**
Klicke auf `Erweitert` -> `Risiko akzeptieren und fortfahren`.

**Lösung 2 (Sauber / Grünes Schloss):**
Importiere das Root-Zertifikat manuell in Firefox:
1.  Finde den Pfad: `mkcert -CAROOT` (z.B. `/home/user/.local/share/mkcert`)
2.  Firefox Einstellungen -> "Zertifikate" suchen -> "Zertifikate anzeigen..."
3.  Reiter "Zertifizierungsstellen" -> **Importieren...**
4.  Wähle `rootCA.pem` aus dem Pfad von Schritt 1.
5.  Setze den Haken bei *"Dieser CA vertrauen, um Websites zu identifizieren"*.

---

## 🔑 Credentials & Secrets

Secrets werden beim ersten Start (`make up`) via OpenSSL zufällig generiert und als Kubernetes Secrets angelegt.

**Zugangsdaten auslesen:**

**Keycloak Admin:** `kc-admin`

```bash
kubectl get secret keycloak-admin-secret -n goofydo -o jsonpath="{.data.KEYCLOAK_ADMIN_PASSWORD}" | base64 -d
```

**Postgres Root:** `root`

```bash
kubectl get secret postgres-secret -n goofydo -o jsonpath="{.data.POSTGRES_PASSWORD}" | base64 -d
```

**App DB User:** `app`

```bash
kubectl get secret backend-secret -n goofydo -o jsonpath="{.data.QUARKUS_DATASOURCE_PASSWORD}" | base64 -d
```

**Keycloak DB User:** `keycloak_prod`

```bash
 kubectl get secret keycloak-db-secret -n goofydo -o jsonpath="{.data.KC_DB_PASSWORD}" | base64 -d
```

---

## 🛠 Befehlsübersicht (Makefile)

| Befehl         | Beschreibung                                                              |
|:---------------|:--------------------------------------------------------------------------|
| `make up`      | **Startet alles:** Cluster Check, Namespace, Secret Gen, TLS Gen, Deploy. |
| `make stop`    | Stoppt Minikube VM (Zustand & Daten bleiben erhalten).                    |
| `make start`   | Startet Minikube VM wieder.                                               |
| `make destroy` | **Vorsicht:** Löscht Cluster, Namespace und alle Daten (Factory Reset).   |
| `make deploy`  | Wendet Änderungen an den YAML-Dateien an.                                 |
| `make logs`    | Zeigt den Status der Pods.                                                |
