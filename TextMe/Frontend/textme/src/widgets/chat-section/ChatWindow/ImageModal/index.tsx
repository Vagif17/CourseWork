import "./ImageModal.css";

type Props = {
    src: string;
    onClose: () => void;
};

export default function ImageModal({ src, onClose }: Props) {
    const isVideo = src.match(/\.(mp4|webm|ogg)$/i) || src.includes("video");

    return (
        <div className="image-modal" onClick={onClose}>
            <span className="close-modal">×</span>
            {isVideo ? (
                <video src={src} controls autoPlay className="modal-image" onClick={e => e.stopPropagation()} />
            ) : (
                <img src={src} className="modal-image" onClick={e => e.stopPropagation()} alt="modal" />
            )}
        </div>
    );
}