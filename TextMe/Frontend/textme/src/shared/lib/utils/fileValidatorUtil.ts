import { toast } from "react-toastify";

const MAX_FILE_SIZE_MB = 50;

export function validateFiles(files: File[]): { file: File; url: string }[] {
    return Array.from(files)
        .filter(file => {
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                toast.error(`File ${file.name} is too large (max ${MAX_FILE_SIZE_MB} MB))`);
                return false;
            }
            if (!file.type.startsWith("image") && !file.type.startsWith("video")) {
                toast.error(`The file ${file.name} has an unsupported format`);
                return false;
            }
            return true;
        })
        .map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));
}