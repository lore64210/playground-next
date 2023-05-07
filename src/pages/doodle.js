import { useCallback, useEffect, useRef, useState } from "react";
import useWindowSize from "@/hooks/useWindowSize";

import styles from "@/styles/doodle.module.css";

export default () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [paths, setPaths] = useState([]);
    const canvasRef = useRef();
    const { width, height } = useWindowSize();

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.strokeStyle = "black";
        context.lineWidth = 5;

        paths.forEach((path) => {
            context.beginPath();
            context.lineCap = "round";
            context.lineJoin = "round";
            context.moveTo(...path[0]);
            path.forEach((point) => {
                context.lineTo(...point);
            });
            context.stroke();
        });
    }, [paths]);

    const getMouseCoords = (event) => {
        const canvas = canvasRef.current;
        const canvasBorders = canvas.getBoundingClientRect();
        return [
            Math.round(event.clientX - canvasBorders.left),
            Math.round(event.clientY - canvasBorders.top),
        ];
    };
    const onMouseDown = useCallback((event) => {
        const mouseCoords = getMouseCoords(event);
        setPaths((paths) => [...paths, [mouseCoords]]);
        setIsDrawing(true);
    }, []);

    const onMouseUp = useCallback(() => {
        setIsDrawing(false);
    }, []);

    const onMouseMove = useCallback(
        (event) => {
            if (isDrawing) {
                const mouseCoords = getMouseCoords(event);
                setPaths((paths) => [
                    ...paths,
                    [...paths[paths.length - 1], mouseCoords],
                ]);
            }
        },
        [isDrawing]
    );

    const onClearCanvas = useCallback(() => {
        setPaths([]);
        setIsDrawing(false);
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
    }, []);

    return (
        <div className={styles.canvasContainer}>
            <canvas
                ref={canvasRef}
                className={styles.canvas}
                width={width}
                height={height && height - height / 8}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseUp}
            />
            <button className={styles.clearButton} onClick={onClearCanvas}>
                clear
            </button>
        </div>
    );
};
