import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
    latitude: number;
    longitude: number;
};

export default function LocationMessage({ latitude, longitude }: Props) {
    const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
            <div class="marker-avatar-container" style="width: 30px; height: 30px;">
                <div class="marker-avatar-inner" style="width: 26px; height: 26px;">
                    <div style="background-color: var(--primary); width: 100%; height: 100%; border-radius: 50%;"></div>
                </div>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    return (
        <div className="location-message-wrapper" style={{ height: '200px', width: '250px', borderRadius: '12px', overflow: 'hidden', marginTop: '8px' }}>
            <MapContainer 
                center={[latitude, longitude]} 
                zoom={14} 
                scrollWheelZoom={false}
                zoomControl={false}
                attributionControl={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[latitude, longitude]} icon={customIcon} />
            </MapContainer>
        </div>
    );
}
