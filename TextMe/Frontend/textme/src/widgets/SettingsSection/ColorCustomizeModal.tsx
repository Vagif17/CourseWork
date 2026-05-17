import { useState, useEffect } from "react";
import Modal from "../../shared/ui/components/Modal";
import { useAppSettings } from "../../shared/lib/context/AppSettingsContext";
import "./SettingsSection.css";

type Props = {
    onClose: () => void;
};

export default function ColorCustomizeModal({ onClose }: Props) {
    const { customColors, setCustomColors } = useAppSettings();

    const [bg, setBg] = useState(customColors.background || "#0c1014");
    const [secondary, setSecondary] = useState(customColors.secondary || "#11161d");
    const [accent, setAccent] = useState(customColors.accent || "#00b6ff");
    const [myMessage, setMyMessage] = useState(customColors.myMessage || "#00b6ff");
    const [otherMessage, setOtherMessage] = useState(customColors.otherMessage || "#1c2431");

    // LIVE PREVIEW: Temporarily inject styles to :root when user changes colors
    useEffect(() => {
        document.documentElement.style.setProperty('--page-bg', bg);
        document.documentElement.style.setProperty('--surface-raised', secondary);
        document.documentElement.style.setProperty('--sidebar-bg', secondary);
        document.documentElement.style.setProperty('--surface-muted', secondary);
        document.documentElement.style.setProperty('--bg-input', secondary);
        document.documentElement.style.setProperty('--accent-primary', accent);
        document.documentElement.style.setProperty('--accent-hover', accent);
        document.documentElement.style.setProperty('--chat-bubble-mine', myMessage);
        document.documentElement.style.setProperty('--chat-bubble-other', otherMessage);

        return () => {
            // On unmount (if not applied), the AppSettingsContext useLayoutEffect will restore saved colors.
        };
    }, [bg, secondary, accent, myMessage, otherMessage]);

    const handleApply = () => {
        setCustomColors({
            background: bg,
            secondary: secondary,
            accent: accent,
            myMessage: myMessage,
            otherMessage: otherMessage
        });
        onClose();
    };

    const handleReset = () => {
        setCustomColors({
            background: null,
            secondary: null,
            accent: null,
            myMessage: null,
            otherMessage: null
        });
        onClose();
    };

    const ColorRow = ({ label, icon, color, setColor }: { label: string, icon: React.ReactNode, color: string, setColor: (c: string) => void }) => (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            marginBottom: '12px',
            background: 'var(--surface-muted)',
            borderRadius: '16px',
            border: '1px solid var(--border-chat)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', color: 'var(--accent-primary, #00b6ff)' }}>
                    {icon}
                </div>
                <label style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{label}</label>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', 
                    border: '2px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)', flexShrink: 0
                }}>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} 
                           style={{ width: '200%', height: '200%', transform: 'translate(-25%, -25%)', padding: 0, border: 'none', cursor: 'pointer' }} />
                </div>
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)} 
                       style={{ 
                           width: '76px', padding: '6px 8px', borderRadius: '8px', 
                           border: '1px solid var(--border-chat)', background: 'var(--bg-input)', 
                           color: 'var(--text-primary)', fontWeight: 500, textAlign: 'center',
                           fontFamily: 'monospace', fontSize: '13px'
                       }} />
            </div>
        </div>
    );

    return (
        <Modal onClose={onClose}>
            <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h2 style={{ 
                        margin: 0, fontSize: '24px', fontWeight: 800,
                        background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Theme Palette
                    </h2>
                    <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        Create your own unique messenger style
                    </p>
                </div>
                
                <ColorRow label="Background" color={bg} setColor={setBg} 
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>} 
                />
                <ColorRow label="Secondary elements" color={secondary} setColor={setSecondary} 
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>} 
                />
                <ColorRow label="Accent details" color={accent} setColor={setAccent} 
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>} 
                />
                <ColorRow label="My Messages" color={myMessage} setColor={setMyMessage} 
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>} 
                />
                <ColorRow label="Contact's Messages" color={otherMessage} setColor={setOtherMessage} 
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 6.1H3"></path><path d="M21 12.1H3"></path><path d="M15.1 18H3"></path></svg>} 
                />

                <div style={{ display: 'flex', gap: '16px', marginTop: '28px' }}>
                    <button 
                        type="button" 
                        onClick={handleReset}
                        style={{ 
                            flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid var(--border-chat)', 
                            background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', 
                            fontWeight: 600, fontSize: '15px', transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-muted)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        Reset
                    </button>
                    <button 
                        type="button" 
                        onClick={handleApply}
                        style={{ 
                            flex: 2, padding: '14px', borderRadius: '14px', border: 'none', 
                            background: 'var(--accent-primary, #00b6ff)', color: '#ffffff', 
                            cursor: 'pointer', fontWeight: 700, fontSize: '15px',
                            boxShadow: '0 8px 24px rgba(0, 182, 255, 0.25)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                    >
                        Apply Theme
                    </button>
                </div>
            </div>
        </Modal>
    );
}
