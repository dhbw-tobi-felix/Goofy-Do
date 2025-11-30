// src/list/List.tsx
import {useEffect, useMemo, useState} from "react";
import {Link, useLocation, useNavigate, useParams} from "react-router-dom";
import {AnimatePresence, motion} from "framer-motion";
import {Button} from "../components/ui/button";
import {Badge} from "../components/ui/badge";
import {Input} from "../components/ui/input";
import {Checkbox} from "../components/ui/checkbox";
import {ScrollArea} from "../components/ui/scroll-area";
import {Progress} from "../components/ui/progress";
import {TooltipProvider} from "../components/ui/tooltip";
import {ChevronLeft, Plus, Trash2} from "lucide-react";
import {apiRequest} from "../lib/api"; // <--- WICHTIG

// Types
export type Task = {
    id: string;
    name: string;
    description?: string;
    dueDate?: string;
    completed: boolean;
};

export type TodoList = {
    id: string | number;
    title: string;
    tasks: Task[];
    date?: string;
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

export default function ListDetail() {
    const { id } = useParams();
    const location = useLocation() as { state?: { list?: TodoList } };
    const navigate = useNavigate();

    const [list, setList] = useState<TodoList | null>(location.state?.list ?? null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    function mapTask(st: ServerTask): Task {
        return {
            id: String(st.id),
            name: st.name,
            description: st.description ?? undefined,
            dueDate: st.dueDate ?? undefined,
            completed: !!st.completed,
        };
    }

    // --- API CALLS JETZT ÜBER apiRequest ---

    async function fetchListMeta(listId: string | number): Promise<ServerList> {
        const res = await apiRequest(`/lists/${encodeURIComponent(String(listId))}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as ServerList;
    }

    async function fetchTasksForList(listId: string | number): Promise<ServerTask[]> {
        const res = await apiRequest(`/lists/${encodeURIComponent(String(listId))}/tasks`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as ServerTask[];
    }

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
                date: undefined,
            });
        } catch (e) {
            console.error(e);
            setError("Fehler beim Laden der Liste.");
            // Nur resetten wenn wir auch keine State-Daten hatten
            if (!list) setList(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let aborted = false;
        if (!id) return;
        (async () => {
            if (aborted) return;
            await fetchListAndTasks(id);
        })();
        return () => { aborted = true; };
    }, [id]); // location.state entfernt aus dependency, damit wir bei reload frische Daten holen

    async function deleteList() {
        if (!id) return;
        const confirmed = window.confirm("Liste wirklich löschen? Alle Tasks gehen verloren.");
        if (!confirmed) return;

        setLoading(true);
        try {
            const res = await apiRequest(`/lists/${encodeURIComponent(String(id))}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(`Server error: ${res.status} ${txt}`);
            }
            navigate("/");
        } catch (e) {
            console.error("Fehler beim Löschen der Liste:", e);
            alert("Konnte Liste nicht löschen.");
        } finally {
            setLoading(false);
        }
    }

    async function addTask(task: Omit<Task, "id" | "completed">) {
        if (!list) return;
        const tempId = `temp_${Date.now()}`;
        const tempTask: Task = { id: tempId, completed: false, ...task };

        // Optimistisches UI
        setList((prev) => (prev ? { ...prev, tasks: [tempTask, ...prev.tasks] } : prev));
        setSaving(true);

        try {
            const body = {
                name: task.name,
                description: task.description ?? null,
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
                listId: list.id,
            };

            const resp = await apiRequest("/tasks", {
                method: "POST",
                body: JSON.stringify(body),
            });

            if (!resp.ok) {
                const txt = await resp.text().catch(() => "");
                throw new Error(`Server error: ${resp.status} ${txt}`);
            }

            const created: ServerTask | null = await resp.json().catch(() => null);
            if (created && created.id != null) {
                const createdTask = mapTask(created);
                setList((prev) =>
                    prev ? { ...prev, tasks: prev.tasks.map((t) => (t.id === tempId ? createdTask : t)) } : prev
                );
            } else {
                await fetchTasksForList(list.id);
            }
        } catch (e) {
            console.error("Fehler beim Anlegen des Tasks:", e);
            setList((prev) => (prev ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== tempId) } : prev));
            setError("Konnte Task nicht speichern.");
        } finally {
            setSaving(false);
        }
    }

    async function deleteTask(taskId: string) {
        if (!list) return;
        const prevTasks = list.tasks;
        setList({ ...list, tasks: list.tasks.filter((t) => t.id !== taskId) });

        try {
            const res = await apiRequest(`/tasks/${encodeURIComponent(String(taskId))}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Delete failed");
        } catch (e) {
            console.error("Fehler beim Löschen des Tasks:", e);
            setList((l) => (l ? { ...l, tasks: prevTasks } : l));
            alert("Konnte Task nicht löschen.");
        }
    }

    async function toggleTask(taskId: string, value: boolean) {
        if (!list) return;
        // Erstmal im UI updaten (optimistisch)
        setList({
            ...list,
            tasks: list.tasks.map((t) => (t.id === taskId ? { ...t, completed: value } : t)),
        });

        // HIER: Optionaler Backend Call (PATCH)
        // Du hattest noch keinen Endpoint dafür, aber so würde er aussehen:
        /*
        try {
           await apiRequest(`/tasks/${taskId}`, {
              method: "PATCH",
              body: JSON.stringify({ completed: value })
           });
        } catch(e) { ... revert state ... }
        */
    }

    const progress = useMemo(() => pctDone(list?.tasks || []), [list]);

    if (!list && loading) return <div className="p-8 text-zinc-400">Lade Liste…</div>;
    if (!list && error) return <div className="p-8 text-red-400 font-mono">{error}</div>;
    if (!list) return null;

    return (
        <TooltipProvider>
            <main className="min-h-screen w-full pb-20">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/">
                            <Button variant="ghost" size="icon">
                                <ChevronLeft />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-semibold text-zinc-100">{list.title}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Hier könnte das Datum der Liste stehen, wenn im Backend vorhanden */}
                    </div>
                </div>

                <div className="mb-6 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-zinc-400">Fortschritt</span>
                        <span className="text-sm font-mono text-zinc-200">{progress.pct}%</span>
                    </div>
                    <Progress value={progress.pct} className="h-2 mb-3" />
                    <div className="flex justify-between items-center">
                        <div className="text-xs text-zinc-500">
                            {progress.done} von {progress.total} Aufgaben erledigt
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/30 h-8"
                            onClick={deleteList}
                            disabled={loading}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Liste Löschen
                        </Button>
                    </div>
                </div>

                <div className="mb-6">
                    <AddTaskForm onAdd={addTask} saving={saving} />
                </div>

                <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                    <AnimatePresence mode="popLayout">
                        {list.tasks.length === 0 && (
                            <div className="text-center py-10 text-zinc-600 italic">
                                Keine Aufgaben vorhanden.
                            </div>
                        )}
                        {list.tasks.map((t) => (
                            <motion.div
                                key={t.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="group mb-3 flex items-center justify-between rounded-xl bg-zinc-900/80 border border-zinc-800/50 p-4 transition-colors hover:border-zinc-700"
                            >
                                <div className="flex items-start gap-4">
                                    <Checkbox
                                        checked={t.completed}
                                        onCheckedChange={(v) => toggleTask(t.id, !!v)}
                                        className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                    <div>
                                        <div className={`font-medium text-zinc-200 ${t.completed ? 'line-through text-zinc-500 decoration-zinc-600' : ''}`}>
                                            {t.name}
                                        </div>
                                        {t.description && (
                                            <div className="text-sm text-zinc-500 mt-0.5">{t.description}</div>
                                        )}
                                        {t.dueDate && (
                                            <Badge variant="outline" className="mt-2 text-xs border-zinc-800 text-zinc-500">
                                                {formatDate(t.dueDate)}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteTask(t.id)}
                                    className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 hover:bg-zinc-800"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </ScrollArea>
            </main>
        </TooltipProvider>
    );
}

// Subcomponent TaskForm (Unverändert gut)
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
        <div className="rounded-2xl bg-zinc-900/30 p-4 border border-zinc-800/50 focus-within:border-zinc-700 transition-colors">
            <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Was ist zu tun?"
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-blue-600"
                        onKeyDown={(e) => e.key === 'Enter' && submit()}
                    />
                    <Button onClick={submit} disabled={saving || !name.trim()} className="bg-blue-600 hover:bg-blue-500 text-white">
                        {saving ? "..." : <Plus className="h-5 w-5" />}
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Input
                        type="date"
                        value={due}
                        onChange={(e) => setDue(e.target.value)}
                        className="w-auto bg-zinc-950/50 border-zinc-800 text-zinc-400 text-xs h-8"
                    />
                    <Input
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="Notiz..."
                        className="flex-1 bg-zinc-950/50 border-zinc-800 text-zinc-400 text-xs h-8"
                    />
                </div>
            </div>
        </div>
    );
}