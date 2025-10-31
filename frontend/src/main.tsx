import {StrictMode, Suspense} from 'react'
import {createRoot} from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import './index.css'
import Layout from "./layout/Layout.tsx";
import Home from './home/Home.tsx'
import './home/Home.css'
import List from "./list/List.tsx";
import './list/List.css'

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

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Suspense fallback={<div>lädt…</div>}>
            <RouterProvider router={router} />
        </Suspense>
    </StrictMode>
);