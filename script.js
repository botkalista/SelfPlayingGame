
const cells = [];

let cellHovered = undefined;

const cellSize = 60;

const game = {
    playing: false
}


const assets = {};

function updatePlayButton() {
    const playButton = document.querySelector('#play-btn');

    if (game.playing) {
        if (!playButton.classList.contains('is-loading')) playButton.classList.add('is-loading')
    } else {
        playButton.classList.remove('is-loading')
    }
}
function play() {
    game.playing = true;
    updatePlayButton();
}
function pause() {
    game.playing = false;
    updatePlayButton();
}
function reset() {
    cells.length = 0;
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            cells.push(new Cell(x, y));
        }
    }



    // const types = ['static', 'simple', 'push', 'spinner'];
    // const dirs = [0, 1, 2, 3];

    // cells.forEach(cell => {
    //     const hasCell = random() < 0.2;
    //     if (hasCell) {
    //         const content = new Block(random(types), random(dirs))
    //         cell.setContent(content);
    //     }
    // });


}



function preload() {
    assets.push = loadImage('assets/push.png');
    assets.spinner = loadImage('assets/spinner.png');
}

function setup() {
    const canvas = createCanvas(600, 600);
    canvas.parent('canvas')
    document.querySelector('canvas').style.border = "1px solid black";

    frameRate(20);

    reset();

}

function mouseMoved() {
    const pos = { x: mouseX, y: mouseY }
    cellHovered = undefined;
    if (pos.x > 0 && pos.x < width && pos.y > 0 && pos.y < height) {
        const cell = cells.find(c => (c.x * cellSize) < pos.x && (c.x * cellSize) + cellSize > pos.x && (c.y * cellSize) < pos.y && (c.y * cellSize) + cellSize > pos.y);
        if (cell && cell.content) return;
        cellHovered = cell;
    }
}

function keyPressed() {

    if (cellHovered) {

        if (key == '1') cellHovered.setContent(new Block('simple', 0));
        if (key == '3') cellHovered.setContent(new Block('static', 0));
        if (key == '7') cellHovered.setContent(new Block('spinner', 0));

        if (key == '6') cellHovered.setContent(new Block('push', 0));
        if (key == '2') cellHovered.setContent(new Block('push', 1));
        if (key == '4') cellHovered.setContent(new Block('push', 2));
        if (key == '8') cellHovered.setContent(new Block('push', 3));

        mouseMoved();

    }

}

function drawCellContent(cell) {
    const s = cellSize;
    const x = cell.x * s;
    const y = cell.y * s;

    push();
    imageMode(CENTER);
    rectMode(CENTER);
    translate(x + s / 2, y + s / 2);
    rotate(cell.content.dir * HALF_PI);
    switch (cell.content.type) {
        case 'static':
            noStroke();
            fill(50);
            rect(0, 0, s, s);
            break;
        case 'push':
            image(assets.push, 0, 0, s, s)
            break;
        case 'simple':
            noStroke();
            fill(80);
            rect(0, 0, s, s);
            break;
        case 'spinner':
            image(assets.spinner, 0, 0, s, s)
            break;
    }

    pop();
}

function getCellByPos(x, y) {
    return cells.find(c => c.x == x && c.y == y);
}

function getOffsetsFromDir(dir) {
    let offX = 0;
    let offY = 0;
    if (dir == 0) offX = 1;
    if (dir == 2) offX = -1;
    if (dir == 1) offY = 1;
    if (dir == 3) offY = -1;
    return { x: offX, y: offY }
}

function tick() {
    let contents = cells.map(c => c.content).filter(c => c != undefined);
    contents.forEach(content => {

        if (content.type == 'push') {


            const off = getOffsetsFromDir(content.dir);
            const nextCell = getCellByPos(content.parent.x + off.x, content.parent.y + off.y);
            if (!nextCell) return;
            if (!nextCell.content) {
                const parent = content.parent;
                nextCell.setContent(content);
                parent.setContent(undefined);
            } else if (nextCell.content.type != 'static') {
                const nextNextCell = getCellByPos(content.parent.x + off.x * 2, content.parent.y + off.y * 2);
                if (!nextNextCell) return;
                if (!nextNextCell.content) {
                    const parent = content.parent;
                    nextNextCell.setContent(nextCell.content);
                    nextCell.setContent(content);
                    parent.setContent(undefined);
                }
            }


        } else if (content.type == 'spinner') {
            const x = content.parent.x;
            const y = content.parent.y;

            const aroundCells = [
                getCellByPos(x, y - 1),
                getCellByPos(x - 1, y),
                getCellByPos(x + 1, y),
                getCellByPos(x, y + 1)
            ];

            aroundCells.forEach(c => {
                if (c && c.content) c.content.dir = c.content.dir == 3 ? 0 : c.content.dir + 1;
            });



        }


    });
}

let tickFrame = 0;

function draw() {
    clear();

    if (game.playing && tickFrame >= 5) {
        tick();
        tickFrame = 0;
    }
    tickFrame++;

    cells.forEach(c => {
        if (c.content) {
            drawCellContent(c);
        } else {
            noFill();
            stroke(110);
            rect(c.x * cellSize, c.y * cellSize, cellSize, cellSize);
        }
    });

    if (cellHovered) {
        fill(110);
        rect(cellHovered.x * cellSize, cellHovered.y * cellSize, cellSize, cellSize);
    }


}

class Cell {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.content = undefined;
    }

    setContent(block) {
        this.content = block;
        if (block) block.parent = this;
    }

}

class Block {

    constructor(type, dir) {
        this.type = type;
        this.dir = dir;
        this.parent = undefined;
    }

}