class VoiceRecorderService {
    private mediaRecorder: MediaRecorder | null = null;
    private chunks: Blob[] = [];
    private startTime = 0;
    private stream: MediaStream | null = null;

    async start() {
        if (this.mediaRecorder) {
            // уже идёт запись — не стартуем снова
            return;
        }

        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(this.stream);
        this.chunks = [];
        this.startTime = Date.now();

        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) this.chunks.push(e.data);
        };

        this.mediaRecorder.start();
    }

    stop(): Promise<{ file: File; duration: number }> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) return reject("Recorder not started");

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.chunks, { type: "audio/webm" });
                const file = new File([blob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
                const duration = Math.floor((Date.now() - this.startTime) / 1000);

                this.mediaRecorder = null;
                this.chunks = [];
                if (this.stream) {
                    this.stream.getTracks().forEach((track) => track.stop());
                    this.stream = null;
                }

                resolve({ file, duration });
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