import {createContext, type ReactNode, useCallback, useContext, useState} from "react";
import {AlertCircle, CheckCircle2, Info, X} from "lucide-react";

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({children}: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, {id, message, type}]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{addToast}}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-right-full duration-300
                            ${toast.type === 'error' ? 'bg-red-100 dark:bg-red-950/90 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200' : ''}
                            ${toast.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200' : ''}
                            ${toast.type === 'info' ? 'bg-zinc-100 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200' : ''}
                        `}
                    >
                        {toast.type === 'error' && <AlertCircle size={20} className="text-red-600 dark:text-red-400 shrink-0"/>}
                        {toast.type === 'success' && <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0"/>}
                        {toast.type === 'info' && <Info size={20} className="text-blue-600 dark:text-blue-400 shrink-0"/>}

                        <p className="text-sm font-medium flex-1">{toast.message}</p>

                        <button onClick={() => removeToast(toast.id)} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors">
                            <X size={16}/>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
}