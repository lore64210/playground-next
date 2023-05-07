export default class GraphNode {
    value = null;
    edges = []; // {node, weight}
    positionX = 0;
    positionY = 0;
    searched = false;
    distance = null;
    heuristic = null;
    previousNode = null;

    constructor(value) {
        this.value = value;
    }

    getPositionX() {
        return this.positionX;
    }

    getPositionY() {
        return this.positionY;
    }


    setDistance(distance) {
        this.distance = distance;
    }

    getDistance() {
        return this.distance;
    }
    
    getValue() {
        return this.value;
    }

    addEdge(node, weight = 1) {
        this.edges = [...this.edges, {node, weight}];
    }

    getEdges() {
        return this.edges;
    }

    removeEdge(value) {
        this.edges = this.edges.filter(edge => JSON.stringify(edge.node.getValue()) !== JSON.stringify(value));
    }

    setSearched(searched) {
        this.searched = searched;
    }

    getSearched() {
        return this.searched;
    }

}