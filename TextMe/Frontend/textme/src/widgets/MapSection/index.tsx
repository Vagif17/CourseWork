import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useAppSettings } from "../../shared/lib/context/AppSettingsContext";
import { profileService } from "../../shared/api/services/profileService";
import { chatService } from "../../shared/api/services/chatService";
import type { ParticipantDTO } from "../../shared/api/types/chats";
import MarkerClusterGroup from 'react-leaflet-cluster';
import chatHub from "../../shared/api/hubs/chatHub";
import { toast } from "react-toastify";
import "leaflet/dist/leaflet.css";
import "./MapSection.css";
import { getDistance } from "../../shared/lib/utils/geoUtils";

type Props = {
    onSendMessage?: (chatId: number) => void;
    position: [number, number] | null;
    error: string | null;
};

export default function MapSection({ onSendMessage, position, error }: Props) {
    const { shareLocationOnMap } = useAppSettings();
    const [profile, setProfile] = useState<{ id: string; userName: string; avatarUrl: string | null } | null>(null);
    const [mapStyle, setMapStyle] = useState<'standard' | 'dark'>('standard');
    const [contacts, setContacts] = useState<{ contact: ParticipantDTO; chatId: number }[]>([]);
    const [geoDrops, setGeoDrops] = useState<any[]>([]);
    const [messageText, setMessageText] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const me = await profileService.getMe();
                setProfile({ id: me.id, userName: me.userName, avatarUrl: me.avatarUrl ?? null });

                const chats = await chatService.getAllPrivateChats();
                const uniqueContacts = new Map<string, { contact: ParticipantDTO; chatId: number }>();
                chats.forEach(chat => {
                    chat.participants.forEach(p => {
                        if (p.userId !== me.id && p.latitude != null && p.longitude != null) {
                            if (!uniqueContacts.has(p.userId)) {
                                uniqueContacts.set(p.userId, { contact: p, chatId: chat.id });
                            }
                        }
                    });
                });
                setContacts(Array.from(uniqueContacts.values()));
            } catch (err) {
                console.error("Failed to load profile for map", err);
            }
        };
        const fetchGeoDrops = async () => {
            try {
                const drops = await chatService.getGeoDrops();
                setGeoDrops(drops);
            } catch (err) {
                console.error("Failed to load geodrops", err);
            }
        };

        fetchProfile();
        fetchGeoDrops();

        const handleNewMessage = (msg: any) => {
            if (msg.mediaType === "geodrop") {
                setGeoDrops(prev => {
                    if (prev.find(d => d.id === msg.id)) return prev;
                    return [...prev, msg];
                });
            }
        };

        const handleDeletedMessage = (payload: { messageId: number }) => {
            setGeoDrops(prev => prev.filter(d => d.id !== payload.messageId));
        };

        chatHub.onReceiveMessage(handleNewMessage);
        chatHub.onMessageDeleted(handleDeletedMessage);

        return () => {
            chatHub.offReceiveMessage(handleNewMessage);
            chatHub.offMessageDeleted(handleDeletedMessage);
        };
    }, []);

    const customIcon = (avatarUrl?: string, userName?: string, isOnline: boolean = true) => L.divIcon({
        className: `custom-map-marker ${isOnline ? 'online' : 'offline'}`,
        html: `
            <div class="marker-avatar-container">
                <div class="marker-avatar-inner">
                    <img src="${avatarUrl || '/default-avatar.png'}" class="marker-avatar" alt="Avatar" />
                </div>
            </div>
            <div class="marker-nickname">${userName || 'User'}</div>
        `,
        iconSize: [120, 90],
        iconAnchor: [60, 56],
        popupAnchor: [0, -56]
    });

    const geoDropIcon = () => L.divIcon({
        className: 'custom-map-marker geodrop-marker',
        html: `
            <div class="marker-avatar-container" style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);">
                <div class="marker-avatar-inner" style="display: flex; align-items: center; justify-content: center; background: #fff;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                </div>
            </div>
            <div class="marker-nickname" style="background: #059669;">GeoDrop</div>
        `,
        iconSize: [120, 90],
        iconAnchor: [60, 56],
        popupAnchor: [0, -56]
    });

    const createClusterCustomIcon = function (cluster: any) {
        return L.divIcon({
            html: `<div class="custom-cluster-icon"><div class="cluster-pulse"></div><span class="cluster-count">${cluster.getChildCount()}</span></div>`,
            className: 'custom-cluster-marker',
            iconSize: L.point(48, 48, true),
        });
    };

    const parseLatLng = (url: string | null) => {
        if (!url) return null;
        const parts = url.split(',');
        if (parts.length === 2) {
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);
            if (!isNaN(lat) && !isNaN(lng)) return [lat, lng] as [number, number];
        }
        return null;
    };

    const tileUrl = mapStyle === 'dark'
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    return (
        <div className="map-section fade-in">
            <div className="map-header">
                <div className="map-header-top">
                    <div>
                        <h1>Location</h1>
                        <p>See where you are on the map.</p>
                    </div>
                    <div className="map-style-toggle">
                        <button
                            className={mapStyle === 'standard' ? 'active' : ''}
                            onClick={() => setMapStyle('standard')}
                        >
                            Standard
                        </button>
                        <button
                            className={mapStyle === 'dark' ? 'active' : ''}
                            onClick={() => setMapStyle('dark')}
                        >
                            Dark
                        </button>
                    </div>
                </div>
                {!shareLocationOnMap && (
                    <div className="map-warning">
                        Location sharing is disabled in Settings. Enable it to see yourself on the map.
                    </div>
                )}
                {error && (
                    <div className="map-error">
                        Error getting location: {error}
                    </div>
                )}
            </div>

            <div className="map-container-wrapper">
                {(position || !shareLocationOnMap) ? (
                    <MapContainer
                        center={position || [51.505, -0.09]}
                        zoom={position ? 15 : 2}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%', borderRadius: '16px' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url={tileUrl}
                        />
                        <MarkerClusterGroup
                            chunkedLoading
                            showCoverageOnHover={false}
                            iconCreateFunction={createClusterCustomIcon}
                        >
                                {position && shareLocationOnMap && profile && (
                                <Marker position={position} icon={customIcon(profile.avatarUrl ?? undefined, profile.userName, true)}>
                                    <Popup className="custom-popup">
                                        <b>{profile.userName} (You)</b><br />
                                        This is your current location.
                                    </Popup>
                                </Marker>
                            )}

                            {contacts.map(({ contact, chatId }) => (
                                <Marker
                                    key={contact.userId}
                                    position={[contact.latitude!, contact.longitude!]}
                                    icon={customIcon(contact.avatarUrl, contact.userName, contact.isOnline ?? false)}
                                >
                                    <Popup className="custom-popup map-chat-popup">
                                        <div className="map-popup-header">
                                            <div className="map-popup-avatar">
                                                <img src={contact.avatarUrl || '/default-avatar.png'} alt=""/>
                                            </div>
                                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                                <b>{contact.userName}</b>
                                                {!(contact.isOnline) && contact.lastSeenAt && (
                                                    <span style={{fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px'}}>
                                                        Last seen here: {new Date(contact.lastSeenAt).toLocaleString([], {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'})}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="popup-actions mt-3 flex flex-col gap-3">
                                            <input 
                                                type="text" 
                                                value={messageText} 
                                                onChange={e => setMessageText(e.target.value)} 
                                                placeholder="Write a message..."
                                                className="map-popup-input"
                                            />
                                            <div className="flex gap-2">
                                                <button 
                                                    className="map-popup-btn map-popup-btn-send flex-1"
                                                    onClick={() => {
                                                        const locUrl = `${contact.latitude},${contact.longitude}`;
                                                        chatHub.sendMessage(chatId, messageText, locUrl, "location")
                                                            .then(() => {
                                                                toast.success("Message sent to " + contact.userName);
                                                                setMessageText("");
                                                            })
                                                            .catch((err: any) => toast.error("Failed to send: " + err.message));
                                                    }}
                                                >
                                                    Send
                                                </button>
                                                <button 
                                                    className="map-popup-btn map-popup-btn-open flex-1"
                                                    onClick={() => onSendMessage?.(chatId)}
                                                >
                                                    Chat
                                                </button>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {geoDrops.map(drop => {
                                const coords = parseLatLng(drop.mediaUrl);
                                if (!coords) return null;
                                
                                const distance = position ? getDistance(position[0], position[1], coords[0], coords[1]) : Infinity;
                                const isLocked = distance > 50;

                                return (
                                    <Marker key={`drop-${drop.id}`} position={coords} icon={geoDropIcon()}>
                                        <Popup className="custom-popup geodrop-popup">
                                            <div style={{ padding: '12px', minWidth: '220px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
                                                    <div style={{ fontSize: '20px' }}>📩</div>
                                                    <div style={{ flex: 1 }}>
                                                        <strong style={{ fontSize: '14px', color: '#10b981' }}>GeoDrop from {drop.senderUserName || 'User'}</strong><br/>
                                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(drop.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                {isLocked ? (
                                                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', marginTop: '8px' }}>
                                                        🔒 Get closer to read ({Math.round(distance)}m)
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: '#fff', fontSize: '14px', lineHeight: '1.4', marginTop: '8px' }}>
                                                        {drop.text}
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                    <button 
                                                        disabled={isLocked}
                                                        onClick={() => { if (!isLocked && onSendMessage) onSendMessage(drop.chatId); }}
                                                        style={{ flex: 1, padding: '8px', background: isLocked ? 'rgba(255,255,255,0.05)' : '#10b981', color: isLocked ? '#94a3b8' : '#fff', border: 'none', borderRadius: '6px', cursor: isLocked ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500' }}
                                                    >
                                                        Reply
                                                    </button>
                                                    <button 
                                                        onClick={async () => {
                                                            try {
                                                                await chatHub.deleteMessage(drop.id);
                                                                setGeoDrops(prev => prev.filter(d => d.id !== drop.id));
                                                                toast.success("GeoDrop deleted");
                                                            } catch (e) {
                                                                toast.error("Failed to delete");
                                                            }
                                                        }}
                                                        style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MarkerClusterGroup>
                    </MapContainer>
                ) : (
                    <div className="map-loading">
                        <div className="spinner-modern"></div>
                        <p>Locating you...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
