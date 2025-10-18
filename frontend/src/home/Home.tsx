import {useCallback, useEffect, useState} from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {apiRequest, type ListDto} from "../lib/api";
import {keycloak} from "../main";
import {ChevronRight, FolderOpen, Lock, Plus} from "lucide-react";
import {useToast} from "../context/ToastContext.tsx";
import {Modal} from "../components/Modal.tsx";

export default function Home() {
    const [lists, setLists] = useState<ListDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [nListName, setNListName] = useState("");
    const [nListDesc, setNListDesc] = useState("");

    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get("q") || "";

    const navigate = useNavigate();
    const authenticated = keycloak.authenticated;
    const {addToast} = useToast();

    const loadLists = useCallback(async () => {
        if (!authenticated) return;
        setLoading(true);
        try {
            const res = await apiRequest("/lists");
            const data = await res.json();
            setLists(data);
        } catch (e: any) {
            addToast(e.message || "Listen konnten nicht geladen werden", 'error');
        } finally {
            setLoading(false);
        }
    }, [authenticated, addToast]);

    useEffect(() => {
        loadLists();
    }, [loadLists]);

    if (!authenticated) {
        return (
            <div
                className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4 animate-in fade-in zoom-in-95 duration-500">
                <div
                    className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl text-center">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 mb-6">
                        <Lock size={32} className="text-blue-600 dark:text-blue-400"/>
                    </div>
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">Goofy-Do</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                        Organisiere deine Aufgaben effizient.<br/>
                        Bitte melde dich an, um fortzufahren.
                    </p>
                    <button
                        onClick={() => keycloak.login()}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        Anmelden
                    </button>
                </div>
            </div>
        );
    }

    const filteredLists = lists.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.description && l.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleCreateList = async () => {
        if (!nListName.trim()) {
            addToast("Bitte einen Namen angeben", 'error');
            return;
        }
        try {
            const res = await apiRequest("/lists", {
                method: "POST",
                body: JSON.stringify({name: nListName.trim(), description: nListDesc.trim() || null})
            });
            const created = await res.json();
            addToast(`Liste "${created.name}" erstellt`, 'success');
            if (created.id) {
                navigate(`/list/${created.id}`);
            } else {
                setCreateModalOpen(false);
                setNListName("");
                setNListDesc("");
                loadLists();
            }
        } catch (e: any) {
            addToast(e.message || "Fehler beim Erstellen der Liste", 'error');
        }
    };

    return (
        <div className="container mx-auto max-w-[870px] p-5 md:py-10 min-h-screen flex flex-col">

            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Deine
                        Listen</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                        {filteredLists.length} {filteredLists.length === 1 ? 'Liste' : 'Listen'} gefunden
                    </p>
                </div>
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20 active:scale-95"
                >
                    <Plus size={18}/> Neue Liste
                </button>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl"/>)}
                </div>
            ) : (
                <>
                    {filteredLists.length === 0 ? (
                        <div
                            className="flex-1 flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/30">
                            <div className="bg-zinc-100 dark:bg-zinc-800 p-5 rounded-full mb-4">
                                <FolderOpen size={40} className="text-zinc-300 dark:text-zinc-600"/>
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                {searchTerm ? "Keine Ergebnisse" : "Leere Arbeitsfläche"}
                            </h3>
                            <p className="text-zinc-500 text-center max-w-xs mt-2 mb-6">
                                {searchTerm ? `Nichts für "${searchTerm}" gefunden.` : "Erstelle deine erste Liste, um Aufgaben zu organisieren."}
                            </p>
                            {!searchTerm && (
                                <button onClick={() => setCreateModalOpen(true)}
                                        className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
                                    Jetzt starten
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredLists.map((list) => (
                                <Link
                                    key={list.id}
                                    to={`/list/${list.id}`}
                                    className="group flex flex-col justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <div
                                                className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2.5 rounded-xl">
                                                <FolderOpen size={20}/>
                                            </div>
                                            <ChevronRight
                                                className="text-zinc-300 group-hover:text-zinc-600 dark:text-zinc-700 dark:group-hover:text-zinc-400 transition-colors"
                                                size={20}/>
                                        </div>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate mb-1">
                                            {list.name}
                                        </h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 h-10 leading-relaxed">
                                            {list.description ||
                                                <span className="opacity-40 italic">Keine Beschreibung</span>}
                                        </p>
                                    </div>
                                    <div
                                        className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between text-xs text-zinc-400 font-medium">
                                        <span>Öffnen</span>
                                        <div
                                            className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <ArrowRightIcon/>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title="Neue Liste anlegen"
                footer={
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setCreateModalOpen(false)}
                            className="flex-1 sm:flex-none px-4 py-2.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-xl font-medium transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button
                            onClick={handleCreateList}
                            disabled={!nListName.trim()}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            Erstellen
                        </button>
                    </div>
                }
            >
                <div className="space-y-5 py-2">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Name
                            der Liste</label>
                        <input
                            autoFocus
                            value={nListName}
                            onChange={e => setNListName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreateList()}
                            className="w-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none transition-colors font-medium"
                            placeholder="z.B. Wocheneinkauf"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Beschreibung
                            (Optional)</label>
                        <textarea
                            value={nListDesc}
                            onChange={e => setNListDesc(e.target.value)}
                            rows={3}
                            className="w-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none transition-colors resize-none"
                            placeholder="Zusätzliche Details..."
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

const ArrowRightIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
         strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
);