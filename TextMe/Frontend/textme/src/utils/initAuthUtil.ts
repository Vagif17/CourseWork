import { tokenService } from "../services/tokenService";
import {store} from "../store";
import {login, logout} from "../store/slices/authSlice.ts";

export const initAuth = async () => {
    const token = await tokenService.getValidToken();
    if (token) {
        store.dispatch(login(token));
    } else {
        store.dispatch(logout());
    }
};