import { useState } from "react";
import "./ChatWindow.css";

type Props = {
    onClose: () => void;
    onSelect: (mode: "unread" | "today" | "custom", date?: string) => void;
};

export default function SummarizeOptionsModal({ onClose, onSelect }: Props) {
    const [selectedMode, setSelectedMode] = useState<"unread" | "today" | "custom">("today");
    const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

    return (
        <div className="summary-options-overlay" onClick={onClose}>
            <div className="summary-options-modal" onClick={e => e.stopPropagation()}>
                <header>
                    <h3>Summarize Chat ✨</h3>
                    <p>Select the period you want to summarize</p>
                </header>

                <div className="options-list">
                    <button 
                        className={`option-card ${selectedMode === 'unread' ? 'active' : ''}`}
                        onClick={() => setSelectedMode('unread')}
                    >
                        <div className="option-icon">📨</div>
                        <div className="option-info">
                            <span className="option-title">Unread messages</span>
                            <span className="option-desc">Only messages you haven't read yet</span>
                        </div>
                    </button>

                    <button 
                        className={`option-card ${selectedMode === 'today' ? 'active' : ''}`}
                        onClick={() => setSelectedMode('today')}
                    >
                        <div className="option-icon">📅</div>
                        <div className="option-info">
                            <span className="option-title">Today</span>
                            <span className="option-desc">Everything discussed since morning</span>
                        </div>
                    </button>

                    <button 
                        className={`option-card ${selectedMode === 'custom' ? 'active' : ''}`}
                        onClick={() => setSelectedMode('custom')}
                    >
                        <div className="option-icon">🗓️</div>
                        <div className="option-info">
                            <span className="option-title">Custom date</span>
                            <span className="option-desc">Summarize messages for a specific day</span>
                        </div>
                    </button>
                </div>

                {selectedMode === 'custom' && (
                    <div className="custom-date-picker fade-in">
                        <label>Select date:</label>
                        <input 
                            type="date" 
                            value={customDate} 
                            onChange={e => setCustomDate(e.target.value)} 
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                )}

                <footer className="summary-options-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button 
                        className="confirm-btn" 
                        onClick={() => onSelect(selectedMode, selectedMode === 'custom' ? customDate : undefined)}
                    >
                        Summarize
                    </button>
                </footer>
            </div>
        </div>
    );
}
