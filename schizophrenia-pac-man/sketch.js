let pacman, maze, grid, finder, interval, randy, cols, rows, toggle, pause, lastToggleFrame, message, summerPixel, pointSpan;
let points = 0;
let ghostObj = {
    colours: ["blue", "orange", "pink", "red"],
    sprites: {},
    count: 0,
    ghosts: []
};

function preload()
{
    ghostObj.sprites.red = loadImage('assets/red.png');
    ghostObj.sprites.orange = loadImage('assets/orange.png');
    ghostObj.sprites.blue = loadImage('assets/blue.png');
    ghostObj.sprites.pink = loadImage('assets/pink.png');
    ghostObj.sprites.white = loadImage('assets/white.png');
    ghostObj.sprites.panic = loadImage('assets/panic.png');
    summerPixel = loadFont('assets/SummerPixel22.ttf');
}

function setup()
{
    let canvas = createCanvas(600, 600);
    let x = (windowWidth - width) / 2;
    let y = (windowHeight - height) / 2;

    if (document.getElementById("points") == undefined)
    {
        pointSpan = createSpan(`Points: ${points}`);
        pointSpan.id('points');
        pointSpan.position(x, y - 20);
    }

    canvas.position(x, y);
    frameRate(100);

    cols = 10;
    rows = 10;
    toggle = true;
    pause = false;
    lastToggleFrame = 0;
    points = 0;
    ghostObj.ghosts = [];
    ghostObj.count = 0;

    regenerateMaze();
    pacman = new pac(30, 30, 40);
    finder = new PF.BestFirstFinder();
    randy = round(random(lastToggleFrame + 80, 500));
}

function draw()
{
    background(0);
    let keepGoing = false;
    for (let i = 0; i < maze.length; i++)
    {
        for (let j = 0; j < maze[i].length; j++)
        {
            maze[i][j].show();
            noStroke();
            if (maze[i][j].pellet.some(p => p === true))
            {
                keepGoing = true;
            }
        }
    }

    if (!keepGoing)
    {
        message = "You Win!";
        pause = true;
    }

    let cell = getCell(pacman.x, pacman.y);
    switch (true)
    {
        case keyIsDown(RIGHT_ARROW):
            cell = getCell(pacman.x + 2 - (width / cols) / 2, pacman.y);
            pacman.direction = 'right';
            if (!cell.walls[1])
            {
                pacman.x += 2;
            }
            break;

        case keyIsDown(DOWN_ARROW):
            cell = getCell(pacman.x, pacman.y + 2 - (width / rows) / 2);
            pacman.direction = 'down';
            if (!cell.walls[2])
            {
                pacman.y += 2;
            }
            break;

        case keyIsDown(LEFT_ARROW):
            cell = getCell(pacman.x - 2 + (width / cols) / 2, pacman.y);
            pacman.direction = 'left';
            if (!cell.walls[3])
            {
                pacman.x -= 2;
            }
            break;

        case keyIsDown(UP_ARROW):
            cell = getCell(pacman.x, pacman.y - 2 + (width / rows) / 2);
            pacman.direction = 'up';
            if (!cell.walls[0])
            {
                pacman.y -= 2;
            }
            break;
    }

    if (!pause)
    {
        pacman.draw();
        pacman.update();
    }

    for (let i = 0; i < ghostObj.ghosts.length; i++)
    {
        ghostObj.ghosts[i].render();
        ghostObj.ghosts[i].update();
    }

    if (pause)
    {
        noStroke();
        textFont(summerPixel);
        fill(0, 0, 0, 80);
        rect(0, 0, width, height);
        textSize(60);
        fill(255);
        textAlign(CENTER, CENTER);
        text(message, width / 2, height / 2);
        textSize(40);
        text("Click to play again", width / 2, (height / 2) + 60);
    }

    if (frameCount == randy)
    {
        regenerateMaze();
        randy = round(random(lastToggleFrame + 80, 500));
    }
    else if (round(frameCount * 2) == randy)
    {
        addGhost();
        randy = round(random(lastToggleFrame + 80, 500));
    }
    else if (round((frameCount * 2) / 1.5) == randy)
    {
        removeGhost();
        randy = round(random(lastToggleFrame + 80, 500));
    }

    if (ghostObj.count < 3)
    {
        addGhost();
    }

    pointSpan.html(`Points: ${points}`);
}

