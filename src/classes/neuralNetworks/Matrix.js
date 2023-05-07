export default class Matrix {
    data = [];
    rows = 0;
    cols = 0;
    constructor(rows = 3, cols = 3) {
        this.rows = rows;
        this.cols = cols;
        for (let i = 0; i < rows; i++) {
            this.data[i] = [];
            for (let j = 0; j < cols; j++) {
                this.data[i].push(0);
            }
        }
    }

    randomize(min = 0, max = 10, round) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = round
                    ? Math.round(Math.random() * max - min)
                    : Math.random() * max - min;
            }
        }
    }

    show() {
        console.table(this.data);
    }

    map(func) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = func(this.data[i][j]);
            }
        }
    }

    static map(a, func) {
        const result = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.rows; i++) {
            for (let j = 0; j < a.cols; j++) {
                result.data[i][j] = func(a.data[i][j]);
            }
        }
        return result;
    }

    static add(a, b) {
        if (a.rows !== b.rows || a.cols !== b.cols) {
            console.error("Matrices must be the same size");
            return;
        }
        let result = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.rows; i++) {
            for (let j = 0; j < a.cols; j++) {
                result.data[i][j] = a.data[i][j] + b.data[i][j];
            }
        }
        return result;
    }

    static substract(a, b) {
        if (a.rows !== b.rows || a.cols !== b.cols) {
            console.error("Matrices must be the same size");
            return;
        }
        return Matrix.add(a, Matrix.scalarMultiplication(b, -1));
    }

    static scalarMultiplication(a, scalar) {
        let result = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.rows; i++) {
            for (let j = 0; j < a.cols; j++) {
                result.data[i][j] = a.data[i][j] * scalar;
            }
        }
        return result;
    }

    static multiplyElementWise(a, b) {
        let result = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.rows; i++) {
            for (let j = 0; j < a.cols; j++) {
                result.data[i][j] = a.data[i][j] * b.data[i][j];
            }
        }
        return result;
    }

    static multiply(a, b) {
        if (a.cols !== b.rows) {
            console.error("Invalid sizes");
            return;
        }

        const result = new Matrix(a.rows, b.cols);
        for (let i = 0; i < a.rows; i++) {
            for (let j = 0; j < b.cols; j++) {
                for (let k = 0; k < a.cols; k++) {
                    result.data[i][j] += a.data[i][k] * b.data[k][j];
                }
            }
        }

        return result;
    }

    static arrayToMatrix(arr) {
        const result = new Matrix(arr.length, 1);
        arr.forEach((el, i) => {
            result.data[i][0] = el;
        });
        return result;
    }

    static matrixToArray(matrix) {
        const result = [];
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                result.push(matrix.data[i][j]);
            }
        }
        return result;
    }

    static transpose(matrix) {
        const result = new Matrix(matrix.cols, matrix.rows);
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                result.data[j][i] = matrix.data[i][j];
            }
        }
        return result;
    }
}
