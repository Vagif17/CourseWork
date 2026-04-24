import { api } from "./API";

export const userService = {
    searchUsers: async (query: string) => {
        const response = await api.get(`/User/search?query=${query}`);
        return response.data;
    }
};
