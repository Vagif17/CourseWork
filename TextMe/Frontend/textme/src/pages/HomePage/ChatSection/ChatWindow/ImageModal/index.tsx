import "./ImageModal.css";

type Props = {
    src: string;
    onClose: () => void;
};

export default function ImageModal({ src, onClose }: Props) {
    return (
        <div className="image-modal" onClick={onClose}>
            <span className="close-modal">×</span>
            <img src={src} className="modal-image" onClick={e => e.stopPropagation()} alt="modal" />
        </div>
    );
}