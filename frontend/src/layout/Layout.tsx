import {useEffect, useState} from "react";
import {Link, Outlet, useLocation, useSearchParams} from "react-router-dom";
import {keycloak} from "../main";
import {CheckSquare, LayoutDashboard, LogIn, LogOut, Menu, Search, Settings, X} from "lucide-react";
import {ThemeToggle} from "../components/ThemeToggle.tsx";

interface KeycloakToken {
    given_name?: string;
    family_name?: string;
    preferred_username?: string;
}

export default function Layout() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);
    const location = useLocation();

    const [searchParams, setSearchParams] = useSearchParams();
    const searchTerm = searchParams.get("q") || "";

    const authenticated = keycloak.authenticated;
    const token = keycloak.tokenParsed as KeycloakToken;
    const fullName = token
        ? `${token.given_name || ''} ${token.family_name || ''}`.trim() || token.preferred_username
        : "Gast";
    const userInitial = fullName ? fullName.charAt(0).toUpperCase() : "?";

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setSidebarOpen(false);
            else setSidebarOpen(true);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSearch = (term: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (term) {
            newParams.set("q", term);
        } else {
            newParams.delete("q");
        }
        setSearchParams(newParams);
    };

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans selection:bg-blue-500/30 selection:text-blue-900 dark:selection:text-blue-200 transition-colors duration-300">
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:relative lg:translate-x-0 flex flex-col shadow-xl lg:shadow-none
                `}
            >
                <Link to="/">
                    <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800/50">
                        <div className="bg-blue-600 p-1.5 rounded-lg mr-3 shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40">
                            <CheckSquare size={20} className="text-white"/>
                        </div>
                        <span className="text-lg font-bold tracking-tight">Goofy-Do</span>
                    </div>
                </Link>

                <nav className="flex-1 px-3 py-6 space-y-1">
                    {authenticated ? (
                        <Link
                            to="/"
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                ${location.pathname === "/"
                                ? "bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"}
                            `}
                        >
                            <LayoutDashboard size={20}/>
                            Dashboard
                        </Link>
                    ) : (
                        <div className="px-4 text-sm text-zinc-500 italic">Nicht angemeldet</div>
                    )}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 bg-white/50 dark:bg-zinc-950 relative">
                <header className="h-16 border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between px-4 lg:px-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-40 sticky top-0 transition-colors duration-300">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
                        >
                            <Menu size={20}/>
                        </button>

                        {authenticated && location.pathname === "/" && (
                            <div className="relative hidden md:block max-w-md w-full sm:w-64 group transition-all focus-within:w-80 duration-300">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={16}/>
                                <input
                                    type="text"
                                    placeholder="Listen filtern..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full py-1.5 pl-10 pr-8 text-sm text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                />
                                {searchTerm && (
                                    <button onClick={() => handleSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                                        <X size={14}/>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative flex items-center flex-shrink-0 ml-4 gap-2">
                        <ThemeToggle />

                        {authenticated ? (
                            <>
                                <button
                                    onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                                    className={`
                    flex items-center gap-3 p-1 pl-3 rounded-full transition-all border duration-200
                    ${isUserMenuOpen
                                        ? "bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-600"
                                        : "border-transparent hover:bg-zinc-100 hover:border-zinc-200 dark:hover:bg-zinc-800 dark:hover:border-zinc-700"}
                `}
                                >
                <span className="text-sm font-medium hidden sm:block text-zinc-800 dark:text-zinc-200 max-w-[150px] truncate">
                    {fullName}
                </span>
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white dark:border-zinc-900 shadow-lg shadow-blue-900/20 dark:shadow-blue-500/20">
                                        {userInitial}
                                    </div>
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 top-12 mt-2 w-64 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl dark:shadow-black/90 z-50 animate-in fade-in zoom-in-95 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/50">
                                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-0.5">Angemeldet als</p>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{fullName}</p>
                                        </div>
                                        <div className="p-1.5 space-y-0.5">
                                            <button onClick={() => keycloak.accountManagement()}
                                                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-2 transition-colors">
                                                <Settings size={16} className="text-zinc-400 dark:text-zinc-500"/> Account
                                            </button>
                                            <button onClick={() => keycloak.logout()}
                                                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-2 transition-colors">
                                                <LogOut size={16}/> Abmelden
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <button onClick={() => keycloak.login()}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all duration-200
                           bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20
                           dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-white dark:shadow-blue-900/50">
                                <LogIn size={16}/> Login
                            </button>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
                    <div className="max-w-6xl mx-auto">
                        <Outlet/>
                    </div>
                </main>
            </div>

            {isSidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}/>}
        </div>
    );
}