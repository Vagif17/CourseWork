import React from 'react';
import { ThemeProvider } from '../../shared/config/constants/ThemeContext';
import { CallProvider } from '../../shared/config/constants/CallContext';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <ThemeProvider>
            <CallProvider>
                {children}
            </CallProvider>
        </ThemeProvider>
    );
};
