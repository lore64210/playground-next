import Matrix from "@/classes/neuralNetworks/Matrix";
import NeuralNetwork from "@/classes/neuralNetworks/NeuralNetwork";
import P5Container from "@/components/P5Container";
import { useRef } from "react";

const validDataset = [
    { value: [0, 0], expected: [0] },
    { value: [1, 1], expected: [0] },
    { value: [0, 1], expected: [1] },
    { value: [1, 0], expected: [1] },
];

const testPage = () => {
    let nn = useRef().current;
    const setup = (p5) => {
        nn = new NeuralNetwork(2, [2], 1);
        for (let i = 0; i < 100000; i++) {
            const data = validDataset[Math.floor(Math.random() * 4)];
            nn.backPropagation(data.value, data.expected);
        }

        console.log(nn.feedForward([0, 0]));
        console.log(nn.feedForward([1, 1]));
        console.log(nn.feedForward([0, 1]));
        console.log(nn.feedForward([1, 0]));
    };

    const draw = (p5) => {
        p5.background("black");
        const index = Math.round(Math.random() * 3);

        //console.log(output1, output2, output3, output4);
    };

    return <P5Container setup={setup} draw={draw} />;
};

export default testPage;
