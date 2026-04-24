import { Buffer } from "buffer";

export const getUserId = (token: string | null): string | null => {
    if (!token) return null;
    try {
        const payload = JSON.parse(Buffer.from(token.split(".")[1], 'base64').toString());
        return payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.sub || null;
    } catch {
        return null;
    }
};

