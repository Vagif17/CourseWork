import React, { useEffect, useRef, useState } from "react";
import chatHub from "../../../../shared/api/hubs/chatHub";
import "./LiveCanvas.css";

type Props = {
    chatId: number;
    messageId: number;
};

export default function LiveCanvas({ chatId, messageId }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#00b6ff");
    const [brushSize, setBrushSize] = useState(3);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Make canvas sharp on high-DPI displays
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        
        const context = canvas.getContext("2d");
        if (context) {
            context.scale(2, 2);
            context.lineCap = "round";
            context.lineJoin = "round";
            contextRef.current = context;
        }

        const handleReceiveDrawData = (receivedMessageId: number, drawData: any) => {
            if (receivedMessageId !== messageId) return;
            
            const ctx = contextRef.current;
            if (!ctx) return;

            const { x0, y0, x1, y1, color: strokeColor, size } = drawData;
            
            if (strokeColor === 'clear') {
                const canvas = canvasRef.current;
                if (canvas) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
                return;
            }
            
            ctx.globalCompositeOperation = strokeColor === 'eraser' ? 'destination-out' : 'source-over';
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.strokeStyle = strokeColor === 'eraser' ? '#000' : strokeColor;
            ctx.lineWidth = size;
            ctx.stroke();
            ctx.closePath();
        };

        chatHub.onReceiveDrawData(handleReceiveDrawData);

        return () => {
            chatHub.offReceiveDrawData(handleReceiveDrawData);
        };
    }, [messageId]);

    const lastPos = useRef<{ x: number; y: number } | null>(null);

    const getMousePos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const pos = getMousePos(e);
        lastPos.current = pos;
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !contextRef.current || !lastPos.current) return;
        
        const pos = getMousePos(e);
        
        const drawData = {
            x0: lastPos.current.x,
            y0: lastPos.current.y,
            x1: pos.x,
            y1: pos.y,
            color,
            size: brushSize
        };

        // Draw locally
        contextRef.current.globalCompositeOperation = drawData.color === 'eraser' ? 'destination-out' : 'source-over';
        contextRef.current.beginPath();
        contextRef.current.moveTo(drawData.x0, drawData.y0);
        contextRef.current.lineTo(drawData.x1, drawData.y1);
        contextRef.current.strokeStyle = drawData.color === 'eraser' ? '#000' : drawData.color;
        contextRef.current.lineWidth = drawData.size;
        contextRef.current.stroke();
        contextRef.current.closePath();

        // Broadcast to others
        chatHub.drawOnCanvas(chatId, messageId, drawData).catch(console.error);

        lastPos.current = pos;
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        lastPos.current = null;
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const drawData = {
            x0: 0, y0: 0, x1: 0, y1: 0,
            color: 'clear',
            size: 1
        };
        chatHub.drawOnCanvas(chatId, messageId, drawData).catch(console.error);
    };

    const colors = ["#ffffff", "#ff4b4b", "#00b6ff", "#00e676", "#ffb300"];

    return (
        <div className="live-canvas-container">
            <div className="live-canvas-toolbar">
                <div className="canvas-colors">
                    {colors.map(c => (
                        <button 
                            key={c}
                            className={`color-btn ${color === c ? 'active' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                        />
                    ))}
                    <button 
                        className={`color-btn eraser-btn ${color === 'eraser' ? 'active' : ''}`}
                        onClick={() => setColor('eraser')}
                        title="Eraser"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"></path>
                            <path d="M22 21H7"></path>
                            <path d="m5 11 9 9"></path>
                        </svg>
                    </button>
                </div>
                <div className="canvas-sizes">
                    {[2, 4, 8].map(size => (
                        <button 
                            key={size}
                            className={`size-btn ${brushSize === size ? 'active' : ''}`}
                            onClick={() => setBrushSize(size)}
                        >
                            <div style={{ width: size + 2, height: size + 2, backgroundColor: '#fff', borderRadius: '50%' }} />
                        </button>
                    ))}
                </div>
                <button 
                    className="clear-canvas-btn"
                    onClick={clearCanvas}
                    title="Clear Canvas"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
            <canvas
                ref={canvasRef}
                className="live-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
        </div>
    );
}
