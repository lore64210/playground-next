import { CELL_AMOUNT } from "@/pages/maze";
import GraphNode from "../graphs/GraphNode";

export default class Cell extends GraphNode {
    row = 0;
    col = 0;
    cellSize = CELL_AMOUNT;
    topWall = true;
    bottomWall = true;
    rightWall = true;
    leftWall = true;
    currentCell = false;
    isStart = false;
    isEnd = false;
    filled = false;
    moved = false;
    isObstacle = false;
    
    constructor(row, col, cellSize) {
        super({x: row, y: col});
        this.row = row;
        this.col = col;
        this.positionX = row * cellSize;
        this.positionY = col * cellSize;
        this.cellSize = cellSize;
    }

    setIsObstacle(isObstacle) {
        this.isObstacle = isObstacle
    }

    setIsStart(isStart) {
        this.isStart = isStart;
    }

    setIsEnd() {
        this.isEnd = true;
    }

    getCol() {
        return this.col;
    }

    getRow() {
        return this.row;
    }

    getRandomEdge() {
        const filteredEdges = this.edges.filter(edge => !edge.node.getFilled())
        return filteredEdges[Math.floor(Math.random() * (filteredEdges.length))]?.node;
    }

    setIsCurrentCell(isCurrentCell) {
        this.isCurrentCell = isCurrentCell
    }

    deleteTopWall() {
        this.topWall = false;
    }
    deleteBottomWall() {
        this.bottomWall = false;
    }
    deleteLeftWall() {
        this.leftWall = false;
    }
    deleteRightWall() {
        this.rightWall = false;
    }

    getFilled() {
        return this.filled;
    }

    setFilled(filled) {
        this.filled = filled;
    }
}