// File: frontend/src/list/List.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { ScrollArea } from "../components/ui/scroll-area";
import { Progress } from "../components/ui/progress";
import { TooltipProvider } from "../components/ui/tooltip";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";

// Types
export type Task = {
    id: string;
    name: string;
    description?: string;
    dueDate?: string; // ISO
    completed: boolean;
};

export type TodoList = {
    id: string | number;
    title: string; // entspricht name
    tasks: Task[];
    date?: string; // optionale Anzeige
};

type ServerTask = {
    id: number | string;
    name: string;
    description?: string | null;
    dueDate?: string | null;
    completed?: boolean;
    listId?: number | string;
};

type ServerList = {
    id: number | string;
    name: string;
    description?: string | null;
};

function formatDate(iso?: string) {
    if (!iso) return "Kein Datum";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function pctDone(tasks: Task[]) {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

// Komponente
export default function ListDetail() {
    const { id } = useParams();
    const location = useLocation() as { state?: { list?: TodoList } };
    const navigate = useNavigate();

    const [list, setList] = useState<TodoList | null>(location.state?.list ?? null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Helper: map ServerTask -> Task
    function mapTask(st: ServerTask): Task {
        return {
            id: String(st.id),
            name: st.name,
            description: st.description ?? undefined,
            dueDate: st.dueDate ?? undefined,
            completed: !!st.completed,
        };
    }

    async function fetchListMeta(listId: string | number): Promise<ServerList> {
        const res = await fetch(`http://localhost:8080/api/v1/lists/${encodeURIComponent(String(listId))}`, {
            headers: { Accept: "application/json" },
            credentials: "same-origin",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as ServerList;
    }

    // Nur Tasks für eine Liste holen und in state setzen
    async function fetchTasksForList(listId: string | number): Promise<ServerTask[]> {
        // WICHTIG: korrekter Endpoint für tasks einer Liste
        const res = await fetch(
            `http://localhost:8080/api/v1/lists/${encodeURIComponent(String(listId))}/tasks`,
            {
                headers: { Accept: "application/json" },
                credentials: "same-origin",
            }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as ServerTask[];
    }

    // Liste und ihre Tasks vom Server laden
    async function fetchListAndTasks(listId: string | number) {
        setLoading(true);
        setError(null);
        try {
            const [meta, tasks] = await Promise.all([fetchListMeta(listId), fetchTasksForList(listId)]);
            const mapped: Task[] = tasks.map(mapTask);
            setList({
                id: meta.id,
                title: meta.name,
                tasks: mapped,
                date:     undefined,       });
        } catch (e) {
            console.error(e);
            setError("Fehler beim Laden der Liste.");
            setList(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let aborted = false;
        if (!id) return;
        // priorisiere Server-Daten; falls state vorhanden wird es ignoriert — wir wollen DB-Daten
        (async () => {
            if (aborted) return;
            await fetchListAndTasks(id);
        })();
        return () => {
            aborted = true;
        };
    }, [id, location.state]);

    async function deleteList() {
        if (!id) return;
        const confirmed = window.confirm("Liste wirklich löschen? Alle Tasks gehen verloren.");
        if (!confirmed) return;

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/v1/lists/${encodeURIComponent(String(id))}`, {
                method: "DELETE",
                headers: { Accept: "application/json" },
                credentials: "same-origin",
            });
            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(`Server error: ${res.status} ${txt}`);
            }
            // auf Startseite zurück
            navigate("/");
        } catch (e) {
            console.error("Fehler beim Löschen der Liste:", e);
            alert("Konnte Liste nicht löschen.");
        } finally {
            setLoading(false);
        }
    }

    // Speichere neuen Task in DB (optimistisch)
    async function addTask(task: Omit<Task, "id" | "completed">) {
        if (!list) return;
        const tempId = `temp_${Date.now()}`;
        const tempTask: Task = { id: tempId, completed: false, ...task };

        // Optimistisches UI: sofort anzeigen
        setList((prev) => (prev ? { ...prev, tasks: [tempTask, ...prev.tasks] } : prev));
        setSaving(true);

        try {
            const body = {
                name: task.name,
                description: task.description ?? null,
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
                listId: list.id,
            };
            const resp = await fetch("http://localhost:8080/api/v1/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                credentials: "same-origin",
                body: JSON.stringify(body),
            });
            if (!resp.ok) {
                const txt = await resp.text().catch(() => "");
                throw new Error(`Server error: ${resp.status} ${txt}`);
            }

            // Server sollte die erstellte Task zurückgeben
            const created: ServerTask | null = await resp.json().catch(() => null);
            if (created && created.id != null) {
                const createdTask = mapTask(created);
                setList((prev) =>
                    prev ? { ...prev, tasks: prev.tasks.map((t) => (t.id === tempId ? createdTask : t)) } : prev
                );
            } else {
                // Fallback: neu vom Server laden
                await fetchTasksForList(list.id);
            }
        } catch (e) {
            console.error("Fehler beim Anlegen des Tasks:", e);
            // entferne temporären Task bei Fehler
            setList((prev) => (prev ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== tempId) } : prev));
            // optional: rethrow oder setError
            setError("Konnte Task nicht speichern.");
        } finally {
            setSaving(false);
        }
    }

    async function deleteTask(taskId: string) {
        if (!list) return;
        const prevTasks = list.tasks;
        // Optimistisch entfernen
        setList({ ...list, tasks: list.tasks.filter((t) => t.id !== taskId) });

        try {
            const res = await fetch(
                `http://localhost:8080/api/v1/tasks/${encodeURIComponent(String(taskId))}`,
                {
                    method: "DELETE",
                    credentials: "same-origin",
                }
            );
            if (!res.ok) {
                // restore
                setList((l) => (l ? { ...l, tasks: prevTasks } : l));
                const txt = await res.text().catch(() => "");
                console.error("Delete failed:", res.status, txt);
                alert("Konnte Task nicht löschen.");
            }
            // bei Erfolg: nothing to do (Task bereits entfernt)
        } catch (e) {
            console.error("Fehler beim Löschen des Tasks:", e);
            // restore
            setList((l) => (l ? { ...l, tasks: prevTasks } : l));
            alert("Konnte Task nicht löschen.");
        }
    }

    function toggleTask(taskId: string, value: boolean) {
        if (!list) return;
        setList({
            ...list,
            tasks: list.tasks.map((t) => (t.id === taskId ? { ...t, completed: value } : t)),
        });
        // Optional: PATCH an API zum Aktualisieren des Tasks (nicht implementiert)
    }

    const progress = useMemo(() => pctDone(list?.tasks || []), [list]);

    if (!list && loading) return <div>Lade Liste…</div>;
    if (!list && error) return <div className="text-red-400">{error}</div>;
    if (!list) return null;

    return (
        <TooltipProvider>
            <main className="min-h-screen w-full">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" aria-label="Zurück">
                            <Button variant="ghost" size="icon">
                                <ChevronLeft />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-semibold">{list.title}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge>{formatDate(list.date)}</Badge>
                    </div>
                </div>

                <div className="mb-4">
                    <Progress value={progress.pct} className="h-2" />
                    <div className="text-sm text-zinc-300 mt-2">
                        {progress.done}/{progress.total} erledigt • {progress.pct}%
                    </div>
                    <div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={deleteList}
                            disabled={loading}
                            aria-label="Liste löschen"
                            title="Liste löschen"
                        >
                            <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                    </div>
                </div>



                <div className="mb-4">
                    <AddTaskForm onAdd={addTask} saving={saving} />
                </div>

                <ScrollArea className="h-[60vh] rounded-lg border border-zinc-800 p-3">
                    <AnimatePresence>
                        {list.tasks.map((t) => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="mb-2 flex items-center justify-between rounded-lg bg-zinc-900/40 p-3"
                            >
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        checked={t.completed}
                                        onCheckedChange={(v) => toggleTask(t.id, !!v)}
                                        aria-label={`Markiere ${t.name}`}
                                    />
                                    <div>
                                        <div className="font-medium">{t.name}</div>
                                        <div className="text-xs text-zinc-400">{t.description}</div>
                                        {t.dueDate && <div className="text-xs text-zinc-400">{formatDate(t.dueDate)}</div>}
                                    </div>
                                </div>
                                <div>
                                    <Button variant="ghost" size="icon" onClick={() => deleteTask(t.id)} aria-label="Löschen">
                                        <Trash2 />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </ScrollArea>
            </main>
        </TooltipProvider>
    );
}

// Subcomponent: AddTaskForm
function AddTaskForm({ onAdd, saving }: { onAdd: (t: Omit<Task, "id" | "completed">) => Promise<void> | void; saving?: boolean }) {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [due, setDue] = useState<string>("");

    async function submit() {
        if (!name.trim()) return;
        await onAdd({ name: name.trim(), description: desc.trim() || undefined, dueDate: due || undefined });
        setName("");
        setDesc("");
        setDue("");
    }

    return (
        <div className="rounded-2xl bg-zinc-900/50 p-3 ring-1 ring-zinc-800">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Task-Name"
                    aria-label="Task-Name"
                    className="md:col-span-2 bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                />
                <Input
                    type="date"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    aria-label="Fälligkeitsdatum"
                    className="md:col-span-1 bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                />
                <Textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Beschreibung (optional)"
                    aria-label="Beschreibung"
                    className="md:col-span-1 min-h-[42px] bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                />
                <Button onClick={submit} className="md:col-span-1 gap-2 rounded-xl" disabled={saving}>
                    <Plus className="h-4 w-4" /> {saving ? "Speichere..." : "Hinzufügen"}
                </Button>
            </div>
        </div>
    );
}
