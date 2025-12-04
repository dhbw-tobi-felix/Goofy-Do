import {keycloak} from "../main";
import config from "@/config.ts";

const BASE_URL = config.backendUrl;

export class ApiError extends Error {
    // @ts-ignore
    constructor(public status: number, message: string) {
        super(message);
    }
}

export type ListDto = {
    id: number;
    name: string;
    description?: string | null;
};

export type TaskDto = {
    id: number;
    name: string;
    completed: boolean;
    dueDate?: string | null;
    description?: string | null;
};

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    if (!keycloak.authenticated) {
        return Promise.reject(new Error("Nicht eingeloggt"));
    }

    try {
        await keycloak.updateToken(30);
    } catch {
        await keycloak.login();
        return Promise.reject(new Error("Token ungültig, Login erforderlich"));
    }

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${keycloak.token}`,
        ...options.headers,
    };

    const url = `${BASE_URL}${endpoint}`;

    const response = await fetch(url, {...options, headers}).catch(() => null);

    if (!response) {
        return Promise.reject(new Error("Netzwerkfehler oder Server nicht erreichbar"));
    }

    if (!response.ok) {
        let message = response.statusText;
        try {
            const body = await response.json();
            if (body?.message) message = body.message;
        } catch {}

        return Promise.reject(new ApiError(response.status, message));
    }

    return response;
}