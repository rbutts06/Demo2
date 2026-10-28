const app = document.querySelector<HTMLElement>("#app")!;

const message = document.createElement("p");
message.textContent = "Your project starts here.";

app.append(message);

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;

const commands: Line[] = [];
const redoCommands: Line[] = [];
//let cursorCommand: Cursor | null = null;
const ctx = canvas.getContext("2d")!;
const cursor = { active: false, x: 0, y: 0 };

interface Command {
  execute(): void;
}

interface Point {
  x: number;
  y: number;
}

interface Tool {
  id: number;
  color: string;
  strokeSize: number;
}

const tools: Tool[] = [{
  id: 0,
  color: "black",
  strokeSize: 4,
}, {
  id: 1,
  color: "blue",
  strokeSize: 4,
}, {
  id: 2,
  color: "green",
  strokeSize: 8,
}, {
  id: 3,
  color: "red",
  strokeSize: 2,
}];

let tool = tools[0];

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  commands.forEach((cmd) => cmd.execute);

  /*if (cursorCommand) {
    cursorCommand?.execute();
  }*/
}
/*function tick() {
  redraw();
}
tick();*/
redraw();

class Line implements Command {
  points: Point[];
  tool: Tool;
  constructor(p: Point, t: Tool) {
    this.points = [p];
    this.tool = t;
  }
  execute(): void {
    ctx.strokeStyle = this.tool.color;
    ctx.lineWidth = this.tool.strokeSize;
    ctx.beginPath();
    const { x, y } = this.points[0];
    ctx.moveTo(x, y);
    for (const { x, y } of this.points) {
      const k = 2;
      ctx.lineTo(x + Math.random() * k, y + Math.random() * k);
    }
    ctx.stroke();
  }
}

/*class Cursor implements Command {
  constructor(private p: Point) {}
  execute(): void {
    ctx.font = "32px monospace";
    ctx.fillText("*", this.p.x - 8, this.p.y + 16);
  }
}*/

let currentLineCommand: Line | null = null;

canvas.addEventListener("mousedown", (e) => {
  currentLineCommand = new Line({ x: e.offsetX, y: e.offsetY }, tool);
  commands.push(currentLineCommand);
  redoCommands.splice(0, redoCommands.length);
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  currentLineCommand = new Line({ x: e.offsetX, y: e.offsetY }, tool);
  if (cursor.active) {
    ctx.beginPath();
    ctx.moveTo(cursor.x, cursor.y);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = tool.color;
    ctx.lineWidth = tool.strokeSize;
    ctx.stroke();
    console.log(ctx.strokeStyle);
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
  }
  if (e.buttons == 1) {
    currentLineCommand.points.push({ x: e.offsetX, y: e.offsetY });
  }
});

/*canvas.addEventListener("mouseenter", (e) => {
  //cursorCommand = new Cursor({ x: e.offsetX, y: e.offsetY });
});*/

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});
const nextTool = document.getElementById("nextTool")! as HTMLButtonElement;
nextTool.addEventListener("click", () => {
  if (tool.id + 1 == tools.length) {
    tool = tools[0];
  } else {
    tool = tools[tool.id + 1];
  }
});
const lastTool = document.getElementById("lastTool")! as HTMLButtonElement;
lastTool.addEventListener("click", () => {
  if (tool.id - 1 < 0) {
    tool = tools[tools.length - 1];
  } else {
    tool = tools[tool.id - 1];
  }
});
const clearButton = document.getElementById("clear")! as HTMLButtonElement;

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

const undoButton = document.getElementById("undo")! as HTMLButtonElement;

undoButton.addEventListener("click", () => {
  if (commands.length > 0) {
    redoCommands.push(commands.pop()!);
    redraw();
  }
});

const redoButton = document.getElementById("redo")! as HTMLButtonElement;

redoButton.addEventListener("click", () => {
  if (redoCommands.length > 0) {
    commands.push(redoCommands.pop()!);
    redraw();
  }
});
