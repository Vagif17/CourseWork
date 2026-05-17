import { toast } from "react-toastify";

const MAX_FILE_SIZE_MB = 50;

export function validateFiles(files: File[]): { file: File; url: string }[] {
    return Array.from(files)
        .filter(file => {
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                toast.error(`File ${file.name} is too large (max ${MAX_FILE_SIZE_MB} MB))`);
                return false;
            }
            return true;
            return true;
        })
        .map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));
}