import {AlignLeft, Calendar, CheckCircle2, Circle, Pencil, Trash2} from "lucide-react";
import type {TaskDto} from "../lib/api";

interface TaskItemProps {
    task: TaskDto;
    onToggle: (id: number, status: boolean) => void;
    onEdit: (task: TaskDto) => void;
    onDelete: (task: TaskDto) => void;
}

const formatDate = (isoDate: string) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleDateString('de-DE', {day: '2-digit', month: 'short'});
};

export function TaskItem({task, onToggle, onEdit, onDelete}: TaskItemProps) {
    return (
        <div className={`group flex items-start justify-between p-4 rounded-xl border transition-all duration-300
            ${task.completed
            ? "bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-900 opacity-60"
            : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        }`}
        >
            <div className="flex items-start gap-4 flex-1 min-w-0">
                <button
                    onClick={() => onToggle(task.id, task.completed)}
                    className={`mt-0.5 transition-transform active:scale-90 ${
                        task.completed ? "text-green-600 dark:text-green-500" : "text-zinc-400 hover:text-blue-600 dark:hover:text-blue-500"
                    }`}
                >
                    {task.completed ? <CheckCircle2 size={22} className="fill-green-100 dark:fill-green-950"/> :
                        <Circle size={22}/>}
                </button>
                <div className="flex-1 min-w-0 pr-2">
                    <p className={`font-medium ${task.completed ? "text-zinc-500 line-through" : "text-zinc-900 dark:text-zinc-200"}`}>
                        {task.name}
                    </p>
                    {task.description && (
                        <div className="flex items-start gap-1 mt-1 text-sm text-zinc-500">
                            <AlignLeft size={12} className="mt-1 flex-shrink-0 opacity-70"/>
                            <p className="line-clamp-2 break-words">{task.description}</p>
                        </div>
                    )}
                    {task.dueDate && (
                        <div className="mt-2">
                            <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border 
                                ${task.completed
                                ? "border-zinc-200 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-700"
                                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400"
                            }`}>
                                <Calendar size={10}/> {formatDate(task.dueDate)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div
                className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(task)}
                    className="p-2 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                >
                    <Pencil size={16}/>
                </button>
                <button
                    onClick={() => onDelete(task)}
                    className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                >
                    <Trash2 size={16}/>
                </button>
            </div>
        </div>
    );
}