import P5Container from "@/components/P5Container";
import useWindowSize from "@/hooks/useWindowSize";

const BALLS_AMOUNT = 100;
const BALL_DIAMETER = 40;

const MAX_VELOCITY = 10;
const MAX_ACELERATION = 0.01;

const COLLISION = true;

const MOUSE_ATTRACTION = false;

export default () => {
    const balls = [];

    const { width, height } = useWindowSize();

    const randomColor = (p5) => {
        return p5.color(p5.random(255), p5.random(255), p5.random(255));
    };

    const setup = (p5) => {
        for (let i = 0; i < BALLS_AMOUNT; i++) {
            const color = randomColor(p5);
            const position = p5.createVector(
                Math.random() * width,
                Math.random() * height
            );
            const velocity = p5.createVector(0, 0);
            const aceleration = p5.createVector(
                Math.random() * MAX_ACELERATION,
                Math.random() * MAX_ACELERATION
            );
            balls.push(
                new Ball(position, velocity, aceleration, BALL_DIAMETER, color)
            );
        }
    };

    const draw = (p5) => {
        p5.background(0);

        balls.forEach((ball) => {
            ball.update(p5, width, height, balls);
            ball.draw(p5);
        });
    };

    return <P5Container setup={setup} draw={draw} />;
};

class Ball {
    constructor(position, velocity, aceleration, diameter, color) {
        this.position = position;
        this.velocity = velocity;
        this.aceleration = aceleration;
        this.diameter = diameter;
        this.radius = diameter / 2;
        this.color = color;
        this.collision = false;
    }

    draw(p5) {
        p5.noStroke();
        p5.fill(this.color);
        p5.circle(this.position.x, this.position.y, this.diameter);
    }

    update(p5, width, height, balls) {
        COLLISION && this.checkColisionWithBalls(p5, balls);
        this.checkColisionWithWalls(width, height);
        MOUSE_ATTRACTION && this.goToMouse(p5);
        this.velocity.add(this.aceleration);
        if (this.velocity.mag() > MAX_VELOCITY) {
            this.velocity.setMag(MAX_VELOCITY);
        }
        this.position.add(this.velocity);
    }

    goToMouse(p5) {
        const magnitude = this.aceleration.mag();
        this.aceleration = p5.createVector(
            p5.mouseX - this.position.x,
            p5.mouseY - this.position.y
        );
        this.aceleration.setMag(magnitude);
    }

    checkColisionWithWalls(width, height) {
        if (
            (this.position.x + this.radius > width && this.velocity.x > 0) ||
            (this.position.x - this.radius < 0 && this.velocity.x < 0)
        ) {
            this.velocity.x *= -1;
            this.aceleration.x *= -1;
        }
        if (
            (this.position.y + this.radius > height && this.velocity.y > 0) ||
            (this.position.y - this.radius < 0 && this.velocity.y < 0)
        ) {
            this.velocity.y *= -1;
            this.aceleration.y *= -1;
        }
    }

    // FIXME not applying forces correctly
    checkColisionWithBalls(p5, balls) {
        balls.forEach((ball) => {
            if (
                ball !== this &&
                !ball.collision &&
                !this.collision &&
                p5.dist(
                    ball.position.x,
                    ball.position.y,
                    this.position.x,
                    this.position.y
                ) < this.diameter
            ) {
                //const auxAceleration = ball.aceleration.copy();
                //ball.aceleration = this.aceleration.copy();
                //this.aceleration = auxAceleration;
                const auxVelocity = ball.velocity.copy();
                ball.velocity = this.velocity.copy();
                this.velocity = auxVelocity;
                this.collision = true;
                ball.collision = true;
            }
        });
        balls.forEach((ball) => (ball.collision = false));
    }
}
