import ReactDOM from "react-dom";
import type { ReactNode } from "react";

type ModalProps = {
    children: ReactNode;
    onClose: () => void;
};

export default function Modal({ children, onClose }: ModalProps) {
    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        document.getElementById("modal-root") as HTMLElement
    );
}