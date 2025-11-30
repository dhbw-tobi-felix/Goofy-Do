import {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {apiRequest, type ListDto, type TaskDto} from "../lib/api";
import {keycloak} from "../main";
import {ArrowLeft, Pencil, Plus, Save, Trash2, X} from "lucide-react";
import {useToast} from "../context/ToastContext.tsx";
import {Modal} from "../components/Modal.tsx";
import {TaskItem} from "../components/TaskItem.tsx";

const formatDateForInput = (isoDate?: string | null) => {
    if (!isoDate) return "";
    return new Date(isoDate).toISOString().split('T')[0];
};

export default function ListDetail() {
    const {id} = useParams();
    const navigate = useNavigate();
    const authenticated = keycloak.authenticated;
    const {addToast} = useToast();

    const [loading, setLoading] = useState(true);
    const [listMeta, setListMeta] = useState<ListDto | null>(null);
    const [tasks, setTasks] = useState<TaskDto[]>([]);

    const [isEditingList, setIsEditingList] = useState(false);
    const [editListName, setEditListName] = useState("");
    const [editListDesc, setEditListDesc] = useState("");
    const [isSavingList, setIsSavingList] = useState(false);

    const [isDeletingList, setIsDeletingList] = useState(false);
    const [showDeleteListModal, setShowDeleteListModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<TaskDto | null>(null);

    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [newTaskDate, setNewTaskDate] = useState("");

    const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
    const [editTaskName, setEditTaskName] = useState("");
    const [editTaskDesc, setEditTaskDesc] = useState("");
    const [editTaskDate, setEditTaskDate] = useState("");

    useEffect(() => {
        if (!authenticated || !id) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [metaRes, tasksRes] = await Promise.all([
                    apiRequest(`/lists/${id}`),
                    apiRequest(`/lists/${id}/tasks`)
                ]);
                const metaData = await metaRes.json();
                setListMeta(metaData);
                setEditListName(metaData.name);
                setEditListDesc(metaData.description || "");
                setTasks(await tasksRes.json());
            } catch (e: any) {
                if (e.status === 404) addToast("Liste nicht gefunden", "error");
                else addToast("Laden fehlgeschlagen", "error");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate, authenticated, addToast]);

    if (!authenticated) return <div className="text-center py-20">Bitte einloggen.</div>;

    const handleUpdateList = async () => {
        if (!listMeta || !editListName.trim()) {
            addToast("Name darf nicht leer sein", "error");
            return;
        }
        setIsSavingList(true);
        try {
            await apiRequest(`/lists/${listMeta.id}`, {
                method: "PATCH",
                body: JSON.stringify({name: editListName.trim(), description: editListDesc.trim() || null})
            });
            setListMeta({...listMeta, name: editListName.trim(), description: editListDesc.trim() || undefined});
            setIsEditingList(false);
            addToast("Liste aktualisiert", "success");
        } catch (e: any) {
            addToast(e.message || "Speichern fehlgeschlagen", "error");
        } finally {
            setIsSavingList(false);
        }
    };

    const deleteEntireList = async () => {
        if (!listMeta) return;
        setIsDeletingList(true);
        try {
            await apiRequest(`/lists/${listMeta.id}`, {method: "DELETE"});
            addToast("Liste wurde gelöscht", "info");
            navigate("/");
        } catch (e: any) {
            addToast(e.message || "Fehler beim Löschen", "error");
            setIsDeletingList(false);
            setShowDeleteListModal(false);
        }
    };

    const handleAddTask = async () => {
        if (!newTaskName.trim() || !listMeta) return;
        const payload = {
            name: newTaskName,
            completed: false,
            listId: listMeta.id,
            description: newTaskDesc.trim() || null,
            dueDate: newTaskDate ? new Date(newTaskDate).toISOString().slice(0, 19) : null
        };
        try {
            await apiRequest("/tasks", {method: "POST", body: JSON.stringify(payload)});
            setNewTaskName("");
            setNewTaskDesc("");
            setNewTaskDate("");
            const refresh = await apiRequest(`/lists/${listMeta.id}/tasks`);
            setTasks(await refresh.json());
            addToast("Aufgabe hinzugefügt", "success");
        } catch (e: any) {
            addToast(e.message || "Aufgabe konnte nicht erstellt werden", "error");
        }
    };

    const toggleTask = async (taskId: number, currentStatus: boolean) => {
        setTasks(prev => prev.map(t => t.id === taskId ? {...t, completed: !currentStatus} : t));
        try {
            await apiRequest(`/tasks/${taskId}`, {method: "PATCH", body: JSON.stringify({completed: !currentStatus})});
        } catch (e) {
            setTasks(prev => prev.map(t => t.id === taskId ? {...t, completed: currentStatus} : t));
            addToast("Status Fehler", "error");
        }
    };

    const openEditTaskModal = (task: TaskDto) => {
        setEditingTask(task);
        setEditTaskName(task.name);
        setEditTaskDesc(task.description || "");
        setEditTaskDate(formatDateForInput(task.dueDate));
    };

    const handleUpdateTaskDetails = async () => {
        if (!editingTask || !editTaskName.trim()) {
            addToast("Name erforderlich", "error");
            return;
        }
        const updatedTask = {
            ...editingTask,
            name: editTaskName.trim(),
            description: editTaskDesc.trim() || null,
            dueDate: editTaskDate ? new Date(editTaskDate).toISOString().slice(0, 19) : null
        };

        setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
        setEditingTask(null);

        try {
            await apiRequest(`/tasks/${editingTask.id}`, {
                method: "PATCH",
                body: JSON.stringify({name: updatedTask.name, description: updatedTask.description, dueDate: updatedTask.dueDate})
            });
            addToast("Aufgabe gespeichert", "success");
        } catch (e: any) {
            addToast(e.message || "Fehler beim Speichern", "error");
            const refresh = await apiRequest(`/lists/${listMeta!.id}/tasks`);
            setTasks(await refresh.json());
        }
    };

    const confirmDeleteTask = async () => {
        if (!taskToDelete) return;
        const backup = [...tasks];
        setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
        setTaskToDelete(null);
        try {
            await apiRequest(`/tasks/${taskToDelete.id}`, {method: "DELETE"});
            addToast("Aufgabe gelöscht", "info");
        } catch {
            setTasks(backup);
            addToast("Löschen fehlgeschlagen", "error");
        }
    };

    if (loading) return <div className="text-zinc-500 animate-pulse mt-10">Lade Liste...</div>;
    if (!listMeta) return <div className="text-red-400 mt-10">Liste nicht gefunden.</div>;

    const done = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const percentage = total === 0 ? 0 : Math.round((done / total) * 100);

    return (
        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <Modal
                isOpen={showDeleteListModal}
                onClose={() => setShowDeleteListModal(false)}
                title="Liste komplett löschen?"
                footer={
                    <>
                        <button onClick={() => setShowDeleteListModal(false)} className="px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white">Abbrechen</button>
                        <button onClick={deleteEntireList} disabled={isDeletingList} className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl shadow-lg">Löschen</button>
                    </>
                }
            >
                <p className="text-zinc-600 dark:text-zinc-300">Möchtest du <span className="font-bold text-zinc-900 dark:text-white">"{listMeta.name}"</span> wirklich löschen?</p>
            </Modal>

            <Modal
                isOpen={!!taskToDelete}
                onClose={() => setTaskToDelete(null)}
                title="Aufgabe löschen?"
                footer={
                    <>
                        <button onClick={() => setTaskToDelete(null)} className="px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white">Abbrechen</button>
                        <button onClick={confirmDeleteTask} className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl shadow-lg">Löschen</button>
                    </>
                }
            >
                <p className="text-zinc-600 dark:text-zinc-300">Aufgabe <span className="font-bold text-zinc-900 dark:text-white">"{taskToDelete?.name}"</span> löschen?</p>
            </Modal>

            <Modal
                isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
                title="Aufgabe bearbeiten"
                footer={
                    <>
                        <button onClick={() => setEditingTask(null)} className="px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white">Abbrechen</button>
                        <button onClick={handleUpdateTaskDetails} disabled={!editTaskName.trim()} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl disabled:opacity-50">Speichern</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 uppercase">Name</label>
                        <input value={editTaskName} onChange={e => setEditTaskName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleUpdateTaskDetails()} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-200 focus:border-blue-500 outline-none"/>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 uppercase">Beschreibung</label>
                        <textarea rows={3} value={editTaskDesc} onChange={e => setEditTaskDesc(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-200 focus:border-blue-500 outline-none resize-none"/>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 uppercase">Fälligkeitsdatum</label>
                        <input type="date" value={editTaskDate} onChange={e => setEditTaskDate(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-400 focus:border-blue-500 outline-none"/>
                    </div>
                </div>
            </Modal>

            <div className="flex flex-col gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800/50 pb-6">
                <div className="flex items-center justify-between">
                    <Link to="/" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors flex items-center gap-1 text-sm group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Zurück
                    </Link>

                    <div className="flex gap-2">
                        {!isEditingList && (
                            <button onClick={() => setIsEditingList(true)} className="p-2 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors">
                                <Pencil size={18}/>
                            </button>
                        )}
                        <button onClick={() => setShowDeleteListModal(true)} disabled={isDeletingList} className="p-2 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors disabled:opacity-50">
                            <Trash2 size={18}/>
                        </button>
                    </div>
                </div>

                {isEditingList ? (
                    <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-blue-500/30">
                        <div className="space-y-3">
                            <input value={editListName} onChange={(e) => setEditListName(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-lg font-bold text-zinc-900 dark:text-white focus:border-blue-500 outline-none" placeholder="Listenname"/>
                            <textarea value={editListDesc} onChange={(e) => setEditListDesc(e.target.value)} rows={2} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:border-blue-500 outline-none resize-none" placeholder="Beschreibung"/>
                            <div className="flex gap-2 pt-1">
                                <button onClick={handleUpdateList} disabled={isSavingList} className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"><Save size={16}/> Speichern</button>
                                <button onClick={() => setIsEditingList(false)} className="flex items-center gap-2 px-4 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium"><X size={16}/> Abbrechen</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1 px-1 animate-in slide-in-from-left-2 duration-300">
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{listMeta.name}</h1>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed whitespace-pre-line">{listMeta.description || <span className="text-zinc-400 dark:text-zinc-600 italic text-sm">Keine Beschreibung</span>}</p>
                    </div>
                )}
            </div>

            <div className="mb-8 p-1">
                <div className="flex justify-between text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                    <span>Fortschritt</span><span>{percentage}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700 ease-out" style={{width: `${percentage}%`}}/>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 mb-8 shadow-xl focus-within:border-blue-500/50 transition-colors">
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg h-fit"><Plus size={20} className="text-zinc-400"/></div>
                        <input type="text" className="flex-1 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 pb-1 text-lg font-medium transition-all" placeholder="Was ist zu tun?" value={newTaskName} onChange={e => setNewTaskName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddTask()}/>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-12">
                        <input type="text" placeholder="Notiz..." value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} className="flex-1 min-w-[200px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 focus:border-blue-500 outline-none" onKeyDown={e => e.key === "Enter" && handleAddTask()}/>
                        <input type="date" className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-blue-500" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)}/>
                        <button onClick={handleAddTask} disabled={!newTaskName.trim()} className="px-4 py-1.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors">Hinzufügen</button>
                    </div>
                </div>
            </div>

            <div className="space-y-3 pb-24">
                {tasks.length === 0 && <div className="text-center py-12 text-zinc-400 italic">Keine Aufgaben.</div>}

                {tasks.sort((a, b) => Number(a.completed) - Number(b.completed)).map((task) => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onEdit={openEditTaskModal}
                        onDelete={(t) => setTaskToDelete(t)}
                    />
                ))}
            </div>
        </div>
    );
}