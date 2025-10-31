import {Link, useNavigate} from "react-router-dom";
import {Button} from "../components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card";
import {Badge} from "../components/ui/badge";
import {Progress} from "../components/ui/progress";
import {CalendarClock, Plus} from "lucide-react";
import {useCallback} from "react";

// Types
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

function pctDone(tasks: Task[]) {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    return {total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100)};
}

function formatDate(iso?: string) {
    if (!iso) return "Kein Datum";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {day: "2-digit", month: "short", year: "numeric"});
}

export default function Home() {
    // Beispiel-Daten
    const lists: TodoList[] = [
        {
            id: 1,
            title: "Projekt Alpha",
            date: "01.01.2025",
            tasks: [
                {
                    id: "t1",
                    name: "Kickoff vorbereiten",
                    completed: false,
                    dueDate: new Date(Date.now() + 86400000).toISOString()
                },
                {
                    id: "t2",
                    name: "User Stories schreiben",
                    completed: true,
                    dueDate: new Date(Date.now() + 3 * 86400000).toISOString()
                },
            ],
        },
        {
            id: 2,
            title: "Persönlich",
            date: "01.01.2025",
            tasks: [
                {
                    id: "t3",
                    name: "Wocheneinkauf",
                    completed: false,
                    dueDate: new Date(Date.now() + 2 * 86400000).toISOString()
                },
                {
                    id: "t4",
                    name: "Steuerbelege sortieren",
                    completed: false,
                    dueDate: new Date(Date.now() - 1 * 86400000).toISOString()
                },
            ],
        },
        {
            id: 3,
            title: "Projekt Sigma",
            date: "01.01.2025",
            tasks: [
                {id: "t5", name: "Task 1", completed: false},
                {id: "t6", name: "Task 2", completed: false},
            ],
        },
        {
            id: 4,
            title: "DHBW Grind",
            date: "01.01.2025",
            tasks: [
                {id: "t7", name: "Task 1", completed: true},
                {id: "t8", name: "Task 2", completed: true},
            ],
        },
        {
            id: 5,
            title: "Bewerbungen",
            date: "01.01.2025",
            tasks: [
                {id: "t9", name: "DM", completed: false},
                {id: "t10", name: "Rossmann", completed: true},
            ],
        },
        {
            id: 6,
            title: "Sonstiges",
            date: "01.01.2025",
            tasks: [
                {id: "t11", name: "Task 1", completed: false},
                {id: "t12", name: "Task 2", completed: false},
            ],
        },
    ];

    const navigate = useNavigate();

    const createNewList = useCallback(async () => {
        const name = prompt("Name der neuen Liste:");
        if (!name || !name.trim()) return;

        try {
            const resp = await fetch("http://localhost:8080/api/v1/lists", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({name: name.trim(), description: ""})
                // falls Cookies/Session: credentials: "include"
            });

            if (!resp.ok) {
                const txt = await resp.text().catch(() => "");
                throw new Error(`Server error: ${resp.status} ${txt}`);
            }

            const text = await resp.text();                 // 201 kann leer sein
            const data = text ? JSON.parse(text) : null;
            const loc = resp.headers.get("Location");
            const id = data?.id ?? (loc ? loc.split("/").pop() : null);
            if (!id) throw new Error("Keine ID erhalten");

            navigate(`/list/${encodeURIComponent(String(id))}`, {
                state: {list: {id, title: data?.name ?? name.trim(), tasks: []}}
            });
        } catch (e) {
            console.error("Fehler beim Anlegen der Liste:", e);
            alert("Konnte Liste nicht anlegen.");
        }
    }, [navigate]);

    return (
        <main className="min-h-screen">
            {/* Content wrapper accounts for navbar + sidebar */}
            <div className="w-full">
                {/* Topbar */}
                <div className="relative mb-6 flex items-center justify-center gap-3">
                    <h1 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                        Your Lists
                    </h1>
                    <div className="absolute right-0">
                        <Button onClick={createNewList} className="h-10 rounded-xl">
                            <Plus className="mr-2 size-4"/> Neu
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {lists.map((list) => {
                        const {total, done, pct} = pctDone(list.tasks);
                        return (
                            <Link key={list.id} to={`/list/${encodeURIComponent(String(list.id))}`} className="group">
                                <Card
                                    className="rounded-3xl border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-900/60 shadow-lg transition-colors hover:from-zinc-900/90 hover:to-zinc-800/60">
                                    <CardHeader>
                                        <CardTitle className="transition-colors text-zinc-100 group-hover:text-white">
                                            {list.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Fortschritt (rein Anzeige, kein Editing) */}
                                        <div>
                                            <div className="mb-1 flex items-center gap-2 text-xs text-zinc-300">
                        <span>
                          {done}/{total} erledigt • {pct}%
                        </span>
                                            </div>
                                            <Progress value={pct} className="h-2 bg-zinc-800"/>
                                        </div>

                                        {/* Vorschau der ersten Tasks */}
                                        <ul className="space-y-1">
                                            {list.tasks.slice(0, 3).map((t) => (
                                                <li key={t.id} className="text-sm text-zinc-200">
                                                    <span
                                                        className={t.completed ? "line-through opacity-75" : undefined}>{t.name}</span>
                                                    {t.dueDate && (
                                                        <span
                                                            className="ml-2 inline-flex items-center gap-1 text-xs text-zinc-400">
                              <CalendarClock className="h-3.5 w-3.5"/> {formatDate(t.dueDate)}
                            </span>
                                                    )}
                                                </li>
                                            ))}
                                            {list.tasks.length > 3 && (
                                                <li className="text-xs text-zinc-400">…
                                                    und {list.tasks.length - 3} weitere</li>
                                            )}
                                        </ul>

                                        <div className="pt-2">
                                            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                                                {list.date}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
