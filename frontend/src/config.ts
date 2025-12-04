type AppConfig = {
    keycloakUrl: string,
    keycloakRealm: string,
    keycloakClientId: string,
    backendUrl: string
};

const devConfig: AppConfig = {
    keycloakUrl: "http://localhost:8180",
    keycloakRealm: "todo",
    keycloakClientId: "todo-frontend",
    backendUrl: "http://localhost:8080/api/v1"
};

const prodConfig: AppConfig = {
    keycloakUrl: "https://goofydo.local/auth",
    keycloakRealm: "todo",
    keycloakClientId: "todo-frontend",
    backendUrl: "https://goofydo.local/api/v1"
};

const mode = import.meta.env.MODE;

const config: AppConfig = mode === 'production' ? prodConfig : devConfig;

export default config;