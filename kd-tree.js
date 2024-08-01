const width = 1400;
const height = 800;
const svg = d3.select("svg");
const pointInput = document.getElementById("pointInput");
const addPointBtn = document.getElementById("addPointBtn");
const buildTreeBtn = document.getElementById("buildTreeBtn");
const balanceTreeBtn = document.getElementById("balanceTreeBtn");
const pointList = d3.select("#pointList");

const points = [];
let kdtree = null;

class KDTreeNode {
    constructor(point, dimension) {
        this.point = point;
        this.dimension = dimension;
        this.left = null;
        this.right = null;
    }
}

class KDTree {
    constructor() {
        this.nodes = [];
        this.root = null;
    }

    addPoint(point) {
        const newNode = new KDTreeNode(point, 0);
        if (!this.root) {
            this.root = newNode;
        } else {
            this.insert(this.root, newNode, 0);
        }
        this.nodes.push(newNode);
        this.visualize();
    }

    insert(root, node, depth) {
        const axis = depth % 2;
        if (node.point[axis] < root.point[axis]) {
            if (root.left) {
                this.insert(root.left, node, depth + 1);
            } else {
                root.left = node;
            }
        } else {
            if (root.right) {
                this.insert(root.right, node, depth + 1);
            } else {
                root.right = node;
            }
        }
        node.dimension = axis;
    }

    buildKDTree(points, depth = 0) {
        if (points.length === 0) return null;

        const axis = depth % 2;
        points.sort((a, b) => a[axis] - b[axis]);
        const medianIndex = Math.floor(points.length / 2);
        const medianPoint = points[medianIndex];

        const node = new KDTreeNode(medianPoint, axis);
        node.left = this.buildKDTree(points.slice(0, medianIndex), depth + 1);
        node.right = this.buildKDTree(points.slice(medianIndex + 1), depth + 1);

        return node;
    }

    balance() {
        const allPoints = this.nodes.map(node => node.point);
        this.nodes = [];
        this.root = this.buildKDTree(allPoints);
        this.visualize();
    }

    visualize() {
        svg.selectAll("*").remove();
        if (this.root) {
            this.visualizeNode(this.root, width / 2, 50, width / 4);
        }
    }

    visualizeNode(node, x, y, offset) {
        if (!node) return;

        if (node.left) {
            svg.append("line")
                .attr("x1", x)
                .attr("y1", y)
                .attr("x2", x - offset)
                .attr("y2", y + 100)
                .attr("class", "edge");
            this.visualizeNode(node.left, x - offset, y + 100, offset / 2);
        }

        if (node.right) {
            svg.append("line")
                .attr("x1", x)
                .attr("y1", y)
                .attr("x2", x + offset)
                .attr("y2", y + 100)
                .attr("class", "edge");
            this.visualizeNode(node.right, x + offset, y + 100, offset / 2);
        }

        svg.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 15)
            .attr("class", "node");

        svg.append("text")
            .attr("x", x + 20)
            .attr("y", y + 5)
            .text(`(${node.point[0]}, ${node.point[1]})`);
    }
}

kdtree = new KDTree();

addPointBtn.addEventListener("click", () => {
    const inputValue = pointInput.value;
    const point = inputValue.split(",").map(Number);
    if (point.length === 2 && !isNaN(point[0]) && !isNaN(point[1])) {
        points.push(point);
        kdtree.addPoint(point);
        updatePointList();
        pointInput.value = "";
    } else {
        alert("Ingrese un punto válido en el formato x,y");
    }
});

buildTreeBtn.addEventListener("click", () => {
    kdtree = new KDTree();
    points.forEach(point => kdtree.addPoint(point));
});

balanceTreeBtn.addEventListener("click", () => {
    kdtree.balance();
});

function updatePointList() {
    pointList.selectAll(".element").remove();
    pointList.selectAll(".element")
        .data(points)
        .enter()
        .append("div")
        .attr("class", "element")
        .text(d => `(${d[0]}, ${d[1]})`);
}
