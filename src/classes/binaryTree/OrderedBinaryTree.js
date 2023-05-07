import BinaryTreeNode from "./BinaryNode";

export default class OrderedBinaryTree {
    
    root = null

    constructor(rootValue, rootPosition) {
        if (rootValue) {
            this.root = new BinaryTreeNode(rootValue, rootPosition);
        }
    }

    exists(value) {
       return this._exists(value, this.root);
    }

    traverse(applyFunction) {
        this._traverseTree(this.root, applyFunction);
    }

    addValue(newValue) {
        this._addValue(newValue, this.root, this.root.getPosition());
    }

    _exists(value, currentNode) {
        if (currentNode) {
            const currentValue = currentNode.getValue();
            if (value === currentValue) {
                return true;
            } else if (value < currentValue) {
                return this._exists(value, currentNode.getLeft());
            } else {
                return this._exists(value, currentNode.getRight());
            }
        } 
    }

    _traverseTree(currentNode, applyFunction) {
        if (currentNode) {
            this._traverseTree(currentNode.getLeft(), applyFunction);
            applyFunction?.(currentNode);
            this._traverseTree(currentNode.getRight(), applyFunction);
        }
    }

    _addValue(newValue, node, position) {
        let newNextNode = null;
        if (node.getValue() > newValue) {
            newNextNode = node.getLeft();
            if (!newNextNode) {
                return node.setLeft(newValue, this._getNextNodePosition(node, newValue, position))
            }
        } else {
            newNextNode = node.getRight();
            if (!newNextNode) {
                return node.setRight(newValue, this._getNextNodePosition(node, newValue, position),)
            }
        }
        if (newNextNode) {
            return this._addValue(
                newValue, 
                newNextNode, 
                this._getNextNodePosition(node, newValue, position),
            );    
        }
    }

    _getNextNodePosition(node, newValue, position) {
        const { x, y } = position;
        const size = node.getSize();
        return {
            x: newValue < node.getValue() ? x - size * 4 : x + size * 4, 
            y: y + size * 3,
        };
    }
}