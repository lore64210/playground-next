export default class Perceptron {
    weights = [];
    learningRate = 0.1;

    constructor(inputAmount) {
        for (let i = 0; i < inputAmount; i++) {
            this.weights.push(Math.random());
        }
        this.weights.push(Math.random()); // extra weight for bias
    }

    feedForward(inputs) {
        if (inputs.length === this.wheights.length) {
            let sum = 0;
            inputs.forEach((input, index) => {
                sum += input * this.weights[index];
            });
            // activation function
            return sum >= 0 ? 1 : -1;
        }
    }

    train(inputs, target) {
        if (inputs.length === this.wheights.length) {
            inputs.push(1); // for bias
            const output = this.feedForward(inputs);
            const error = target - output;
            this.weights.forEach((_, index) => {
                weights[index] += error * inputs[index] * this.learningRate;
            });
        }
    }
}
