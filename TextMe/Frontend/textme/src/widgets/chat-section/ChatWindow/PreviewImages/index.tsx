import "./PreviewImages.css";

type Props = {
    images: { file: File; url: string }[];
    removeImage: (index: number) => void;
};

export default function PreviewImages({ images, removeImage }: Props) {
    if (!images.length) return null;

    return (
        <div className="preview-wrapper">
            {images.map((item, index) => (
                <div key={index} className="single-preview">
                    {item.file.type.startsWith("image") ? (
                        <img src={item.url} className="preview-image" alt="preview" />
                    ) : item.file.type.startsWith("video") ? (
                        <video src={item.url} className="preview-image" controls />
                    ) : (
                        <div className="preview-file">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="preview-filename">{item.file.name}</span>
                        </div>
                    )}
                    <button className="remove-btn" onClick={() => removeImage(index)}>×</button>
                </div>
            ))}
        </div>
    );
}