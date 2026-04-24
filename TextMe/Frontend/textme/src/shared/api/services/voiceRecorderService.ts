class VoiceRecorderService {
    private mediaRecorder: MediaRecorder | null = null;
    private chunks: Blob[] = [];
    private startTime = 0;
    private stream: MediaStream | null = null;
    private mimeType = "audio/webm";

    private getSupportedMimeType(): string {
        const types = [
            "audio/mp4",
            "audio/aac",
            "audio/webm;codecs=opus",
            "audio/webm"
        ];
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        return "audio/webm";
    }

    async start() {
        if (this.mediaRecorder) {
            return;
        }

        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mimeType = this.getSupportedMimeType();
        
        this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: this.mimeType });
        this.chunks = [];
        this.startTime = Date.now();

        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) this.chunks.push(e.data);
        };

        this.mediaRecorder.start();
    }

    stop(): Promise<{ file: File; duration: number; type: string }> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) return reject("Recorder not started");

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.chunks, { type: this.mimeType });
                
                // Определяем расширение на основе mimeType
                let extension = "webm";
                if (this.mimeType.includes("mp4")) extension = "m4a";
                else if (this.mimeType.includes("aac")) extension = "aac";

                const file = new File([blob], `voice_${Date.now()}.${extension}`, { type: this.mimeType });
                const duration = Math.floor((Date.now() - this.startTime) / 1000);

                this.mediaRecorder = null;
                this.chunks = [];
                if (this.stream) {
                    this.stream.getTracks().forEach((track) => track.stop());
                    this.stream = null;
                }

                resolve({ file, duration, type: this.mimeType });
            };

            try {
                this.mediaRecorder.stop();
            } catch (err) {
                reject(err);
            }
        });
    }
}

export const voiceRecorderService = new VoiceRecorderService();