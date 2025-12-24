import React from "react";
import ReactDOM from "react-dom";

const ModalPortal = ({ children }) => {
    return ReactDOM.createPortal(
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000
            }}
        >
            <div style={{
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                minWidth: "300px"
            }}>
                {children}
            </div>
        </div>,
        document.body
    );
};

export default ModalPortal;
