// src/lib/api.ts
import {keycloak} from "../main";

// Pass den Port an, falls dein Backend woanders läuft
const BASE_URL = "http://localhost:8080/api/v1";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    // 1. Login prüfen
    if (!keycloak.authenticated) {
        // Optional: Redirect zum Login, wenn nicht session schon initiiert
        // await keycloak.login();
        throw new Error("Nicht eingeloggt");
    }

    // 2. Token Refresh (wenn < 30s gültig)
    try {
        await keycloak.updateToken(30);
    } catch (error) {
        console.error("Token refresh failed - Session abgelaufen?");
        await keycloak.login();
    }

    // 3. Header setzen / mergen
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${keycloak.token}`, // <-- Der wichtige Teil
        ...options.headers,
    };

    // 4. Fetch ausführen
    // endpoint sollte mit / beginnen, z.B. "/lists"
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, { ...options, headers });

    // 5. Globales 401 Handling
    if (response.status === 401) {
        console.warn("401 Unauthorized erhalten - Token ungültig?");
        // Optional: keycloak.login();
    }

    return response;
}