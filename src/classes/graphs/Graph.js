import GraphNode from "./GraphNode";

export default class Graph {
     vertices = [];
     isDirectional = false;
     isWeighted = false;

     minimumPath = [];
    

     constructor(isDirectional, isWeighted) {
        this.isDirectional = !!isDirectional;
        this.isWeighted = !!isWeighted;
     }

    setMinimumPath(minimumPath) {
        this.minimumPath = minimumPath;
    }
     getVertices() {
        return this.vertices;
     }

     addVertex(value) {
        const isNode = value instanceof GraphNode;
        this.vertices = [...this.vertices, isNode ? value : new GraphNode(value)]
     }

     removeVertex(value) {
        this.vertices = this.vertices.filter(vertex => vertex.getValue() !== value);
        this.vertices.forEach(vertex => {
            vertex.removeEdge(value)
        })
     }

     addEdge(source, destination, weight = 1) {
        let sourceNode = null;
        let destinationNode = null;
        this.vertices.forEach(vertex => {
            if (vertex.getValue() === source) {
                sourceNode = vertex;
            } else if (vertex.getValue() === destination) {
                destinationNode = vertex;
            }
        })
        if (sourceNode && destinationNode) {
            const edgeWeight = this.isWeighted ? weight : 1;
            sourceNode.addEdge(destinationNode, edgeWeight);
            !this.isDirectional && destinationNode.addEdge(sourceNode, edgeWeight);
        }
     }

     _resetVertices() {
        this.vertices.forEach(vertex => {
            vertex.setSearched(false);
            vertex.setDistance(null);
        });
     }

     // NOT WORKING PROPERLY
     depthFirstSearch(searchedValue) {
        const start = this.vertices[0];
        const found = this._depthFirstSearch(searchedValue, start);
        this._resetVertices();
        return found;
    }

     _depthFirstSearch(searchedValue, currentNode) {
        if (JSON.stringify(currentNode.getValue()) === JSON.stringify(searchedValue)) {
            return currentNode;
        }
        currentNode.setSearched(true);
        let found = null;
        currentNode.getEdges().forEach(edge => {
            if (!edge.node.getSearched()) {
                found = this._depthFirstSearch(searchedValue, edge.node);
            }
        })
        return found;
     }

     breadthFirstSearch(searchedValue) {
        let queue = [this.vertices[0]];
        let found = null;
        while(!found && queue.length) {
            const vertex = queue.shift();
            const value = vertex.getValue();
            vertex.setSearched(true);
            const newEdges = vertex.getEdges().filter(edge => !edge.node.getSearched());
            if (JSON.stringify(searchedValue) === JSON.stringify(value)) {
                found = vertex;
                break;
            } else {
                queue = [...queue, ...newEdges.map(edge => edge.node)];
            }
        }
        this._resetVertices();
        return found; 
     }

     findMinimumPath(searchedValue) {
        //this.dijkstra(searchedValue);
        const searchedNode = this.breadthFirstSearch(searchedValue);
        this._resetVertices();
        this.aStarSearch(searchedNode);
    }

     findPath(searchedValue) {
        let queue = [this.vertices[0]];
        let found = false;
        while(!found) {
            const vertex = queue[queue.length - 1];
            const value = vertex.getValue();
            
            vertex.setSearched(true);

            if (JSON.stringify(searchedValue) === JSON.stringify(value)) {
                found = true;
            } else {
                const newEdges = vertex.getEdges().filter(edge => !edge.node.getSearched());
                if (newEdges.length > 0) {
                    queue.push(newEdges[0].node);
                } else {
                    queue.pop();
                }
            }
        }
        this._resetVertices();
        return queue;
     }

     dijkstra(searchedValue) {
        const currentNode = this.vertices[0];
        currentNode.setDistance(0);
        const distance = 0;
        this._dijkstra(searchedValue, distance, [currentNode]);
        this._resetVertices();
    }

     _dijkstra(searchedValue, distance, path) {
        const currentNode = path[path.length - 1];
        currentNode.setSearched(true);
        if (!currentNode.getDistance()) {
            currentNode.setDistance(distance);
        }
        if (JSON.stringify(currentNode.getValue()) === JSON.stringify(searchedValue)) {
            return { distance, path };
        }
        
        let result = null;
        currentNode.getEdges()
            .filter(({node}) => !node.getSearched())
            .sort((a, b) => a.weight - b.weight)
            .forEach(({node, weight}) => {
                if (!result || result.distance >= distance + weight) {
                    result = this._dijkstra(searchedValue, distance + weight, [...path, node]);
                }
                if (result) {
                    this.setMinimumPath(result.path);
                }
            });
        return result;
    }

    heuristic(a, b) {
        // diagonal distance
        const x = b.getPositionX() - a.getPositionX();
        const y = b.getPositionY() - a.getPositionY();
        return Math.ceil(Math.sqrt(x * x + y * y) / 10);
    }

    aStarSearch(searchedNode) {
        let index = 0;
        
        const start = this.vertices[index]
        start.distance = 0;
        start.heuristic = this.heuristic(start, searchedNode);
        
        const openSet = [start];
        const closedSet = [];
        
        let found = false;
        let winner = 0;

        while (!found && openSet.length) {
            const current = openSet[winner];

            // f(n) = g(n) + h(n)
            // h = heuristic, educated guess
            // g = actual cost from begining to current
            if (openSet[index].distance + openSet[index].heuristic < current.distance + current.heuristic) {
                winner = index;
            }
            
            if (current === searchedNode) {
                found = true;
                let temp = current;
                this.minimumPath = [];
                while (temp.previousNode) {
                    this.minimumPath = [temp.previousNode, ...this.minimumPath];
                    temp = temp.previousNode;
                }
                break;
            }
            
            openSet.splice(index, 1);
            closedSet.push(current);
            current.getEdges()
                .forEach(({ node, weight }) => {
                    if (!closedSet.includes(node)) {
                        const distance = current.distance + weight;
                        if (!openSet.includes(node)) {
                            node.distance = distance;
                            openSet.push(node);
                        } else if (!node.distance || distance < node.distance) {
                            node.distance = distance;
                        }
                        node.heuristic = this.heuristic(node, searchedNode);
                        node.previousNode = current;
                    }
                });
             
        }
     }


     *aStarSearchGenerator(searchedNode) {
        // f(n) = g(n) + h(n)
        // h = heuristic, educated guess
        // g = actual cost from begining to current

        const start = this.vertices[0]
        start.distance = 0;
        start.heuristic = this.heuristic(start, searchedNode);
        
        let openSet = [start];
        const closedSet = [];
        
        let found = false;
        yield;
        while (!found && openSet.length) {
            openSet = openSet.sort((a,b) => (a.distance + a.heuristic) - (b.distance + b.heuristic))
            const current = openSet[0];
            current.currentCell = true
            if (current === searchedNode) {
                found = true;
                break;
            }
            
            openSet.splice(0, 1);
            closedSet.push(current);
            current.getEdges()
                .forEach(({ node, weight }) => {
                    if (!node.isObstacle && !closedSet.includes(node)) {
                        const distance = current.distance + weight;
                        node.heuristic = this.heuristic(node, searchedNode);
                        if (!openSet.includes(node)) {
                            node.setDistance(distance);
                            openSet.push(node);

                        } else if (!node.distance || distance < node.distance) {
                            node.setDistance(distance);
                        }
                        node.searched = true
                    }
                });
                yield;
        }
     }
     // floyd alg
     // prim alg
}