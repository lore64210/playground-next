export default class BinaryNode {
    
    left = null;
    right = null;
    position = {x: 0, y: 0};
    size = 40;

    constructor(value, position) {
        this.value = value ?? this.value;
        this.position = position ?? this.position;
    }

    getValue() {
        return this.value;
    }

    getPosition() {
        return this.position;
    }

    getSize() {
        return this.size;
    }

    getLeft() {
        return this.left;
    }

    getRight() {
        return this.right;
    }

    setLeft(value, position) {
        this.left = new BinaryNode(value, position);
    }

    setRight(value, position) {
        this.right = new BinaryNode(value, position);
    }

    setPosition(position) {
        this.position = position;
    }

}