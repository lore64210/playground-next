import P5Container from "@/components/P5Container"
import useWindowSize from "@/hooks/useWindowSize";
import { useRef } from "react"

const POINTS_AMOUNT = 100;
const POINT_SIZE = 10;

const USE_RANDOM_POINTS = true;

const GRADIENT_DESCENT_LEARNING_RATE = 0.001;

export default () => {
    let points = useRef([]).current;
    let m = useRef(0).current;  // stored globally for gradient descent
    let b = useRef(0).current;  // stored globally for gradient descent

    const { width, height } = useWindowSize();

    const setup = (p5) => {
        if (USE_RANDOM_POINTS) {
            for(let i = 0; i < POINTS_AMOUNT; i++) {
                points[i] = p5.createVector(Math.random() * width, Math.random() * height);
            }
        }
    }

    const draw = (p5) => {
        p5.background(0);
        p5.translate(0, height)
        p5.scale(1, -1)
        p5.fill(255);
        p5.noStroke()
        points.forEach(point => {
            p5.ellipse(point.x, point.y, POINT_SIZE);
        })
        const [m1, b1] = leastSquaresLinearReggression()
        drawLine(p5, m1, b1, "green");

        const [m2, b2] = gradientDescentLinearReggression(p5)
        drawLine(p5, m2, b2, "orange");
    }

    const drawLine = (p5, m, b, color) => {
        const x1 = 0;
        const x2 = width;
        const y1 = m * x1 + b;
        const y2 = m * x2 + b;
        p5.stroke(color);
        p5.line(x1, y1, x2, y2);
    }

    const leastSquaresLinearReggression = () => {
        const sum = points.reduce((acc, point) => ({
            x: acc.x + point.x,
            y: acc.y + point.y,
        }), {x: 0, y: 0});
        const xAverage = sum.x / points.length;
        const yAverage = sum.y / points.length;
        
        const {numerator, denominator} = points.reduce((acc, point) => {
            const numerator = (point.x - xAverage) * (point.y - yAverage);
            const denominator = point.x ** 2 - 2 * point.x * xAverage + xAverage ** 2;
            return {numerator: acc.numerator + numerator, denominator: acc.denominator + denominator}
        }, {numerator: 0, denominator: 0})
        
        const m = denominator === 0 ? 0 : numerator / denominator;
        const b = yAverage - m * xAverage;
        return [m, b]
    }

    const gradientDescentLinearReggression = (p5) => {
        points.forEach(point => {
            const x = p5.map(point.x, 0, height, 0, 1);
            const y = p5.map(point.y, 0, height, 0, 1);
            const guess = m * x + b;
            const error = y - guess;
            m += (error * x * GRADIENT_DESCENT_LEARNING_RATE);
            b += (error * GRADIENT_DESCENT_LEARNING_RATE);
        })
        return [m, b * height];
    }

    const mouseClicked = (p5, evt) => {
        points.push(p5.createVector(evt.clientX, height - evt.clientY));
    }
    
    return <P5Container setup={setup} draw={draw} mouseClicked={mouseClicked}/>
}