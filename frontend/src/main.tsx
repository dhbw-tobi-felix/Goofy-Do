import {StrictMode, Suspense} from 'react'
import {createRoot} from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import './index.css'
import Layout from "./layout/Layout.tsx";
import Home from './home/Home.tsx'
import './home/Home.css'
import List from "./list/List.tsx";
import './list/List.css'
import Keycloak from 'keycloak-js';

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            {path: "list/:id", element: <List/>},
        ],
    },
]);

// Instanz exportieren
export const keycloak = new Keycloak({
    url: "http://localhost:8180",
    realm: "todo",
    clientId: "todo-frontend"
});

const root = createRoot(document.getElementById("root")!);

// HIER: Nur EINMAL aufrufen und direkt mit Config starten
keycloak.init({ onLoad: 'login-required' })
    .then((authenticated) => {
        if (authenticated) {
            console.log("Authenticated with token", keycloak.token);
            root.render(
                <StrictMode>
                    <Suspense fallback={<div>lädt…</div>}>
                        <RouterProvider router={router} />
                    </Suspense>
                </StrictMode>
            );
        } else {
            console.error("Authentication failed");
            window.location.reload();
        }
    })
    .catch((err) => {
        console.error("Keycloak init failed", err);
        // Falls Keycloak server down ist, rendern wir zumindest eine Fehlermeldung
        root.render(<div style={{padding: 20, color: 'red'}}>Keycloak Error: {err.message}</div>);
    });