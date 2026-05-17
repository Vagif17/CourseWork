import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Modal from "../../../../shared/ui/components/Modal";
import { useUserLocation } from "../../../../shared/lib/context/UserLocationContext";
import "leaflet/dist/leaflet.css";

type Props = {
    onClose: () => void;
    onSelect: (lat: number, lng: number) => void;
};

const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (p: [number, number]) => void }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={customIcon}></Marker>
    );
}

export default function LocationPickerModal({ onClose, onSelect }: Props) {
    const { position: currentPos } = useUserLocation();
    const [selectedPos, setSelectedPos] = useState<[number, number] | null>(currentPos);

    return (
        <Modal onClose={onClose}>
            <div style={{ width: '90vw', maxWidth: '500px', padding: '20px', background: 'var(--page-bg)', borderRadius: '16px' }}>
                <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Select GeoDrop Location</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>Click on the map to place your GeoDrop.</p>
                <div style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                    <MapContainer
                        center={currentPos || [51.505, -0.09]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />
                        <LocationMarker position={selectedPos} setPosition={setSelectedPos} />
                    </MapContainer>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--surface-raised)', color: 'var(--text-primary)', cursor: 'pointer' }}>Cancel</button>
                    <button 
                        disabled={!selectedPos}
                        onClick={() => {
                            if (selectedPos) {
                                onSelect(selectedPos[0], selectedPos[1]);
                                onClose();
                            }
                        }} 
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--accent-primary)', color: '#fff', cursor: selectedPos ? 'pointer' : 'not-allowed', opacity: selectedPos ? 1 : 0.5 }}
                    >
                        Drop Here
                    </button>
                </div>
            </div>
        </Modal>
    );
}
