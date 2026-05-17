class MediaRecorderService {
    private mediaRecorder: MediaRecorder | null = null;
    private chunks: Blob[] = [];
    private startTime = 0;
    private stream: MediaStream | null = null;
    private mimeType = "";

    private getSupportedMimeType(type: 'audio' | 'video'): string {
        const audioTypes = [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/mp4",
            "audio/aac"
        ];
        const videoTypes = [
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=vp8,opus",
            "video/webm",
            "video/mp4"
        ];
        
        const candidates = type === 'audio' ? audioTypes : videoTypes;
        for (const t of candidates) {
            if (MediaRecorder.isTypeSupported(t)) return t;
        }
        return type === 'audio' ? "audio/webm" : "video/webm";
    }

    async start(type: 'audio' | 'video'): Promise<MediaStream | null> {
        if (this.mediaRecorder) return null;

        const constraints: MediaStreamConstraints = {
            audio: true,
            video: type === 'video' ? {
                facingMode: 'user',
                width: { ideal: 480 },
                height: { ideal: 480 },
                aspectRatio: { exact: 1 }
            } : false
        };

        try {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.mimeType = this.getSupportedMimeType(type);
            
            this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: this.mimeType });
            this.chunks = [];
            this.startTime = Date.now();

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) this.chunks.push(e.data);
            };

            this.mediaRecorder.start();
            return this.stream;
        } catch (err) {
            console.error("Failed to start recording", err);
            throw err;
        }
    }

    stop(): Promise<{ file: File; duration: number; type: string; blob: Blob } | null> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) return resolve(null);

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.chunks, { type: this.mimeType });
                const extension = this.mimeType.includes("video") ? "webm" : (this.mimeType.includes("mp4") ? "m4a" : "webm");
                const prefix = this.mimeType.includes("video") ? "video" : "voice";
                
                const file = new File([blob], `${prefix}_${Date.now()}.${extension}`, { type: this.mimeType });
                const duration = Math.floor((Date.now() - this.startTime) / 1000);

                this.cleanup();
                resolve({ file, duration, type: this.mimeType, blob });
            };

            try {
                this.mediaRecorder.stop();
            } catch (err) {
                this.cleanup();
                reject(err);
            }
        });
    }

    cancel() {
        this.cleanup();
    }

    private cleanup() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        this.mediaRecorder = null;
        this.chunks = [];
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
        }
    }
}

export const mediaRecorderService = new MediaRecorderService();
