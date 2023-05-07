import P5Container from "@/components/P5Container"
import useWindowSize from "@/hooks/useWindowSize";
import { useRef } from "react"

const CONSUMABLES_AMOUNT = 50;
const CONSUMABLE_GENERATION_RATE = 0.9; // 0 to 1
const VEHICLES_AMOUNT = 20;

const ACCELERATION_RATE = 1 // the bigger the better the behaviours
const MIN_ACCELERATION = 0.0001;
const MAX_VELOCITY = 5;

const CONSUMABLE_VALUE = 150;
const CONSUMABLE_SIZE = 10;
const MAX_LIFE = 1000;
const MIN_LIFE = 50;

const MAX_HUNT_DISTANCE = 500;

const MUTATION_RATE = 0.01;

const POISON_DETECTION_RATE = 0.1;
const MIN_POISON_DETECTION_RATE = 0.5;

const CONSUMABLE_EATEN_SCORE = 200;
const VEHICLE_EATEN_SCORE = 2000;

export default () => {
    let consumables = useRef([]).current;
    let vehicles = useRef([]).current;
    let population = useRef(new Population()).current;
    const {width, height} = useWindowSize();

    const createRandomPosition = (p5) => p5.createVector(p5.random(width), p5.random(height));

    const createConsumable = (p5) => ({...createRandomPosition(p5), poison: Math.random() < 0.4});
    const setup = (p5) => {
        consumables = Array.from(Array(CONSUMABLES_AMOUNT).keys())
            .map(() => createConsumable(p5));

        vehicles = Array.from(Array(VEHICLES_AMOUNT).keys())
            .map(() => {
                const initialPosition = createRandomPosition(p5);
                const initialVelocity = p5.createVector(0, 0);
                const initialAcceleration = p5.createVector(0, 0);
                const color = {r: p5.random(255), g: p5.random(255), b: p5.random(255)};
                const maxVelocity = Math.random() * MAX_VELOCITY;
                const eatAccelerationRate = Math.random() * ACCELERATION_RATE + MIN_ACCELERATION;
                const escapeAccelerationRate = Math.random() * ACCELERATION_RATE + MIN_ACCELERATION;
                const huntRadius = Math.random() * MAX_HUNT_DISTANCE;
                const poisonDetectionRate = Math.random() + POISON_DETECTION_RATE;
                const initialLife = Math.random() * MAX_LIFE + MIN_LIFE;
                return new Vehicle(
                    initialPosition,
                    initialVelocity,
                    initialAcceleration,
                    color,
                    maxVelocity,
                    eatAccelerationRate,
                    escapeAccelerationRate,
                    huntRadius,
                    poisonDetectionRate, 
                    initialLife
                );
            });
        population.genotype = [...vehicles];
        population.matingPool = [...vehicles];
    }

    const draw = (p5) => {

        if (vehicles.length <= 1) {
            vehicles = population.regeneratePopulation(() => createRandomPosition(p5));
        }
        p5.background(0);
        p5.noStroke();
        consumables.forEach((consumable) => {
            p5.fill(consumable.poison ? "red": "green");
            p5.ellipse(consumable.x, consumable.y, CONSUMABLE_SIZE);
        });

        if (consumables.length < CONSUMABLES_AMOUNT && Math.random() < CONSUMABLE_GENERATION_RATE) {
            consumables.push(createConsumable(p5))
        }

        vehicles = vehicles.filter(({life}) => life >= MIN_LIFE)

        vehicles.forEach(vehicle => {
            p5.stroke(vehicle.color.r, vehicle.color.g, vehicle.color.b)
            p5.fill(vehicle.color.r, vehicle.color.g, vehicle.color.b);
            p5.ellipse(vehicle.position.x, vehicle.position.y, vehicle.getSize());
            
            vehicle.live(p5, consumables, vehicles, width, height);
        })
    }
    return <P5Container setup={setup} draw={draw} />
}

