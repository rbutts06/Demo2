const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "D2 project";

const message = document.createElement("p");
message.textContent = "Your project starts here.";

app.append(heading, message);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.style.cursor = "none";
//TODO: add canvas border
canvas.style.border = "1px soild #000";
//canvas.setAttribute("border", "black");
document.body.append(canvas);

const commands: Line[] = [];
const redoCommands: Line[] = [];
let cursorCommand: Cursor = null;
const ctx = canvas.getContext("2d");
const cursor = { active: false, x: 0, y: 0 };

interface Command {
  execute(): void;
}

function redraw() {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  commands.forEach((cmd) => cmd.execute);

  if (cursorCommand) {
    cursorCommand.execute();
  }
}
function tick() {
  redraw();
}
tick();

class Line implements Command {
  points;
  constructor(x: number, y: number) {
    this.points = [{ x, y }];
  }
  execute(): void {
    ctx!.strokeStyle = "black";
    //ctx.strokeWidth = 4;
    ctx?.beginPath();
    const { x, y } = this.points[0];
    ctx?.moveTo(x, y);
    for (const { x, y } of this.points) {
      const k = 2;
      ctx?.lineTo(x + Math.random() * k, y + Math.random() * k);
    }
    ctx?.stroke();
  }
}

class Cursor implements Command {
  x;
  y;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  execute(): void {
    ctx!.font = "32px monospace";
    ctx?.fillText("*", this.x - 8, this.y + 16);
  }
}

let currentLineCommand = null;

canvas.addEventListener("mousedown", (e) => {
  currentLineCommand = new Line(e.offsetX, e.offsetY);
  commands.push(currentLineCommand);
  redoCommands.splice(0, redoCommands.length);
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    ctx?.beginPath();
    ctx?.moveTo(cursor.x, cursor.y);
    ctx?.lineTo(e.offsetX, e.offsetY);
    ctx?.stroke();
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
document.body.append(undoButton);

undoButton.addEventListener("click", () => {
  if (commands.length > 0) {
    redoCommands.push(commands.pop()!);
    requestAnimationFrame(redraw);
  }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
document.body.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoCommands.length > 0) {
    commands.push(redoCommands.pop()!);
    requestAnimationFrame(redraw);
  }
});
