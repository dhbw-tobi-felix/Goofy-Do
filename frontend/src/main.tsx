import {StrictMode, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Keycloak from 'keycloak-js';

import './index.css';
import {ToastProvider} from "./context/ToastContext.tsx";
import {ThemeProvider} from "./context/ThemeContext.tsx";

import Layout from "./layout/Layout.tsx";
import Home from './home/Home.tsx';
import ListDetail from "./list/List.tsx";

export const keycloak = new Keycloak({
    url: "http://localhost:8180",
    realm: "todo",
    clientId: "todo-frontend"
});

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>,
        children: [
            {index: true, element: <Home/>},
            {path: "list/:id", element: <ListDetail/>},
        ],
    },
]);

const initApp = async () => {
    try {
        await keycloak.init({
            onLoad: 'check-sso',
            checkLoginIframe: false,
            pkceMethod: 'S256'
        });

        const container = document.getElementById("root");
        if (!container) throw new Error("Root element not found");

        const root = createRoot(container);

        root.render(
            <StrictMode>
                <ThemeProvider>
                    <ToastProvider>
                        <Suspense fallback={
                            <div
                                className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                                <div className="animate-pulse text-lg font-medium text-muted-foreground">Lade
                                    Anwendung...
                                </div>
                            </div>
                        }>
                            <RouterProvider router={router}/>
                        </Suspense>
                    </ToastProvider>
                </ThemeProvider>
            </StrictMode>
        );
    } catch (err) {
        console.error("Critical: Application initialization failed", err);
    }
};

initApp();