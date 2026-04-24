import { api } from "./API";

export const newsService = {
    getNews: async (category: string = "world"): Promise<any[]> => {
        const response = await api.get(`/News/${category}`);
        return response.data;
    }
};
