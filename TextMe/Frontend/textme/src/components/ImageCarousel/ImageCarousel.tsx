import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { decodeNewsImageUrl, newsImageDisplayUrlAbsolute } from "../../services/newsService.ts";
import "./ImageCarousel.css";

export type ImageCarouselItem<T = unknown> = {
    id: string;
    imageUrl: string;
    label?: string;
    title?: string;
    description?: string;
    data?: T;
};

export type ImageCarouselProps<T = unknown> = {
    items: ImageCarouselItem<T>[];
    cycleMs?: number;
    stepPx?: number;
    className?: string;
    onActiveItemChange?: (item: ImageCarouselItem<T>, index: number) => void;
    onCenterClick?: (item: ImageCarouselItem<T>, index: number) => void;
    onShareCenter?: (item: ImageCarouselItem<T>, index: number) => void;
};

function wrapDelta(i: number, phase: number, n: number): number {
    if (n <= 1) return 0;
    const p = ((phase % n) + n) % n;
    let d = i - p;
    const half = n / 2;
    if (d > half) d -= n;
    if (d < -half) d += n;
    return d;
}

/** Almost flat “ticker” look — only slight depth, no big center pop. */
function scaleOpacityForAbsDistance(absD: number): { scale: number; opacity: number } {
    const d = Math.min(Math.max(absD, 0), 4);
    if (d <= 1) {
        const t = d;
        return { scale: 1 + (0.94 - 1) * t, opacity: 1 + (0.9 - 1) * t };
    }
    if (d <= 2) {
        const t = d - 1;
        return { scale: 0.94 + (0.9 - 0.94) * t, opacity: 0.9 + (0.82 - 0.9) * t };
    }
    if (d <= 3) {
        const t = d - 2;
        return { scale: 0.9 + (0.87 - 0.9) * t, opacity: 0.82 + (0.74 - 0.82) * t };
    }
    const t = d - 3;
    return { scale: 0.87 + (0.84 - 0.87) * Math.min(t, 1), opacity: 0.74 + (0.68 - 0.74) * Math.min(t, 1) };
}

function SlideImg({ url, eager }: { url: string; eager: boolean }) {
    const clean = decodeNewsImageUrl(url);
    const proxyAbs = newsImageDisplayUrlAbsolute(url);
    const [stage, setStage] = useState<"proxy" | "direct" | "ph">("proxy");

    useEffect(() => {
        setStage(proxyAbs ? "proxy" : "direct");
    }, [clean, proxyAbs]);

    const direct = clean.trim() ? clean : "";
    const src =
        stage === "ph" ? null : stage === "proxy" ? proxyAbs || direct || null : direct || null;

    if (!direct || stage === "ph" || !src) {
        return <div className="image-carousel-slide__ph" aria-hidden />;
    }

    return (
        <img
            src={src}
            alt=""
            className="image-carousel-slide__img"
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() =>
                setStage(s => {
                    if (s === "proxy" && direct) return "direct";
                    return "ph";
                })
            }
        />
    );
}

