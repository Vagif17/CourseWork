import { tokenService } from "../../api/services/tokenService";
import { store } from "../../../app/store";
import { login, logout } from "../../../app/store/slices/authSlice.ts";

export const initAuth = async () => {
    const token = await tokenService.getValidToken();
    if (token) {
        store.dispatch(login(token));
    } else {
        store.dispatch(logout());
    }
};