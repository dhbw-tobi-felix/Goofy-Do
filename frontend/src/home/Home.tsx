// typescript
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { CalendarClock, Plus } from "lucide-react";

type Task = {
    id: string;
    name: string;
    completed: boolean;
    dueDate?: string;
};

type TodoList = {
    id: number | string;
    title: string;
    tasks: Task[];
    date?: string;
};

type ListDto = {
    id: number | string;
    name?: string;
    description?: string | null;
    updatedAt?: string;
    lastModified?: string;
    modifiedAt?: string;
    createdAt?: string;
};

function pctDone(tasks: Task[]) {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

function formatDate(iso?: string) {
    if (!iso) return "Kein Datum";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default function Home() {
    const [lists, setLists] = useState<ListDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        let aborted = false;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("http://localhost:8080/api/v1/lists", {
                    headers: { Accept: "application/json" },
                    credentials: "same-origin",
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: ListDto[] = await res.json();

                const getTime = (l: ListDto) => {
                    const d = l.updatedAt ?? l.lastModified ?? l.modifiedAt ?? l.createdAt ?? null;
                    if (!d) return 0;
                    const t = new Date(d).getTime();
                    return Number.isNaN(t) ? 0 : t;
                };

                const sorted = data.sort((a, b) => getTime(b) - getTime(a)).slice(0, 6);
                if (!aborted) setLists(sorted);
            } catch (e) {
                console.error(e);
                if (!aborted) setError("Fehler beim Laden der Listen.");
            } finally {
                if (!aborted) setLoading(false);
            }
        }

        load();
        return () => {
            aborted = true;
        };
    }, []);

    const createNewList = useCallback(async () => {
        const name = prompt("Name der neuen Liste:");
        if (!name || !name.trim()) return;
        try {
            const resp = await fetch("http://localhost:8080/api/v1/lists", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ name: name.trim(), description: "" }),
                credentials: "same-origin",
            });

            if (!resp.ok) {
                const txt = await resp.text().catch(() => "");
                throw new Error(`Server error: ${resp.status} ${txt}`);
            }

            // Server kann Location-Header oder JSON mit id zurückgeben
            const text = await resp.text().catch(() => "");
            const data = text ? JSON.parse(text) : null;
            const loc = resp.headers.get("Location");
            const id = data?.id ?? (loc ? loc.split("/").pop() : null);
            if (!id) throw new Error("Keine ID erhalten");

            navigate(`/list/${encodeURIComponent(String(id))}`, {
                state: { list: { id, title: data?.name ?? name.trim(), tasks: [] } },
            });
        } catch (e) {
            console.error("Fehler beim Anlegen der Liste:", e);
            alert("Konnte Liste nicht anlegen.");
        }
    }, [navigate]);

    return (
        <main className="min-h-screen">
            <div className="w-full">
                <div className="relative mb-6 flex items-center justify-center gap-3">
                    <h1 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                        Your Lists
                    </h1>
                    <div className="absolute right-0">
                        <Button onClick={createNewList} className="h-10 rounded-xl">
                            <Plus className="mr-2 size-4" /> Neu
                        </Button>
                    </div>
                </div>

                {loading && <div>Lade Listen…</div>}
                {error && <div className="text-red-400">{error}</div>}

                {!loading && !error && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {lists.map((l) => {
                            const total = 0;
                            const done = 0;
                            const pct = 0;
                            return (
                                <Link key={l.id} to={`/list/${encodeURIComponent(String(l.id))}`} className="group">
                                    <Card className="rounded-3xl border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-900/60 shadow-lg transition-colors hover:from-zinc-900/90 hover:to-zinc-800/60">
                                        <CardHeader>
                                            <CardTitle className="transition-colors text-zinc-100 group-hover:text-white">
                                                {l.name ?? "Unbenannte Liste"}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <div className="mb-1 flex items-center gap-2 text-xs text-zinc-300">
                                                    <span>
                                                        {done}/{total} erledigt • {pct}%
                                                    </span>
                                                </div>
                                                <Progress value={pct} className="h-2 bg-zinc-800" />
                                            </div>

                                            <ul className="space-y-1">
                                                <li className="text-sm text-zinc-200">{l.description ?? "Keine Beschreibung"}</li>
                                            </ul>

                                            <div className="pt-2">
                                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                                                    {(() => {
                                                        const d = l.updatedAt ?? l.lastModified ?? l.modifiedAt ?? l.createdAt;
                                                        return d ? new Date(d).toLocaleDateString() : "–";
                                                    })()}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}

                        {/* Platzhalter wenn < 6 */}
                        {Array.from({ length: Math.max(0, 6 - lists.length) }).map((_, i) => (
                            <div key={`ph-${i}`} className="group">
                                <Card className="rounded-3xl border-zinc-800 bg-gradient-to-b from-zinc-900/30 to-zinc-900/20 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-zinc-500">Keine Liste</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="h-6 bg-zinc-900/20 rounded" />
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
