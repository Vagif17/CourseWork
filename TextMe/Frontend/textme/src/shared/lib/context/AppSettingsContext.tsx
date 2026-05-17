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

export type CustomColors = {
    background: string | null;
    secondary: string | null;
    accent: string | null;
    myMessage: string | null;
    otherMessage: string | null;
};

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
    shareLocationOnMap: boolean;
    setShareLocationOnMap: (v: boolean) => void;
    moodBasedUI: boolean;
    setMoodBasedUI: (v: boolean) => void;
    customColors: CustomColors;
    setCustomColors: (c: CustomColors) => void;
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

const STORAGE_LOCATION = "textme-share-location";
const STORAGE_MOOD_UI = "textme-mood-ui";

function readStoredLocation(): boolean {
    return localStorage.getItem(STORAGE_LOCATION) !== "0";
}

function readStoredMoodUI(): boolean {
    return localStorage.getItem(STORAGE_MOOD_UI) === "1";
}

const STORAGE_CUSTOM_COLORS = "textme-custom-colors";

function readStoredCustomColors(): CustomColors {
    const v = localStorage.getItem(STORAGE_CUSTOM_COLORS);
    if (v) {
        try {
            return JSON.parse(v);
        } catch {}
    }
    return { background: null, secondary: null, accent: null, myMessage: null, otherMessage: null };
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeId>(readStoredTheme);
    const [typingSoundEnabled, setTypingSoundState] = useState(readStoredTyping);
    const [messageDensity, setMessageDensityState] = useState<MessageDensityId>(readStoredDensity);
    const [shareLocationOnMap, setShareLocationState] = useState(readStoredLocation);
    const [moodBasedUI, setMoodBasedUIState] = useState(readStoredMoodUI);
    const [customColors, setCustomColorsState] = useState<CustomColors>(readStoredCustomColors);

    useLayoutEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    useLayoutEffect(() => {
        if (customColors.background) document.documentElement.style.setProperty('--page-bg', customColors.background);
        else document.documentElement.style.removeProperty('--page-bg');

        if (customColors.secondary) {
            document.documentElement.style.setProperty('--surface-raised', customColors.secondary);
            document.documentElement.style.setProperty('--sidebar-bg', customColors.secondary);
            document.documentElement.style.setProperty('--surface-muted', customColors.secondary);
            document.documentElement.style.setProperty('--bg-input', customColors.secondary);
        } else {
            document.documentElement.style.removeProperty('--surface-raised');
            document.documentElement.style.removeProperty('--sidebar-bg');
            document.documentElement.style.removeProperty('--surface-muted');
            document.documentElement.style.removeProperty('--bg-input');
        }

        if (customColors.accent) {
            document.documentElement.style.setProperty('--accent-primary', customColors.accent);
            document.documentElement.style.setProperty('--accent-hover', customColors.accent); // Simplification, or calculate brighter
        } else {
            document.documentElement.style.removeProperty('--accent-primary');
            document.documentElement.style.removeProperty('--accent-hover');
        }

        if (customColors.myMessage) {
            document.documentElement.style.setProperty('--chat-bubble-mine', customColors.myMessage);
        } else {
            document.documentElement.style.removeProperty('--chat-bubble-mine');
        }

        if (customColors.otherMessage) {
            document.documentElement.style.setProperty('--chat-bubble-other', customColors.otherMessage);
        } else {
            document.documentElement.style.removeProperty('--chat-bubble-other');
        }
    }, [customColors]);

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

    const setShareLocationOnMap = useCallback((v: boolean) => {
        setShareLocationState(v);
        localStorage.setItem(STORAGE_LOCATION, v ? "1" : "0");
    }, []);

    const setMoodBasedUI = useCallback((v: boolean) => {
        setMoodBasedUIState(v);
        localStorage.setItem(STORAGE_MOOD_UI, v ? "1" : "0");
    }, []);

    const setCustomColors = useCallback((c: CustomColors) => {
        setCustomColorsState(c);
        localStorage.setItem(STORAGE_CUSTOM_COLORS, JSON.stringify(c));
    }, []);

    const value = useMemo(
        () => ({
            theme,
            setTheme,
            typingSoundEnabled,
            setTypingSoundEnabled,
            messageDensity,
            setMessageDensity,
            shareLocationOnMap,
            setShareLocationOnMap,
            moodBasedUI,
            setMoodBasedUI,
            customColors,
            setCustomColors
        }),
        [theme, setTheme, typingSoundEnabled, setTypingSoundEnabled, messageDensity, setMessageDensity, shareLocationOnMap, setShareLocationOnMap, moodBasedUI, setMoodBasedUI, customColors, setCustomColors]
    );

    return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings(): AppSettingsContextValue {
    const ctx = useContext(AppSettingsContext);
    if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
    return ctx;
}