async function regenerateMaze()
{
    maze = newMaze();
    await maze.forEach((col, x) =>
    {
        col.forEach((cell, y) =>
        {
            cell.pellet = [!cell.walls[0], true, !cell.walls[1]];
        })
    });
    grid = convertMaze(maze);

    ghostObj.ghosts.forEach((el, i) =>
    {
        el.findPath();
    })
}

function newMaze()
{
    let maze = [];
    for (let x = 0; x < cols; x++)
    {
        maze[x] = [];
        for (let y = 0; y < rows; y++)
        {
            maze[x][y] = new cell(x, y);
        }
    }
    return generateMaze(maze);
}

function generateMaze(maze)
{
    let stack = [];
    let currentCell = {
        x: floor(random(cols)),
        y: floor(random(rows))
    };
    maze[currentCell.x][currentCell.y].visited = true;
    stack.push(currentCell);
    rect(0, 0, width, height);

    while (stack.length > 0)
    {
        let nextCell = getNextCell(maze, currentCell);
        if (nextCell)
        {
            removeWall(maze, currentCell, nextCell);
            maze[nextCell.x][nextCell.y].visited = true;
            stack.push(nextCell);
            currentCell = nextCell;
        }
        else
        {
            currentCell = stack.pop();
        }
    }
    return maze;
}

function getNextCell(maze, cell)
{
    let directions = [
        { x: 0, y: -1 }, // up
        { x: 1, y: 0 }, // right
        { x: 0, y: 1 }, // down
        { x: -1, y: 0 } // left
    ];
    let neighbors = [];
    for (let i = 0; i < directions.length; i++)
    {
        let x = cell.x + directions[i].x;
        let y = cell.y + directions[i].y;
        if (x >= 0 && x < cols && y >= 0 && y < rows && !maze[x][y].visited)
        {
            neighbors.push({ x, y });
        }
    }
    if (neighbors.length > 0)
    {
        return random(neighbors);
    }
    else
    {
        return null;
    }
}

function removeWall(maze, cell1, cell2)
{
    let xDiff = cell2.x - cell1.x;
    let yDiff = cell2.y - cell1.y;
    if (xDiff === 1)
    {
        maze[cell1.x][cell1.y].walls[1] = false;
        maze[cell2.x][cell2.y].walls[3] = false;
    }
    else if (xDiff === -1)
    {
        maze[cell1.x][cell1.y].walls[3] = false;
        maze[cell2.x][cell2.y].walls[1] = false;
    }
    else if (yDiff === 1)
    {
        maze[cell1.x][cell1.y].walls[2] = false;
        maze[cell2.x][cell2.y].walls[0] = false;
    }
    else if (yDiff === -1)
    {
        maze[cell1.x][cell1.y].walls[0] = false;
        maze[cell2.x][cell2.y].walls[2] = false;
    }
}

function convertMaze(maze)
{
    let grid = new PF.Grid(cols * 3, rows * 3);
    for (let x = 0; x < cols; x++)
    {
        for (let y = 0; y < rows; y++)
        {
            let walls = maze[x][y].walls;
            //Top right bottom left
            if (walls[0])
            {
                for (let k = 0; k < 3; k++)
                {
                    grid.setWalkableAt((x * 3) + k, y * 3, false);
                }
            }

            if (walls[1])
            {
                for (let k = 0; k < 3; k++)
                {
                    grid.setWalkableAt((x * 3) + 2, (y * 3) + k, false);
                }
            }

            if (walls[2])
            {
                for (let k = 0; k < 3; k++)
                {
                    grid.setWalkableAt((x * 3) + k, (y * 3) + 2, false);
                }
            }

            if (walls[3])
            {
                for (let k = 0; k < 3; k++)
                {
                    grid.setWalkableAt(x * 3, (y * 3) + k, false);
                }
            }
        }
    }

    return grid;
}

