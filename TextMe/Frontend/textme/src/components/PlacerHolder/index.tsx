import "./PlacerHolder.css";

type Props = {
    title?: string;
    description?: string;
    
};

export default function PlaceholderPage({
                                            title = "Page in Progress",
                                            description = "This page is under construction. Check back soon!"
                                        }: Props) {
    return (
        <div className="placeholder-wrapper">
            <div className="placeholder-card">
                <div className="placeholder-icon">🚧</div>
                <h1 className="placeholder-title">{title}</h1>
                <p className="placeholder-description">{description}</p>
                <div className="placeholder-animation">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    );
}