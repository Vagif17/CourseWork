export const IS_PRODUCTION = false;

export const API_IP = "192.168.0.106";
export const LOCAL_BASE_URL = `http://${API_IP}:5243`;
export const RENDER_BASE_URL = "https://coursework-1-1mjp.onrender.com";

export const BASE_URL = IS_PRODUCTION ? RENDER_BASE_URL : LOCAL_BASE_URL;

export const API_URL = `${BASE_URL}/api`;
export const HUB_URL = `${BASE_URL}/hubs/chat`;