function addGhost()
{
    ghostObj.ghosts.push(new ghost(ghostObj.count));
    ghostObj.ghosts[ghostObj.count].findPath();
    ghostObj.count++;
}

function removeGhost()
{
    let fakeGhosts = [];
    ghostObj.ghosts.forEach((el, i) =>
    {
        if (!el.real)
        {
            fakeGhosts.push(i);
        }
    });

    let index = random(fakeGhosts);
    if (ghostObj.ghosts[index])
    {
        ghostObj.ghosts[index].die();
    }
}

function getCell(x, y)
{
    try
    {
        let col = Math.floor(x / (width / cols));
        let row = Math.floor(y / (height / rows));
        return maze[col][row];
    }
    catch
    {
        console.log(error);
        console.log(x, y);
    }
}

function getRandomCell()
{
    return random(random(maze));
}

function keyReleased()
{
    let currentCell = getCell(pacman.x, pacman.y);
    //top right bottom left
    if (currentCell.walls[1] || currentCell.walls[3])
    {
        pacman.x = (currentCell.x * (width / cols)) + 30;
    }

    if (currentCell.walls[0] || currentCell.walls[2])
    {
        pacman.y = (currentCell.y * (height / rows)) + 30;
    }
}

function drawGrid()
{
    let size = width / (cols * 3);
    for (let i = 0; i < grid.width; i++)
    {
        for (let j = 0; j < grid.height; j++)
        {
            fill(0, 0, 0, 0);
            if (!grid.isWalkableAt(i, j))
            {
                fill(255, 0, 0, 50);
            }
            strokeWeight(1);
            stroke(255, 0, 0);
            rect(i * size, j * size, size, size);
        }
    }
}

function mouseClicked()
{
    if (pause)
    {
        setup();
    }
}

function clearPellets()
{
    for (let i = 0; i < maze.length; i++)
    {
        for (let j = 0; j < maze[i].length; j++)
        {
            maze[i][j].pellet = [false, false, false];
        }
    }
}

class pac
{
    constructor(x, y, size)
    {
        this.x = x;
        this.y = y;
        this.size = size;
        this.angle = 0;
        this.mouthAngle = 0;
        this.mouthSpeed = 0.3;
        this.direction = "right";
        this.hidden = false;
    }

    draw()
    {
        noStroke();
        push();
        translate(this.x, this.y)
        rotate(lerp(0, this.mouthAngle, 0.5));
        switch (this.direction)
        {
            case 'right':
                rotate(0);
                break;
            case 'down':
                rotate(PI / 2);
                break;
            case 'left':
                rotate(PI);
                break;
            case 'up':
                rotate(-PI / 2);
                break;
        }
        fill(255, 255, 0);
        if (!this.hidden)
        {
            arc(0, 0, this.size, this.size, 0, TWO_PI - this.mouthAngle);
        }
        pop();
    }

    update()
    {
        this.mouthAngle += this.mouthSpeed;
        if (this.mouthAngle > 2 || this.mouthAngle < 0.1)
        {
            this.mouthSpeed *= -1;
        }

        // eat pellet
        let currentCell = getCell(this.x, this.y);
        let pacmanRadius = this.size / 2;

        for (let i = 0; i < 3; i++)
        {
            for (let j = 0; j < 3; j++)
            {
                if (currentCell.pellet[i * 3 + j])
                {
                    let pelletX = (currentCell.x * (width / cols)) + 10 + j * (width / (cols * 3));
                    let pelletY = (currentCell.y * (height / rows)) + 10 + i * (height / (rows * 3));
                    let pelletRadius = 5;

                    if (dist(this.x, this.y, pelletX, pelletY) < pacmanRadius + pelletRadius)
                    {
                        currentCell.pellet[i * 3 + j] = false;
                        points += 10;
                    }
                }
            }
        }

        if (currentCell.powerUp)
        {
            currentCell.powerUp = false;
            points += 50;
            ghostObj.ghosts.forEach(el =>
            {
                el.strength = 0;
                // label the timeouts and then clear them so they restart if pac eats 2 powerups in a row
                setTimeout(() =>
                {
                    el.strength = 1;

                    setTimeout(() =>
                    {
                        clearInterval(interval);
                        el.strength = 2;
                    }, 3000);
                }, 6000);
            })
        }
    }

