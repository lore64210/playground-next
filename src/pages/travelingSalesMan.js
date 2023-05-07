import P5Container from "@/components/P5Container"
import useWindowSize from "@/hooks/useWindowSize";
import { useRef } from "react";

const NODES_AMOUNT = 15;
const NODE_SIZE = 10;

export default () => {
    let nodes = useRef([]).current;
    let bestPath = useRef([]).current;
    let shortestDistance = useRef().current;

    let orderedNodes = useRef([]).current;
    let order = useRef([]).current;
    let orderedBestPath = useRef([]).current;
    let orderedShortestDistance = useRef().current;
    const { width, height } = useWindowSize();

    const getShortestDistance = (p5) => {
        let distance = 0;
        for (let i = 0; i < nodes.length - 1; i++) {
            distance += p5.dist(nodes[i].x, nodes[i].y, nodes[i + 1].x, nodes[i + 1].y);
        }
        if (!shortestDistance || shortestDistance > distance) {
            shortestDistance = distance;
            bestPath = [...nodes];

        }
    }

    const getShortestDistanceForOrderedNodes = (p5) => {
        let distance = 0;
        for (let i = 0; i < order.length - 1; i++) {
            const index = order[i];
            const next = order[i + 1];
                distance += p5.dist(orderedNodes[index].x, orderedNodes[index].y, orderedNodes[next].x, orderedNodes[next].y);
        }
        if (!orderedShortestDistance || orderedShortestDistance > distance) {
            orderedShortestDistance = distance;
            orderedBestPath = [...order];
        }
    }

    const shuffle = () => {
        for (let i = 0; i < nodes.length - 1; i++) {
            const index = Math.ceil(Math.random(nodes.length - 1) * nodes.length - 1);
            const temp = nodes[i]
            nodes[i] = nodes[index];
            nodes[index] = temp;
        }
    }

    const lexicographicOrder = () => {
        let larguestX = null;
        let larguestY = null;
        for (let i = 0; i < order.length - 1;i++ ) {
            if (order[i] < order[i + 1]) {
                larguestX = i
            }
        }
        if (larguestX !== null && larguestX >= 0) {
            for (let i = 0; i < order.length; i++) {
                if (i > larguestX && order[i] > order[larguestX]) {
                    larguestY = i;
                }
            }
            if (larguestY !== null && larguestY >= 0) {
                const aux = order[larguestX];
                order[larguestX] = order[larguestY];
                order[larguestY] = aux;
                const rest = order.splice(larguestX + 1);
                rest.reverse();
                order = [...order, ...rest];
            }
        }
    }
    
    const setup = (p5) => {
        nodes = Array.from(Array(NODES_AMOUNT).keys()).map(() => p5.createVector(p5.random(width / 2), p5.random(height / 2)));
        orderedNodes = [...nodes]
        orderedNodes.forEach((val, index) => order.push(index));
        getShortestDistance(p5);
        getShortestDistanceForOrderedNodes(p5);
    }

    const draw = (p5) => {
        //p5.frameRate(1)
        p5.background("black");
        p5.fill("orange");
        p5.noStroke();
        nodes.forEach(node => {
            p5.ellipse(node.x, node.y, NODE_SIZE, NODE_SIZE);
        });
        
        p5.stroke("orange");
        p5.strokeWeight(3);
        p5.noFill();
        p5.beginShape();
        bestPath.forEach(node => {
            p5.vertex(node.x, node.y);
        });
        p5.endShape();

        p5.translate(width / 2, 0)
        p5.fill("white");
        p5.noStroke();
        nodes.forEach(node => {
            p5.ellipse(node.x, node.y, NODE_SIZE / 2, NODE_SIZE / 2);
        });
        p5.stroke("white");
        p5.strokeWeight(1);
        p5.noFill();
        p5.beginShape();
        nodes.forEach(node => {
            p5.vertex(node.x, node.y);
        });
        p5.endShape();

        p5.translate(- width / 2, height / 2);
        p5.fill("green");
        p5.noStroke();
        orderedNodes.forEach(node => {
            p5.ellipse(node.x, node.y, NODE_SIZE, NODE_SIZE);
        });
        p5.stroke("green");
        p5.strokeWeight(3);
        p5.noFill();
        p5.beginShape();
        orderedBestPath.forEach(node => {
            p5.vertex(orderedNodes[node].x, orderedNodes[node].y);
        });
        p5.endShape();

        p5.translate(width / 2, 0);
        p5.stroke("white");
        p5.fill("white")
        p5.strokeWeight(1);
        orderedNodes.forEach(node => {
            p5.ellipse(node.x, node.y, NODE_SIZE / 2, NODE_SIZE / 2);
        });
        p5.noFill();
        p5.beginShape();
        order.forEach(node => {
            p5.vertex(orderedNodes[node].x, orderedNodes[node].y);
        });
        p5.endShape();
        
        shuffle();
        lexicographicOrder();
        getShortestDistance(p5);
        getShortestDistanceForOrderedNodes(p5);
    }
    return <P5Container draw={draw} setup={setup}/>
}