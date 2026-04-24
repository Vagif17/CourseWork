import { useCallback, useEffect, useState } from "react";
import { newsImageDisplayUrlAbsolute } from "../../../shared/api/services/newsService";

type Props = {
    imageUrl: string;
    className?: string;
    eager?: boolean;
};
export default function NewsFeedImage({ imageUrl, className, eager }: Props) {
    const [mode, setMode] = useState<0 | 1 | 2>(0);

    const proxied = newsImageDisplayUrlAbsolute(imageUrl);
    const direct = imageUrl?.trim() ?? "";
    const src = mode === 0 ? proxied ?? (direct || null) : mode === 1 ? direct || null : null;

    useEffect(() => {
        setMode(0);
    }, [imageUrl]);

    const onError = useCallback(() => {
        setMode(m => (m === 0 ? 1 : 2));
    }, []);

    if (mode === 2 || !src) {
        return <div className={className ? `${className} news-feed-image--ph` : "news-feed-image--ph"} aria-hidden />;
    }

    return (
        <img
            src={src}
            alt=""
            className={className}
            onError={onError}
            referrerPolicy="no-referrer"
            loading={eager ? "eager" : "lazy"}
            decoding="async"
        />
    );
}
