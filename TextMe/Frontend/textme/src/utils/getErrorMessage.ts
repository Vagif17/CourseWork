import axios from "axios";

export const getErrorMessage = (error: unknown): string => {

    if (axios.isAxiosError(error)) {

        const data: any = error.response?.data;

        if (data?.errors) {
            const firstKey = Object.keys(data.errors)[0];
            const firstError = data.errors[firstKey]?.[0];
            return firstError || "Validation error";
        }

        if (data?.detail) {
            return data.detail;
        }

        if (data?.title) {
            return data.title;
        }

        if (error.response?.status === 401) return "Unauthorized";
        if (error.response?.status === 403) return "Forbidden";
        if (error.response?.status === 404) return "Not found";
        if (error.response?.status === 400) return "Bad request";
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Unknown error";
};