class Vehicle {
    constructor(
        initialPosition,
        initialVelocity,
        initialAcceleration,
        color,
        maxVelocity,
        eatAccelerationRate, 
        escapeAccelerationRate,
        huntRadius,
        poisonDetectionRate,
        life,
    ) {
        this.position = initialPosition;
        this.velocity = initialVelocity;
        this.acceleration = initialAcceleration;
        this.initialPosition = initialPosition;
        this.initialVelocity = initialVelocity;
        this.initialAcceleration = initialAcceleration;
        this.color = color;
        this.fitness = 0;
        this.eatAccelerationRate = eatAccelerationRate;
        this.escapeAccelerationRate = escapeAccelerationRate;
        this.poisonDetectionRate = poisonDetectionRate;
        this.huntRadius = huntRadius;
        this.maxVelocity = maxVelocity;
        this.initialLife = life;
        this.life = life;
    }

    live(p5, consumables, vehicles, width, height) {        
        if (this.position.x < 0 || this.position.x > width || this.position.y < 0 || this.position.y > height) {
            const center = p5.createVector(width / 2, height / 2);
            this.moveTo(center , 5)
            this.move();
            return;
        }

        this.checkVehicles(p5, vehicles) && this.checkConsumables(p5, consumables);
        this.eatConsumables(p5, consumables);
        this.eatVehicles(p5, vehicles);
        this.move();
    }

    checkVehicles(p5, vehicles) {
        let minDistance = this.huntRadius;
        let indexTarget = null;
        let vehicleFound = false;
        vehicles.forEach((vehicle, index) => {
            const distance = p5.dist(this.position.x, this.position.y, vehicle.position.x, vehicle.position.y);
            if (distance && distance <= minDistance && vehicle.life > CONSUMABLE_VALUE) {
                minDistance = distance;
                indexTarget = index;
                vehicleFound = true;
            }
        })
        const vehicle = vehicles[indexTarget];
        if (vehicle) {
            if (this.life > vehicle.life) {
                this.moveTo(vehicle.position);
            } else {
                this.avoid(vehicle.position);
            }
        }
        return !vehicleFound;
    }

    eatVehicles(p5, vehicles) {
        const inedecesToSplice = [];
        vehicles.forEach((vehicle, index) => {
            const distance = p5.dist(this.position.x, this.position.y, vehicle.position.x, vehicle.position.y)
            if (distance > 0 && distance <= this.getSize() / 2 + vehicle.getSize() / 2 && this.life > vehicle.life) {
                this.life += vehicle.life;
                if (this.life > MAX_LIFE) {
                    this.life = MAX_LIFE;
                }
                inedecesToSplice.push(index);
            }
        })
        inedecesToSplice.forEach(index => {
            this.score += VEHICLE_EATEN_SCORE;
            vehicles.splice(index, 1);
        });
    }

    checkConsumables(p5, consumables) {
        let minDistance = Infinity;
        let indexTarget = null;
        consumables.forEach((consumable, indx) => {
            const distance = p5.dist(this.position.x, this.position.y, consumable.x, consumable.y);
            if (distance < minDistance) {
                minDistance = distance;
                indexTarget = indx;
            } 
        });

        if (indexTarget) {
            const consumable = consumables[indexTarget];
            if (!consumable.poison || MIN_POISON_DETECTION_RATE < this.poisonDetectionRate) {
                //this.avoid(consumable);
                this.moveTo(consumable);
            }
        } 
    }

    eatConsumables(p5, consumables) {
        const inedecesToSplice = [];
        consumables.forEach((consumable, index) => {
            const distance = p5.dist(this.position.x, this.position.y, consumable.x, consumable.y)
            if (distance <= this.getSize() / 2 + CONSUMABLE_SIZE / 2) {
                if (consumable.poison) {
                    this.life -= CONSUMABLE_VALUE;
                } else if (this.life < MAX_LIFE) {
                    this.life += CONSUMABLE_VALUE;
                }
                inedecesToSplice.push(index);
            } 
        });
        inedecesToSplice.forEach(index => {
            this.score += CONSUMABLE_EATEN_SCORE * (consumables[index]?.poison ? -1 : 1);
            consumables.splice(index, 1);
        });
    }