    die()
    {
        this.hidden = true;
        message = "Game Over";
        pause = true;
    }
}

class ghost
{
    constructor(index)
    {
        let count = ghostObj.count;
        this.color = ghostObj.colours[count % 4];
        this.cell = getRandomCell();
        this.size = 40;
        this.x = (this.cell.x * (width / cols)) + 10;
        this.y = (this.cell.y * (height / rows)) + 10;
        this.centreX = this.x + (this.size / 2);
        this.centreY = this.y + (this.size / 2);
        this.currentCell = getCell(this.centreX, this.centreY);
        this.targetCell = getCell(pacman.x, pacman.y);
        this.real = random([true, false]);
        this.strength = 2;
        this.hidden = false;
        this.index = index;
    }

    render()
    {
        if (!this.hidden)
        {
            if (this.strength == 2)
            {
                image(ghostObj.sprites[this.color], this.x, this.y, this.size, this.size);
            }
            else if (this.strength == 0)
            {
                image(ghostObj.sprites.panic, this.x, this.y, this.size, this.size);
            }
            else
            {
                if (frameCount - lastToggleFrame >= 10)
                {
                    toggle = !toggle;
                    lastToggleFrame = frameCount;
                }

                if (toggle)
                {
                    image(ghostObj.sprites.white, this.x, this.y, this.size, this.size);
                }
                else
                {
                    image(ghostObj.sprites.panic, this.x, this.y, this.size, this.size);
                }
            }
        }
    }

    update()
    {
        this.currentCell = getCell(this.centreX, this.centreY);

        if (this.currentCell == this.targetCell)
        {
            this.findPath();
        }

        if (this.path.length > 0)
        {
            let nextCell = this.path[0];
            let dx = nextCell[0] - this.currentCell.x;
            let dy = nextCell[1] - this.currentCell.y;

            if (dx > 0)
            {
                this.x += 2;
                this.direction = "right";
            }
            else if (dx < 0)
            {
                this.x -= 2;
                this.direction = "left";
            }
            else if (dy > 0)
            {
                this.y += 2;
                this.direction = "down";
            }
            else if (dy < 0)
            {
                this.y -= 2;
                this.direction = "up";
            }

            switch (this.direction)
            {
                case "right":
                    this.centreX = this.x - 10;
                    break;

                case "left":
                    this.centreX = this.x + this.size + 10;
                    break;

                case "up":
                    this.centreY = this.y + this.size + 10;
                    break;

                case "down":
                    this.centreY = this.y - 10;
                    break;

                default:
                    this.centreX = this.x + (this.size / 2);
                    this.centreY = this.y + (this.size / 2);
                    break;
            }

            if (this.currentCell.x == nextCell[0] && this.currentCell.y == nextCell[1])
            {
                this.path.shift();
            }
            // this.showPath("big");
        }

        let pacCell = getCell(pacman.x, pacman.y);
        if (this.real && this.currentCell.x == pacCell.x && this.currentCell.y == pacCell.y)
        {
            if (this.strength > 1)
            {
                pacman.die();
            }
            else
            {
                this.die();
            }
        }
    }

    die()
    {
        ghostObj.ghosts.forEach((el, i) =>
        {
            if (i > this.index)
            {
                el.index--;
            }
        })
        ghostObj.count--;
        ghostObj.ghosts.splice(this.index, 1);
        points += 200;
    }

