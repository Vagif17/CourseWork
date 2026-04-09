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
                    ) : (
                        <video src={item.url} className="preview-image" controls />
                    )}
                    <button className="remove-btn" onClick={() => removeImage(index)}>×</button>
                </div>
            ))}
        </div>
    );
}