import { toast } from "react-toastify";

const MAX_FILE_SIZE_MB = 50;

export function validateFiles(files: File[]): { file: File; url: string }[] {
    return Array.from(files)
        .filter(file => {
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                toast.error(`Файл ${file.name} слишком большой (макс ${MAX_FILE_SIZE_MB} МБ)`);
                return false;
            }
            if (!file.type.startsWith("image") && !file.type.startsWith("video")) {
                toast.error(`Файл ${file.name} имеет неподдерживаемый формат`);
                return false;
            }
            return true;
        })
        .map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));
}