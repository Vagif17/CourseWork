import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type ThemeId = "dark" | "light";
export type MessageDensityId = "comfortable" | "compact";

const STORAGE_THEME = "textme-theme";
const STORAGE_TYPING = "textme-typing-sound";
const STORAGE_DENSITY = "textme-message-density";

type AppSettingsContextValue = {
    theme: ThemeId;
    setTheme: (t: ThemeId) => void;
    typingSoundEnabled: boolean;
    setTypingSoundEnabled: (v: boolean) => void;
    messageDensity: MessageDensityId;
    setMessageDensity: (v: MessageDensityId) => void;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

function readStoredTheme(): ThemeId {
    const v = localStorage.getItem(STORAGE_THEME);
    return v === "light" ? "light" : "dark";
}

function readStoredTyping(): boolean {
    return localStorage.getItem(STORAGE_TYPING) !== "0";
}

function readStoredDensity(): MessageDensityId {
    return localStorage.getItem(STORAGE_DENSITY) === "compact" ? "compact" : "comfortable";
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeId>(readStoredTheme);
    const [typingSoundEnabled, setTypingSoundState] = useState(readStoredTyping);
    const [messageDensity, setMessageDensityState] = useState<MessageDensityId>(readStoredDensity);

    useLayoutEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem(STORAGE_THEME, theme);
    }, [theme]);

    const setTheme = useCallback((t: ThemeId) => setThemeState(t), []);

    const setTypingSoundEnabled = useCallback((v: boolean) => {
        setTypingSoundState(v);
        localStorage.setItem(STORAGE_TYPING, v ? "1" : "0");
    }, []);

    const setMessageDensity = useCallback((v: MessageDensityId) => {
        setMessageDensityState(v);
        localStorage.setItem(STORAGE_DENSITY, v);
    }, []);

    const value = useMemo(
        () => ({
            theme,
            setTheme,
            typingSoundEnabled,
            setTypingSoundEnabled,
            messageDensity,
            setMessageDensity,
        }),
        [theme, setTheme, typingSoundEnabled, setTypingSoundEnabled, messageDensity, setMessageDensity]
    );

    return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings(): AppSettingsContextValue {
    const ctx = useContext(AppSettingsContext);
    if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
    return ctx;
}
