import P5Container from "@/components/P5Container";
import useWindowSize from "@/hooks/useWindowSize";
import { useRef } from "react";

const scale = 10;

const TerrainPage = () => {
    const windowSize = useWindowSize();
    const flying = useRef(0);
    const terrainRef = useRef();

    const canvasSize = 1000;
    const rows = canvasSize / scale;
    const cols = rows;

    const setup = (p5, canvasRef) => {
        p5.createCanvas(windowSize.width, windowSize.height, p5.WEBGL).parent(
            canvasRef
        );

        const terrain = new Array(rows);
        for (let i = 0; i < terrain.length; i++) {
            terrain[i] = new Array(rows);
        }
        terrainRef.current = terrain;
    };

    const draw = (p5) => {
        p5.background(0);
        p5.stroke(255);

        p5.noFill();
        p5.translate(-windowSize.width / 2, -windowSize.height / 2);
        p5.rotateX(p5.PI / 4.0);
        //p5.translate(-windowSize.width * 1.25, -windowSize.height * 5, -500);
        p5.translate(windowSize.width / 5, -windowSize.height / 2, -50);
        flying.current -= 0.01;
        let yoff = flying.current;
        for (let y = 0; y < cols; y++) {
            let xoff = 0;
            for (let x = 0; x < rows; x++) {
                terrainRef.current[x][y] = p5.map(
                    p5.noise(xoff, yoff),
                    0,
                    1,
                    -50,
                    50
                );
                xoff += 0.2;
            }
            yoff += 0.1;
        }
        for (let y = 0; y < cols - 1; y++) {
            p5.beginShape(p5.TRIANGLE_STRIP);
            for (let x = 0; x < rows; x++) {
                p5.vertex(x * scale, y * scale, terrainRef.current[x][y]);
                p5.vertex(
                    x * scale,
                    (y + 1) * scale,
                    terrainRef.current[x][y + 1]
                );
            }
            p5.endShape();
        }
    };

    return <P5Container draw={draw} setup={setup} overrideSetup />;
};

export default TerrainPage;
