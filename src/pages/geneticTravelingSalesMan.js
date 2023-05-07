import P5Container from "@/components/P5Container"
import useWindowSize from "@/hooks/useWindowSize";
import { useRef } from "react";

const NODES_AMOUNT = 15;
const POPULATION_AMOUNT = 1000;
const MUTATION_RATE = 0.01;

export default () => {
    let nodes = useRef([]).current;
    let population = useRef().current;
    let bestPath = useRef([]).current;
    let shortestDistance = useRef().current;

    const { width, height } = useWindowSize();

    const getShortestDistance = (p5, order) => {
        let distance = 0;
        for (let i = 0; i < order.length - 1; i++) {
            const index = order[i];
            const next = order[i + 1];
            distance += p5.dist(nodes[index].x, nodes[index].y, nodes[next].x, nodes[next].y);
        }
        if (!shortestDistance || shortestDistance > distance) {
            shortestDistance = distance;
            bestPath = [...order];
        }
        return distance;
    }

    const setup = (p5) => {
        nodes = Array.from(Array(NODES_AMOUNT).keys()).map(() => p5.createVector(p5.random(width / (POPULATION_AMOUNT <= 10 ? 2 : 1)), p5.random(height)));
        population = new Population(nodes.map((val, indx) => indx), POPULATION_AMOUNT, width * height, MUTATION_RATE);
    }

    const drawPath = (p5, color, vertices, path, resize, nodeSize, stroke) => {
        p5.fill(color);
        p5.noStroke();
        vertices.forEach(node => {
            p5.ellipse(node.x * resize, node.y * resize, nodeSize, nodeSize);
        });
        
        p5.stroke(color);
        p5.strokeWeight(stroke);
        p5.noFill();
        p5.beginShape();
        path.forEach(node => {
            p5.vertex(vertices[node].x * resize, vertices[node].y * resize);
        });
        p5.endShape();

    }

    const draw = (p5) => {
        //p5.frameRate(1)
        population.calculateFitness((order) => getShortestDistance(p5, order));
        population.generateNewPopulation();
        p5.background("black");
        drawPath(p5, "orange", nodes, bestPath, 1, 20, 5);
        if (POPULATION_AMOUNT <= 10) {
            p5.translate(width / 2 + width / 4, 0)
           
            population.population.forEach(({genotype}) => {
                drawPath(p5, "white", nodes, genotype, 1 / POPULATION_AMOUNT, 2, 1 / 2)
                p5.translate(0, height / POPULATION_AMOUNT)
            });
        }
    }
    return <P5Container draw={draw} setup={setup}/>
}

const shuffle = (originalArray) => {
    const array = [...originalArray];
    for (let i = 0; i < array.length - 1; i++) {
        const index = Math.ceil(Math.random(array.length - 1) * array.length - 1);
        const temp = array[i]
        array[i] = array[index];
        array[index] = temp;
    }
    return array;
}

class Population {
    population = [];
    matingPool = []; // unused
    populationSize = 10;
    target = 0;
    bestFitness = 0;

    constructor(order, populationSize = 10, windowSize, mutationRate) {
        this.populationSize = populationSize;
        for(let i = 0; i < this.populationSize; i++) {
            const newOrder = shuffle(order);
            this.population.push(new DNA(newOrder, windowSize, mutationRate));
        }
    }

    calculateFitness(func) {
        this.population.forEach(dna => dna.calculateFitness(func));
        this.generateMatingPool();
    }

    // too expensive for this scenario, left here as an example of mating pool
    generateMatingPool() {
        this.matingPool = [];
        this.population.forEach(dna => {
            for (let i = 0; i < dna.fitness; i++) {
                this.matingPool.push(dna);
            }
        })
    }

   
    pick(parent) {
        let found = false;
        let picked = null;
        while(!found) {
            const selectedIndex = Math.round(Math.random() * (this.population.length - 1));
            picked = this.population[selectedIndex];
            if ((!parent || parent !== picked) && picked.fitness >= Math.random() * this.bestFitness) {
                found = true
            }
        }
        return picked;
    }

    calculateBestFitness() {
        this.bestFitness = 0;
        this.population.forEach(dna => {
            if (dna.fitness > this.bestFitness) {
                this.bestFitness = dna.fitness;
            }
        })
    }
   
    generateNewPopulation() {
        const newPopulation = [];
        this.calculateBestFitness();
        this.population.forEach(() => {
            const father = this.pick();
            const mother = this.pick(father);
            const newDna = father.crossOver(mother);
            newPopulation.push(newDna)
        })
        this.population = newPopulation;
    }
}

class DNA {
    genotype = [];
    fitness = null;
    mutationRate = null;

    constructor(genotype, windowSize, mutationRate) {
        this.genotype = genotype;
        this.windowSize = windowSize;
        this.mutationRate = mutationRate;
    }

    calculateFitness(func) {
        this.fitness = Math.ceil(this.windowSize / func(this.genotype));
    }

    mutate() {
        if (Math.random() < this.mutationRate) {
            this.genotype = shuffle(this.genotype);
        }
    }

    crossOver(partner) {
        let newGenotype = [];
        let winner = [];
        let looser = []
        const middleIndex = Math.ceil(this.genotype.length / 2 + this.genotype.length / 4);
        if (this.fitness < partner.fitness) {
            winner = this.genotype;
            looser = partner.genotype;
        } else {
            winner = partner.genotype;
            looser = this.genotype;
        }

        newGenotype = [...winner].splice(middleIndex);
        looser.forEach(item => {
            if (!newGenotype.includes(item)) {
                newGenotype.push(item);
            }
        })
        
        const newDna =  new DNA(newGenotype, this.windowSize, this.mutationRate);
        newDna.mutate();
        return newDna;
    }
}