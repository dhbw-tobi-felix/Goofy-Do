import {keycloak} from "../main";

const BASE_URL = "http://localhost:8080/api/v1";

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
        throw new Error("Nicht eingeloggt");
    }

    try {
        await keycloak.updateToken(30);
    } catch {
        await keycloak.login();
    }

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${keycloak.token}`,
        ...options.headers,
    };

    const url = `${BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {...options, headers});

        if (!response.ok) {
            let errorMessage = `Fehler: ${response.statusText}`;
            try {
                const errorBody = await response.json();
                if (errorBody && errorBody.message) {
                    errorMessage = errorBody.message;
                }
            } catch {
                // ignore
            }
            throw new ApiError(response.status, errorMessage);
        }

        return response;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new Error("Netzwerkfehler oder Server nicht erreichbar");
    }
}