import Matrix from "./Matrix";

const sigmoid = (x) => 1 / (1 + Math.exp(-x));

const sigmoidDerivative = (y) => {
    // sigmoid(x) * (1 - sigmoid(x))
    return y * (1 - y); // sigmoid already applied
};

export default class NeuralNetwork {
    learningRate = 1;
    constructor(inputAmount = 1, hiddenLayers = [1], outputAmount = 1) {
        this.inputAmount = inputAmount;
        this.outputAmount = outputAmount;
        this.hiddenLayers = hiddenLayers;
        this.weights = [];
        this.bias = [];
        let prevLayer = inputAmount;
        hiddenLayers.forEach((layer) => {
            this._addWeight(layer, prevLayer);
            prevLayer = layer;
        });
        // wheights between last hidden layer and output layer
        this._addWeight(outputAmount, prevLayer);
    }

    _addWeight(layer, prevLayer) {
        const newWeight = new Matrix(layer, prevLayer);
        newWeight.randomize(0, 1);
        this.weights.push(newWeight);
        // for each layer, add a bias
        this.bias.push(new Matrix(layer, 1));
    }

    feedForward(inputs, training = false) {
        let currentValues = Matrix.arrayToMatrix(inputs);
        const trainingResults = [currentValues];
        for (let i = 0; i < this.weights.length; i++) {
            currentValues = Matrix.multiply(this.weights[i], currentValues);
            currentValues = Matrix.add(currentValues, this.bias[i]);
            currentValues.map(sigmoid);
            trainingResults.push(currentValues);
        }
        return training
            ? { trainingResults, outputs: currentValues }
            : Matrix.matrixToArray(currentValues);
    }

    backPropagation(inputs, targets) {
        const { outputs, trainingResults } = this.feedForward(inputs, true);
        const targetsMatrix = Matrix.arrayToMatrix(targets);

        const outputErrors = Matrix.substract(targetsMatrix, outputs);
        let currentErrors = outputErrors;
        for (let i = this.weights.length - 1; i >= 0; i--) {
            let currentLayer = trainingResults[i + 1];
            let previousLayer = trainingResults[i];

            const gradients = Matrix.map(currentLayer, sigmoidDerivative);
            const deltasForBias = Matrix.scalarMultiplication(
                Matrix.multiplyElementWise(gradients, currentErrors),
                this.learningRate
            );
            const previousLayerTransposed = Matrix.transpose(previousLayer);
            const deltas = Matrix.multiply(
                deltasForBias,
                previousLayerTransposed
            );
            const weightsTransposed = Matrix.transpose(this.weights[i]);
            currentErrors = Matrix.multiply(weightsTransposed, currentErrors);
            this.weights[i] = Matrix.add(this.weights[i], deltas);
            this.bias[i] = Matrix.add(this.bias[i], deltasForBias);
        }
    }
}
