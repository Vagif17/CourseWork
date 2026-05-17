import React, { createContext, useContext, useState, useEffect } from "react";
import { useAppSettings } from "./AppSettingsContext";
import { profileService } from "../../api/services/profileService";

type UserLocationContextType = {
    position: [number, number] | null;
    locationError: string | null;
};

const UserLocationContext = createContext<UserLocationContextType>({
    position: null,
    locationError: null,
});

export const UserLocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { shareLocationOnMap } = useAppSettings();
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        if (!shareLocationOnMap) {
            setPosition(null);
            profileService.updateLocation(null, null).catch(err => {
                console.error("Failed to clear location on backend", err);
            });
            return;
        }

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
                setLocationError(null);

                profileService.updateLocation(pos.coords.latitude, pos.coords.longitude).catch(err => {
                    console.error("Failed to update location on backend", err);
                });
            },
            (err) => {
                console.error("Geolocation error:", err);
                setLocationError(err.message);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [shareLocationOnMap]);

    return (
        <UserLocationContext.Provider value={{ position, locationError }}>
            {children}
        </UserLocationContext.Provider>
    );
};

export const useUserLocation = () => useContext(UserLocationContext);
