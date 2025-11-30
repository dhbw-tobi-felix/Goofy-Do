import {useCallback, useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Button} from "../components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card";
import {Badge} from "../components/ui/badge";
import {Plus} from "lucide-react";

// Importiere unsere neue Hilfsfunktion
import {apiRequest} from "../lib/api";

// Typen (gekürzt, passen zu deinem Backend)
type ListDto = {
    id: number | string;
    name?: string;
    description?: string | null;
    updatedAt?: string;
    lastModified?: string;
    modifiedAt?: string;
    createdAt?: string;
};

export default function Home() {
    const [lists, setLists] = useState<ListDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loadLists = useCallback(async (isMounted: boolean) => {
        setLoading(true);
        setError(null);
        try {
            // HIER: Einfacher Aufruf ohne Header-Kopfschmerzen
            const res = await apiRequest("/lists");

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data: ListDto[] = await res.json();

            // Sortier-Logik
            const getTime = (l: ListDto) => {
                const d = l.updatedAt ?? l.lastModified ?? l.modifiedAt ?? l.createdAt ?? null;
                if (!d) return 0;
                const t = new Date(d).getTime();
                return Number.isNaN(t) ? 0 : t;
            };
            const sorted = data.sort((a, b) => getTime(b) - getTime(a)).slice(0, 6);

            if (isMounted) setLists(sorted);
        } catch (e) {
            console.error(e);
            if (isMounted) setError("Fehler beim Laden der Listen.");
        } finally {
            if (isMounted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        loadLists(mounted);
        return () => { mounted = false; };
    }, [loadLists]);

    const createNewList = useCallback(async () => {
        const name = prompt("Name der neuen Liste:");
        if (!name || !name.trim()) return;

        try {
            // HIER: Auch der POST ist jetzt super einfach
            const resp = await apiRequest("/lists", {
                method: "POST",
                body: JSON.stringify({
                    name: name.trim(),
                    description: "Neu erstellt" // Optional description handling
                }),
            });

            if (!resp.ok) {
                const txt = await resp.text().catch(() => "");
                throw new Error(`Server error: ${resp.status} ${txt}`);
            }

            // Response parsen für ID
            const text = await resp.text().catch(() => "");
            const data = text ? JSON.parse(text) : null;

            // ID finden (Fallback auf Location Header)
            const loc = resp.headers.get("Location");
            const id = data?.id ?? (loc ? loc.split("/").pop() : null);

            if (!id) {
                // Fallback: Liste neu laden wenn wir keine ID haben
                loadLists(true);
                return;
            }

            // Direkt zur neuen Liste navigieren
            navigate(`/list/${encodeURIComponent(String(id))}`, {
                state: { list: { id, title: data?.name ?? name.trim(), tasks: [] } },
            });

        } catch (e) {
            console.error("Fehler beim Anlegen der Liste:", e);
            alert("Konnte Liste nicht anlegen. (Siehe Konsole)");
        }
    }, [navigate, loadLists]);

    return (
        <main className="min-h-screen w-full p-4">
            <div className="w-full max-w-6xl mx-auto">
                <div className="relative mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                        Your Lists
                    </h1>
                    <Button onClick={createNewList} className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 size-4" /> Neu
                    </Button>
                </div>

                {loading && <div className="text-zinc-400">Lade Listen…</div>}
                {error && <div className="text-red-400 bg-red-900/20 p-4 rounded border border-red-800">{error}</div>}

                {!loading && !error && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {lists.map((l) => (
                            <Link key={l.id} to={`/list/${encodeURIComponent(String(l.id))}`} className="group">
                                <Card className="rounded-3xl border-zinc-800 bg-zinc-900 shadow-lg transition-all hover:bg-zinc-800 hover:border-zinc-700">
                                    <CardHeader>
                                        <CardTitle className="text-zinc-100 group-hover:text-blue-400 transition-colors">
                                            {l.name ?? "Unbenannte Liste"}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-0" /> {/* Progress Dummy */}
                                        </div>
                                        <p className="text-sm text-zinc-400 line-clamp-2">
                                            {l.description || "Keine Beschreibung"}
                                        </p>
                                        <div className="pt-2">
                                            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                                                {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "Unbekannt"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}

                        {/* Leerer State wenn keine Listen da sind */}
                        {lists.length === 0 && (
                            <div className="col-span-full text-center py-12 text-zinc-500">
                                Du hast noch keine Listen. Erstelle eine!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}