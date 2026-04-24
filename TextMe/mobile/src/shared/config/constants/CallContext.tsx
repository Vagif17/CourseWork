import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebRTC } from '../../../shared/lib/hooks/useWebRTC';
import tokenService from '../../api/services/tokenService';
import { getUserId } from '../../../shared/lib/utils/getUserIdUtil';

type CallContextType = ReturnType<typeof useWebRTC>;

const CallContext = createContext<CallContextType | null>(null);

export function CallProvider({ children }: { children: React.ReactNode }) {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const initUser = async () => {
            const token = await tokenService.getToken();
            if (token) {
                setCurrentUserId(getUserId(token));
            }
        };
        initUser();
    }, []);

    const webrtc = useWebRTC(currentUserId);

    return (
        <CallContext.Provider value={webrtc}>
            {children}
        </CallContext.Provider>
    );
}

export function useCall() {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
}
