import { useEffect, useRef } from "react";
import P5Container from "@/components/P5Container";
import OrderedBinaryTree from "@/classes/binaryTree/OrderedBinaryTree";
import useWindowSize from "@/hooks/useWindowSize";

const BinaryTreePage = () => {
   
    const windowSize = useWindowSize();
    let tree = useRef().current;

    useEffect(() => {
        if (windowSize.width && windowSize.height) {
            tree = new OrderedBinaryTree(5, { x: windowSize.width / 2, y: 50 });
            tree.addValue(3);
            tree.addValue(6);
            tree.addValue(1);
            tree.addValue(4);
            tree.addValue(8);
        }
    }, [windowSize])

    const draw = (p5) => {
        p5.background("black");
        p5.fill("white")
        const drawFunction = (node) => {
            const {x, y} = node.getPosition();
            const size = node.getSize();
            const value = node.getValue();
            const leftChild = node.getLeft();
            const rightChild = node.getRight();
            p5.fill("white")
            p5.circle(x - size / 2, y - size / 2, size);
            if (leftChild) {
                p5.stroke(255);
                p5.line(x - size / 2, y - size / 2, leftChild.getPosition().x - size / 2, leftChild.getPosition().y - size / 2);
            }
            if (rightChild) {
                p5.stroke(255);
                p5.line(x - size / 2, y - size / 2, rightChild.getPosition().x - size / 2, rightChild.getPosition().y - size / 2);
            }
            p5.fill("black")
            p5.text(value, x - size / 2 - 3, y - size / 2 + 3);
        }
        tree.traverse(drawFunction); 
    }

    return <P5Container draw={draw} />
}

export default BinaryTreePage;