import { CELL_AMOUNT } from "@/pages/maze";
import Graph from "../graphs/Graph";

export default class Maze extends Graph {
    currentCell = null;
    path = [];
    
    currentCellMinPath = 0;

    getCell(x, y) {
        let cell = null;
        this.vertices.forEach(vertex => {
            if (JSON.stringify(vertex.getValue()) === JSON.stringify({x, y})) {
                cell = vertex;
            }
        })
        return cell;
    }

    getCurrentCell() {
        return this.path[this.path.length - 1];
    }

    setCurrentCell(x, y, isStart = false) {
        this.currentCell = this.getCell(x, y);
        this.currentCell.setIsStart(isStart);
        this.currentCell.setIsCurrentCell(true);
        this.path.push(this.currentCell);
    }

    removeWalls(newCell, previousCell) {
        const x = newCell.getValue().x;
        const y = newCell.getValue().y;
        const prevX = previousCell.getValue().x;
        const prevY = previousCell.getValue().y;
        if (x > prevX) {
            previousCell.deleteRightWall();
            newCell.deleteLeftWall();
        } else if (x < prevX) {
            previousCell.deleteLeftWall();
            newCell.deleteRightWall();
        }
        if (y > prevY) {
            previousCell.deleteBottomWall();
            newCell.deleteTopWall();
        } else if (y < prevY) {
            previousCell.deleteTopWall();
            newCell.deleteBottomWall();
        }
    }

    removeUnnecesaryEdge({x, y}, vertex, vertexValue) {
        const edgeToRemove = this.getCell(x, y);
        if (edgeToRemove) {
            edgeToRemove.removeEdge(vertexValue);
            vertex.removeEdge({x, y});
        }
    }

    removeUnnecesaryEdges() {
        this.vertices.forEach(vertex => {
            const vertexValue = {x: vertex.getRow(), y: vertex.getCol()};
            if (vertex.topWall && vertex.row !== 0) {
                this.removeUnnecesaryEdge({x: vertex.getRow(), y: vertex.getCol() - 1}, vertex, vertexValue);
            }
            if (vertex.bottomWall && vertex.row !== CELL_AMOUNT) {
                this.removeUnnecesaryEdge({x: vertex.getRow(), y: vertex.getCol() + 1}, vertex, vertexValue);
            }
            if (vertex.leftWall && vertex.col !== 0) {
                this.removeUnnecesaryEdge({x: vertex.getRow() - 1, y: vertex.getCol()}, vertex, vertexValue);
            }
            if (vertex.rightWall && vertex.row !== CELL_AMOUNT) {
                this.removeUnnecesaryEdge({x: vertex.getRow() + 1, y: vertex.getCol()}, vertex, vertexValue);
            }
        });
    }

    setEnd() {
        this.getCell(CELL_AMOUNT - 1, CELL_AMOUNT -1).setIsEnd();
    }

    create() {
        const previousCell = this.getCurrentCell();
        if (!previousCell) {
            this.currentCell.setIsCurrentCell(false);
            this.setEnd();
            return true
        }
        const newCell = previousCell.getRandomEdge();
        if (newCell) {
            this.removeWalls(newCell, previousCell)
            this.path.push(newCell);
        } else {
            this.path.pop();
            return this.create();
        }
        this.currentCell.setFilled(true);
        this.currentCell.setIsCurrentCell(false);
        this.currentCell = newCell;
        this.currentCell.setIsCurrentCell(true);
        return false;
    }

    move() {
        const currentCellToFill = this.minimumPath[this.currentCellMinPath]
        if (currentCellToFill) {
            currentCellToFill.moved = true;
            this.currentCellMinPath++;
        }
    }
}