import "./SettingsSection.css";

type Props = {
    on: boolean;
    onToggle: () => void;
    label: string;
    hint?: string;
};

export default function SettingsToggle({ on, onToggle, label, hint }: Props) {
    return (
        <div className="settings-row">
            <div>
                <span>{label}</span>
                {hint && <div className="settings-hint">{hint}</div>}
            </div>
            <button type="button" className={`settings-toggle ${on ? "on" : ""}`} onClick={onToggle} aria-pressed={on}>
                <span className="settings-toggle-knob" />
            </button>
        </div>
    );
}