    findPath()
    {
        this.currentCell = getCell(this.x, this.y);
        this.targetCell = getRandomCell();
        this.path = finder.findPath((this.currentCell.x * 3) + 1, (this.currentCell.y * 3) + 1, (this.targetCell.x * 3) + 1, (this.targetCell.y * 3) + 1, grid.clone());

        for (let i = 0; i < this.path.length; i++)
        {
            this.path[i][0] = round((this.path[i][0] - 1) / 3);
            this.path[i][1] = round((this.path[i][1] - 1) / 3);
        }

        this.path = [...new Set(this.path.map(JSON.stringify))].map(JSON.parse);
    }

    showPath(t)
    {
        let size;
        switch (t)
        {
            case "small":
                size = width / (cols * 3);
                for (let i = 0; i < this.path.length; i++)
                {
                    noStroke();
                    fill(0, 255, 0, 50);
                    rect(this.path[i][0] * size, this.path[i][1] * size, size, size);
                }
                break;

            case "big":
                size = width / cols;
                for (let i = 0; i < this.path.length; i++)
                {
                    noStroke();
                    fill(0, 255, 0, 50);
                    rect(this.path[i][0] * size, this.path[i][1] * size, size, size);
                }
                break;
        }
    }
}

class cell
{
    constructor(i, j)
    {
        this.x = i;
        this.y = j;
        this.walls = [true, true, true, true]; // top, right, bottom, left
        this.visited = false;
        this.occupied = false;
        this.pellet = [true, true, true]; // centre, top, right
        this.powerUp = (this.x == 0 && this.y == 4) || (this.x == 4 && this.y == 0) || (this.x == 4 && this.y == 9) || (this.x == 9 && this.y == 4);
    }

    show()
    {
        let x = this.x * width / cols;
        let y = this.y * height / rows;
        let w = width / cols;

        stroke(0, 0, 255);
        strokeWeight(4);

        //Top
        if (this.walls[0])
        {
            line(x, y, x + w, y)
        }

        //Right
        if (this.walls[1])
        {
            line(x + w, y, x + w, y + w)
        }

        //Bottom
        if (this.walls[2])
        {
            line(x + w, y + w, x, y + w)
        }

        //Left
        if (this.walls[3])
        {
            line(x, y + w, x, y)
        }


        noStroke();
        fill("#fed9b7");
        //Centre
        if (this.pellet[1])
        {
            ellipse(x + (w / 2), y + (w / 2), 10);
        }

        //Top
        if (this.pellet[0])
        {
            ellipse(x + (w / 2), y, 10);
        }

        //Right
        if (this.pellet[2])
        {
            ellipse(x + w, y + (w / 2), 10);
        }

        if (this.powerUp)
        {
            ellipse(x + (w / 2), y + (w / 2), 20);
        }
    };

    checkNeighbors()
    {
        let neighbors = [];
        let top = grid[this.x + (this.y - 1) * cols];
        let right = grid[this.x + 1 + this.y * cols];
        let bottom = grid[this.x + (this.y + 1) * cols];
        let left = grid[this.x - 1 + this.y * cols];

        if (top && !top.visited) neighbors.push(top);
        if (right && !right.visited) neighbors.push(right);
        if (bottom && !bottom.visited) neighbors.push(bottom);
        if (left && !left.visited) neighbors.push(left);

        if (this.x == 0 && this.y == 0)
        {
            right.walls[3] = false;
            bottom.walls[2] = false;
        }

        if (neighbors.length > 0)
        {
            let r = int(random(0, neighbors.length));
            return neighbors[r];
        }
        else
        {
            return undefined;
        }
    };

    getNeighbors()
    {
        const neighbors = [];

        for (let i = 0; i < 4; i++)
        {
            const neighbor = getCell(this.x + (i === 1 ? 1 : i === 3 ? -1 : 0) * (width / cols), this.y + (i === 2 ? 1 : i === 0 ? -1 : 0) * (height / rows));
            if (neighbor && !this.walls[i])
            {
                neighbors.push(neighbor);
            }
        }
        return neighbors;
    }
}