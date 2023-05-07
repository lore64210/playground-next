import { useCallback, useMemo, useState } from 'react';
import P5Container from "@/components/P5Container";
import useWindowSize from '@/hooks/useWindowSize';
import Maze from '@/classes/maze/Maze';
import Cell from '@/classes/maze/MazeCell';

export const CELL_AMOUNT = 20; // max 50, otherwise is to heavy to compute

// REFACTOR, some calculations are way to expensive,

const MazePage = () => {

    const maze = useMemo(() => new Maze(true), []);
    const windowSize = useWindowSize();
    const cellSize = windowSize.height / CELL_AMOUNT;
    const [finished, setFinished] = useState(false);

    const show = (p5, cell) => {
        if (cell.filled) {
            p5.fill("black");
        } else {
            p5.fill("white");
        }
        if (cell.isCurrentCell || cell.isEnd || cell.moved) {
            p5.fill("orange");
        }
        if (cell.isStart) {
            p5.fill("green");
        }
        if (cell.searched) {
            p5.fill("red")
        }
        p5.noStroke();
        p5.rect(cell.positionX, cell.positionY, cell.cellSize, cell.cellSize);
        
        p5.stroke(255);
        if (cell.topWall) {
            p5.line(cell.positionX, cell.positionY, cell.positionX + cell.cellSize, cell.positionY);
        }
        if (cell.bottomWall) {
            p5.line(cell.positionX, cell.positionY + cell.cellSize, cell.positionX + cell.cellSize, cell.positionY + cell.cellSize);
        }
        if (cell.rightWall) {
            p5.line(cell.positionX + cell.cellSize, cell.positionY, cell.positionX + cell.cellSize, cell.positionY + cell.cellSize);
        }
        if (cell.leftWall) {
            p5.line(cell.positionX, cell.positionY, cell.positionX, cell.positionY + cell.cellSize);
        }
    }

    const connectCells = () => {
        maze.getVertices().forEach(cell => {
            const x = cell.getRow();
            const y = cell.getCol();
            if(x !== 0) {
                cell.addEdge(maze.getCell(x - 1, y));
            }
            if (x !== CELL_AMOUNT -1) {
                cell.addEdge(maze.getCell(x + 1, y));
            }
            if (y !== 0) {
                cell.addEdge(maze.getCell(x, y - 1));
            }
            if (y !== CELL_AMOUNT - 1) {
                cell.addEdge(maze.getCell(x, y + 1));
            }
        })
    }

    const setup = (p5, canvasRef) => {
        p5.createCanvas(windowSize.width, windowSize.height).parent(canvasRef);
        for(let x = 0; x < CELL_AMOUNT; x++) {
            for(let y = 0; y < CELL_AMOUNT; y++) {
                const cell = new Cell(x, y, cellSize);
                maze.addVertex(cell);
            }
        }
        connectCells();
        maze.setCurrentCell(0, 0, true);
    }

    const onFinish = useCallback(() => {
        maze.removeUnnecesaryEdges();
        maze.findMinimumPath({ x: CELL_AMOUNT - 1, y: CELL_AMOUNT - 1 });
        setFinished(true)
    }, [finished, maze])
    
    const draw = (p5) => {
        p5.background(0);
        if(!finished) {
            const mazeComplete = maze.create();
            if (mazeComplete) {
                onFinish();
            }
        } else {
            //p5.frameRate(10);
            maze.move();
        }
        maze.getVertices().forEach(cell => show(p5, cell));
    }

    return <P5Container draw={draw} setup={setup} overrideSetup/>
}

export default MazePage