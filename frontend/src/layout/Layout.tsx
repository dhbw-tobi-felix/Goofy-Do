import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Separator } from "../components/ui/separator";
import { Menu, User, Search } from "lucide-react";

// NAVBAR
function NavBar() {
    const NavLinks = () => (
        <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-zinc-200 hover:text-white transition-colors">Home</Link>
            <Link to="/about" className="text-sm font-medium text-zinc-200 hover:text-white transition-colors">Profile</Link>
            <Link to="/contact" className="text-sm font-medium text-zinc-200 hover:text-white transition-colors">Contact</Link>
        </nav>
    );

    return (
        <header className="fixed inset-x-0 top-0 z-50 px-2 pt-1">
            <div className="h-14 rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60 shadow-lg flex items-center px-3 sm:px-4">
                <div className="flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0 bg-zinc-950 border-zinc-800">
                            <div className="p-4">
                                <Link to="/" className="text-lg font-semibold tracking-tight text-white">Goofy-Do</Link>
                            </div>
                            <Separator className="bg-zinc-800" />
                            <div className="p-4 flex flex-col gap-3">
                                <Link to="/" className="text-sm text-zinc-200 hover:text-white">Home</Link>
                                <Link to="/about" className="text-sm text-zinc-200 hover:text-white">Profile</Link>
                                <Link to="/contact" className="text-sm text-zinc-200 hover:text-white">Contact</Link>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link to="/" className="text-base sm:text-lg font-bold tracking-tight text-white">Goofy-Do</Link>
                </div>

                <div className="flex-1 flex justify-center">
                    <NavLinks />
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    <Button variant="ghost" size="icon">
                        <User className="size-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}

// SIDEBAR
function Sidebar({ collapsed, toggle }: { collapsed: boolean; toggle: () => void }) {
    const base = "hidden lg:block fixed top-[84px] left-3 z-40 w-72 h-[calc(100vh-96px)] rounded-3xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60 shadow-xl overflow-hidden transition-transform duration-200";
    const stateClass = collapsed ? "-translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100";

    return (
        <>
            <aside className={`${base} ${stateClass}`} aria-hidden={collapsed}>
                <div className="p-4 relative h-full flex flex-col">
                    {/* Top row with toggle */}
                    <div className="flex items-start justify-between">
                        <h2 className="text-sm font-semibold text-zinc-200">Suche</h2>
                        <div className="absolute top-3 right-3">
                            <Button variant="ghost" size="icon" onClick={toggle} aria-label={collapsed ? "Sidebar ausfahren" : "Sidebar einfahren"}>
                                {collapsed ? "›" : "‹"}
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                        <Input placeholder="Search..." className="pl-9 bg-zinc-900/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" />
                    </div>

                    <Separator className="bg-zinc-800 my-4" />

                    <div className="p-0">
                        <h3 className="text-sm font-semibold text-zinc-200 px-4">Zuletzt benutzt</h3>
                        <div className="mt-3 mx-4 rounded-xl border border-zinc-800">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-zinc-400">Liste</TableHead>
                                        <TableHead className="text-zinc-400">Datum</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[1, 2, 3, 4].map((i) => (
                                        <TableRow key={i} className="hover:bg-zinc-900/40">
                                            <TableCell className="text-zinc-200">Liste {i}</TableCell>
                                            <TableCell className="text-zinc-400">01.0{i}.2025</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="mt-auto p-4 text-xs text-zinc-500">© {new Date().getFullYear()} Goofy-Do</div>
                </div>
            </aside>

            {/* Edge-Strip zum Ausfahren */}
            {collapsed && (
                <div
                    className="fixed left-0 z-50 lg:block"
                    style={{ top: "calc(84px + 0.75rem)" }}
                >
                    <button
                        className="-ml-1 rounded-r-md bg-zinc-900/80 text-zinc-100 p-2 border border-zinc-800 shadow-md hover:translate-x-0 transition-transform"
                        title="Sidebar ausfahren"
                        onClick={toggle}
                        aria-label="Sidebar ausfahren"
                    >
                        ›
                    </button>
                </div>
            )}
        </>
    );
}

export default function AppUI() {
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        // initial: sidebar offen
        document.body.classList.add("sidebar-open");
        document.body.classList.remove("sidebar-collapsed");
        return () => {
            document.body.classList.remove("sidebar-open", "sidebar-collapsed");
        };
    }, []);

    function toggle() {
        const next = !collapsed;
        setCollapsed(next);
        document.body.classList.toggle("sidebar-open", !next);
        document.body.classList.toggle("sidebar-collapsed", next);
    }

    return (
        <div className="bg-zinc-950 text-zinc-50 min-h-screen">
            <NavBar />
            <Sidebar collapsed={collapsed} toggle={toggle} />
            <main className="app-main pt-20 px-3 sm:px-6 lg:pr-6 max-w-[1400px] mx-auto">
                <Outlet />
            </main>
        </div>
    );
}