    avoid(target) {
        const newAccelerationX = this.position.x - target.x ;
        const newAccelerationY = this.position.y -  target.y;
        
        // normalize
        const acelerationMagnitude = Math.sqrt(newAccelerationX ** 2 + newAccelerationY ** 2);
        this.acceleration.x = (newAccelerationX / acelerationMagnitude) * this.escapeAccelerationRate;
        this.acceleration.y = (newAccelerationY / acelerationMagnitude) * this.escapeAccelerationRate;

    }

    moveTo(target, multiplier = 1) {
        const newAccelerationX = target.x - this.position.x;
        const newAccelerationY = target.y - this.position.y;
        
        // normalize
        const acelerationMagnitude = Math.sqrt(newAccelerationX ** 2 + newAccelerationY ** 2);
        this.acceleration.x = (newAccelerationX / acelerationMagnitude) * this.eatAccelerationRate * multiplier;
        this.acceleration.y = (newAccelerationY / acelerationMagnitude) * this.eatAccelerationRate * multiplier;

    }

    move() {
        this.velocity.x += this.acceleration.x; 
        this.velocity.y += this.acceleration.y;
        if (this.velocity.x >= this.maxVelocity) {
            this.velocity.x = this.maxVelocity;
        }
        if (this.velocity.x <= -this.maxVelocity) {
            this.velocity.x = -this.maxVelocity;
        }
        if (this.velocity.y >= this.maxVelocity) {
            this.velocity.y = this.maxVelocity;
        }
        if (this.velocity.y <= -this.maxVelocity) {
            this.velocity.y = -this.maxVelocity;
        }
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.life--;
        this.fitness++;
    }

    getSize() {
        return this.life / 10;
    }
}

class Population {
    genotype = [];
    matingPool = [];
    bestFitness = 0;

    mutate(value) {
        if (Math.random() < MUTATION_RATE) {
            return Math.random() * value + value / 2;
        }
        return value;
    }

    pick(parent) {
        let found = false;
        let picked = null;
        while(!found) {
            const selectedIndex = Math.round(Math.random() * (this.matingPool.length - 1));
            picked = this.matingPool[selectedIndex];
            if ((!parent || parent !== picked) && picked.fitness >= Math.random() * this.bestFitness) {
                found = true
            }
        }
        return picked;
    }

    generateNewDna(father, mother, randomPosition) {
        const parents = [father, mother];
        const randomParent = () => Math.round(Math.random())
        return new Vehicle(
            randomPosition,
            {...parents[randomParent()].initialVelocity},
            {...parents[randomParent()].initialAcceleration},
            parents[randomParent()].color,
            this.mutate(parents[randomParent()].maxVelocity),
            this.mutate(parents[randomParent()].eatAccelerationRate),
            this.mutate(parents[randomParent()].escapeAccelerationRate),
            this.mutate(parents[randomParent()].huntRadius),
            this.mutate(parents[randomParent()].poisonDetectionRate),
            parents[randomParent()].initialLife,
        )
    }

    calculateBestFitness() {
        this.bestFitness = 0;
        this.genotype.forEach((dna) => {
            if (dna.fitness > this.bestFitness) {
                this.bestFitness = dna.fitness;
            }
        });
    }

    regeneratePopulation(createRandomPosition) {
        this.calculateBestFitness();
        const newPopulation = [];
        this.genotype.forEach(() => {
            const father = this.pick();
            const mother = this.pick(father);
            const randomPosition = createRandomPosition();
            const newDna = this.generateNewDna(father, mother, randomPosition);
            newPopulation.push(newDna);
        })
        this.matingPool = [...this.matingPool, ...newPopulation];
        this.genotype = newPopulation;
        return newPopulation
    }
}