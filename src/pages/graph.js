import { useEffect } from "react";
import P5Container from "@/components/P5Container";
import Graph from "@/classes/graphs/Graph";

const GraphPage = () => {
   
    useEffect(() => {
        const graph = new Graph(true, true);
        graph.addVertex(1)
        graph.addVertex(2)
        graph.addVertex(3)
        graph.addVertex(4)
        graph.addVertex(5)

        graph.addEdge(1, 2, 3)
        graph.addEdge(2, 3, 2)
        graph.addEdge(1, 4, 5)
        graph.addEdge(2, 3, 2)
        graph.addEdge(3, 5, 6)
        graph.addEdge(4, 3, 1)
        graph.addEdge(4, 5, 3)

        const result = graph.dijkstra(5);
        console.log(result)
    }, [])

    return <P5Container />
}

export default GraphPage;