export default function ImageCarousel<T = unknown>({
    items,
    cycleMs = 26_000,
    stepPx = 100,
    className,
    onActiveItemChange,
    onCenterClick,
    onShareCenter,
}: ImageCarouselProps<T>) {
    const n = items.length;
    const phaseRef = useRef(0);
    const pausedRef = useRef(false);
    const touchResumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [frame, setFrame] = useState(0);
    const lastActiveRef = useRef<number>(-1);

    const step = useMemo(() => Math.max(56, stepPx), [stepPx]);

    useEffect(() => {
        if (n === 0) return;
        let raf = 0;
        let last = performance.now();
        const speed = n / cycleMs;

        const tick = (now: number) => {
            const dt = now - last;
            last = now;
            if (!pausedRef.current) {
                phaseRef.current += speed * dt;
            }
            setFrame(x => x + 1);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [n, cycleMs]);

    useEffect(
        () => () => {
            if (touchResumeRef.current) clearTimeout(touchResumeRef.current);
        },
        []
    );

    const slides = useMemo(() => {
        if (n === 0) return [];
        const phase = phaseRef.current;
        return items.map((item, i) => {
            const delta = wrapDelta(i, phase, n);
            const { scale, opacity } = scaleOpacityForAbsDistance(Math.abs(delta));
            const tx = delta * step;
            const z = Math.round(60 - Math.abs(delta) * 6);
            return { item, index: i, delta, tx, scale, opacity, z };
        });
    }, [items, n, step, frame]);

    const centerIndex = useMemo(() => {
        if (slides.length === 0) return 0;
        let best = 0;
        let bestAbs = Infinity;
        slides.forEach(s => {
            const a = Math.abs(s.delta);
            if (a < bestAbs) {
                bestAbs = a;
                best = s.index;
            }
        });
        return best;
    }, [slides]);

    useEffect(() => {
        if (n === 0 || !onActiveItemChange) return;
        if (lastActiveRef.current === centerIndex) return;
        lastActiveRef.current = centerIndex;
        onActiveItemChange(items[centerIndex]!, centerIndex);
    }, [centerIndex, n, items, onActiveItemChange]);

    const setHover = useCallback((v: boolean) => {
        pausedRef.current = v;
    }, []);

    const onTouchEndResume = useCallback(() => {
        if (touchResumeRef.current) clearTimeout(touchResumeRef.current);
        touchResumeRef.current = setTimeout(() => {
            pausedRef.current = false;
            touchResumeRef.current = null;
        }, 500);
    }, []);

    const snapToIndex = useCallback(
        (targetIndex: number) => {
            if (n === 0) return;
            const k = Math.floor(phaseRef.current / n);
            phaseRef.current = k * n + targetIndex;
            setFrame(x => x + 1);
        },
        [n]
    );

    if (n === 0) {
        return (
            <div className={`image-carousel image-carousel--empty ${className ?? ""}`}>
                <p className="image-carousel-empty">No images to show.</p>
            </div>
        );
    }

    return (
        <div
            className={`image-carousel ${className ?? ""}`}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onTouchStart={() => {
                if (touchResumeRef.current) {
                    clearTimeout(touchResumeRef.current);
                    touchResumeRef.current = null;
                }
                setHover(true);
            }}
            onTouchEnd={onTouchEndResume}
        >
            <div className="image-carousel-viewport">
                {slides.map(({ item, index, delta, tx, scale, opacity, z }) => {
                    const isFront = Math.abs(delta) < 0.55;
                    const headline = item.title ?? item.label;
                    return (
                        <div
                            key={item.id}
                            role="button"
                            tabIndex={0}
                            className="image-carousel-slide"
                            style={{
                                transform: `translate(calc(-50% + ${tx}px), -50%) scale(${scale})`,
                                opacity,
                                zIndex: z,
                            }}
                            onClick={() => {
                                if (isFront) onCenterClick?.(item, index);
                                else snapToIndex(index);
                            }}
                            onKeyDown={e => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    if (isFront) onCenterClick?.(item, index);
                                    else snapToIndex(index);
                                }
                            }}
                            aria-label={headline ?? `Slide ${index + 1}`}
                        >
                            <div className="image-carousel-slide__frame">
                                <div className="image-carousel-slide__media">
                                    <SlideImg url={item.imageUrl} eager={isFront} />
                                    {isFront && onShareCenter && (
                                        <button
                                            type="button"
                                            className="image-carousel-share-btn"
                                            aria-label="Share"
                                            title="Share"
                                            onClick={e => {
                                                e.stopPropagation();
                                                onShareCenter(item, index);
                                            }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="18" cy="5" r="3" />
                                                <circle cx="6" cy="12" r="3" />
                                                <circle cx="18" cy="19" r="3" />
                                                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                {(headline || item.description) && (
                                    <div className="image-carousel-slide__body">
                                        {headline && <div className="image-carousel-slide__title">{headline}</div>}
                                        {item.description && (
                                            <div className="image-carousel-slide__description">{item.description}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
