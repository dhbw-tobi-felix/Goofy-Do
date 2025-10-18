import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { CalendarClock, ChevronLeft, Plus, Trash2 } from "lucide-react";

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

function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

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

// Optionale LocalStorage-Persistenz
const STORAGE_KEY = "todo_lists";

function loadListsFromStorage(): TodoList[] | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as TodoList[]) : null;
    } catch {
        return null;
    }
}

function saveListsToStorage(lists: TodoList[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    } catch {}
}

// Komponente
export default function ListDetail() {
    const { id } = useParams();
    const location = useLocation() as { state?: { list?: TodoList } };

    const [list, setList] = useState<TodoList | null>(null);

    // Initial-Daten finden
    useEffect(() => {
        if (location.state?.list) {
            setList(location.state.list);
            return;
        }

        const stored = loadListsFromStorage();
        if (stored && id) {
            const found = stored.find((l) => String(l.id) === String(id)) || null;
            setList(found);
            return;
        }

        // Fallback
        const fallback: TodoList = {
            id: id || "list_fallback",
            title: "Liste",
            date: new Date().toLocaleDateString(),
            tasks: [
                { id: uid("task"), name: "Beispiel-Task", description: "Beschreibung", dueDate: new Date().toISOString().slice(0, 10), completed: false },
                { id: uid("task"), name: "Noch ein Task", description: "Optionaler Text", dueDate: undefined, completed: true },
            ],
        };
        setList(fallback);
    }, [id, location.state]);

    // Persistiere bei Änderungen (nur wenn die Liste aus Storage stammt)
    useEffect(() => {
        if (!list) return;
        const all = loadListsFromStorage();
        if (!all) return; // keine globale Sammlung vorhanden -> nicht speichern
        const updated = all.map((l) => (String(l.id) === String(list.id) ? list : l));
        saveListsToStorage(updated);
    }, [list]);

    function addTask(task: Omit<Task, "id" | "completed">) {
        if (!list) return;
        const newTask: Task = { id: uid("task"), completed: false, ...task };
        setList({ ...list, tasks: [newTask, ...list.tasks] });
    }

    function deleteTask(taskId: string) {
        if (!list) return;
        setList({ ...list, tasks: list.tasks.filter((t) => t.id !== taskId) });
    }

    function toggleTask(taskId: string, value: boolean) {
        if (!list) return;
        setList({
            ...list,
            tasks: list.tasks.map((t) => (t.id === taskId ? { ...t, completed: value } : t)),
        });
    }

    const progress = useMemo(() => pctDone(list?.tasks || []), [list]);

    if (!list) return null;

    return (
        <TooltipProvider>
            <main className="min-h-screen w-full">
                <div className="mx-auto max-w-5xl p-4 sm:p-6">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to={"/"}>
                                <Button variant="ghost" className="gap-2">
                                    <ChevronLeft className="h-4 w-4" /> Zurück
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
                                {list.title}
                            </h1>
                        </div>
                        {list.date && (
                            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                                {list.date}
                            </Badge>
                        )}
                    </div>

                    <Separator className="my-4 border-zinc-800" />

                    {/* Cards */}
                    <Card className="rounded-3xl border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-900/60 shadow-lg">
                        <CardHeader>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <CardTitle className="text-zinc-100">Übersicht</CardTitle>
                                <div className="w-full sm:w-64">
                                    <div className="mb-1 flex items-center justify-between text-xs text-zinc-300">
                    <span>
                      {progress.done}/{progress.total} erledigt
                    </span>
                                        <span>{progress.pct}%</span>
                                    </div>
                                    <Progress value={progress.pct} className="h-2 bg-zinc-800" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Add Task */}
                            <AddTaskForm onAdd={addTask} />

                            {/* Taskliste */}
                            <ScrollArea className="max-h-[70vh] pr-2">
                                <ul className="space-y-2">
                                    <AnimatePresence>
                                        {list.tasks.length === 0 && (
                                            <li className="text-sm text-zinc-400">Noch keine Tasks – leg los! ✨</li>
                                        )}

                                        {list.tasks.map((task) => (
                                            <motion.li
                                                key={task.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.15 }}
                                            >
                                                <div className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 transition-colors hover:bg-zinc-900">
                                                    <Checkbox
                                                        checked={task.completed}
                                                        onCheckedChange={(v) => toggleTask(task.id, Boolean(v))}
                                                        className="mt-1"
                                                        aria-label={task.completed ? "Als offen markieren" : "Als erledigt markieren"}
                                                    />

                                                    <div className="grow">
                                                        <div className="flex flex-wrap items-center gap-2">
                              <span className={task.completed ? "font-medium line-through opacity-75" : "font-medium text-zinc-100"}>
                                {task.name}
                              </span>
                                                            <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                                <CalendarClock className="h-3.5 w-3.5" /> {formatDate(task.dueDate)}
                              </span>
                                                        </div>
                                                        {task.description && (
                                                            <p className={task.completed ? "mt-1 text-sm line-through text-zinc-400" : "mt-1 text-sm text-zinc-200"}>
                                                                {task.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label="Task löschen"
                                                                className="opacity-75 hover:opacity-100"
                                                                onClick={() => deleteTask(task.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Task löschen</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </AnimatePresence>
                                </ul>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </TooltipProvider>
    );
}

// Subcomponent: AddTaskForm
function AddTaskForm({ onAdd }: { onAdd: (t: Omit<Task, "id" | "completed">) => void }) {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [due, setDue] = useState<string>("");

    function submit() {
        if (!name.trim()) return;
        onAdd({ name: name.trim(), description: desc.trim() || undefined, dueDate: due || undefined });
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
                <Button onClick={submit} className="md:col-span-1 gap-2 rounded-xl">
                    <Plus className="h-4 w-4" /> Hinzufügen
                </Button>
            </div>
        </div>
    );
}
