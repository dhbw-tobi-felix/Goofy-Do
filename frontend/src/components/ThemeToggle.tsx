import {Moon, Sun} from "lucide-react";
import {useTheme} from "../context/ThemeContext";

export function ThemeToggle() {
    const {theme, toggleTheme} = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            title={`Wechsel zu ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
            {theme === "dark" ? <Sun size={20}/> : <Moon size={20}/>}
        </button>
    );
}