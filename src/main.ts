const app = document.querySelector<HTMLElement>("#app")!;

const message = document.createElement("p");
message.textContent = "Your project starts here.";

app.append(message);

import { Command } from "./interfaces.ts";
import { Point } from "./interfaces.ts";
import { Tool } from "./interfaces.ts";
import { StickerTool } from "./interfaces.ts";

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;

const commands: (Line | Sticker)[] = [];
const redoCommands: (Line | Sticker)[] = [];
//let cursorCommand: Cursor | null = null;
const ctx = canvas.getContext("2d")!;
const cursor = { active: false, x: 0, y: 0 };

const stickers: StickerTool[] = [{
  emoji: "🧟‍♂️",
}, {
  emoji: "🎃",
}, {
  emoji: "💀",
}, {
  emoji: "👻",
}, {
  emoji: "🪦",
}];

const tool: Tool = {
  color: "black",
  strokeSize: 4,
};
let toolActive: boolean = true;

let currentSticker: StickerTool = {
  emoji: "",
};
let stickerActive: boolean = false;

const colors: string[] = [
  "black",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
];

function redraw() {
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  commands.forEach((cmd) => cmd.execute());
}

redraw();

class Line implements Command {
  points: Point[];
  tool: Tool;
  constructor(p: Point, t: Tool) {
    this.points = [p];
    this.tool = t;
  }
  execute() {
    ctx.strokeStyle = this.tool.color;
    ctx.lineWidth = this.tool.strokeSize;
    ctx.beginPath();
    const { x, y } = this.points[0];
    ctx.moveTo(x, y);
    ctx.stroke();
  }
}

class Sticker implements Command {
  points: Point;
  sticker: StickerTool;
  constructor(p: Point, s: StickerTool) {
    this.points = p;
    this.sticker = s;
  }
  execute(): void {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.sticker.emoji, this.points.x, this.points.y);
  }
}

let currentCommand: Line | Sticker | null = null;

canvas.addEventListener("mousedown", (e) => {
  currentCommand = new Line({ x: e.offsetX, y: e.offsetY }, tool);
  commands.push(currentCommand);
  redoCommands.splice(0, redoCommands.length);
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (toolActive) {
    currentCommand = new Line({ x: e.offsetX, y: e.offsetY }, tool);
    commands.push(currentCommand);
  }
  if (stickerActive) {
    currentCommand = new Sticker(
      { x: e.offsetX, y: e.offsetY },
      currentSticker,
    );
    commands.push(currentCommand);
  }
  if (cursor.active) {
    ctx.beginPath();
    ctx.moveTo(cursor.x, cursor.y);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = tool.color;
    ctx.lineWidth = tool.strokeSize;
    ctx.stroke();
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
  }
});

canvas.addEventListener("mouseup", () => {
  redraw();
  cursor.active = false;
});

const nextTool = document.getElementById("nextTool")! as HTMLButtonElement;
nextTool.addEventListener("click", () => {
  toolActive = true;
  const index = colors.indexOf(String(tool.color));
  if (index + 1 == colors.length) {
    tool.color = colors[0];
  } else {
    tool.color = colors[index + 1];
  }
});

const lastTool = document.getElementById("lastTool")! as HTMLButtonElement;
lastTool.addEventListener("click", () => {
  toolActive = true;
  const index = colors.indexOf(String(tool.color));
  if (index - 1 < 0) {
    tool.color = colors[colors.length - 1];
  } else {
    tool.color = colors[index - 1];
  }
});

const thickButton = document.getElementById("thick")! as HTMLButtonElement;
thickButton.addEventListener("click", () => {
  toolActive = true;
  if (tool.strokeSize + 2 < 11) tool.strokeSize += 2;
});

const thinButton = document.getElementById("thin")! as HTMLButtonElement;
thinButton.addEventListener("click", () => {
  toolActive = true;
  if (tool.strokeSize - 2 > 1) tool.strokeSize -= 2;
});

const zombieButton = document.getElementById("zombie")! as HTMLButtonElement;
zombieButton.addEventListener("click", () => {
  toolActive = false;
  stickerActive = true;
  currentSticker = stickers[0];
});

const pumpkinButton = document.getElementById("pumpkin")! as HTMLButtonElement;
pumpkinButton.addEventListener("click", () => {
  toolActive = false;
  stickerActive = true;
  currentSticker = stickers[1];
});

const skullButton = document.getElementById("skull")! as HTMLButtonElement;
skullButton.addEventListener("click", () => {
  toolActive = false;
  stickerActive = true;
  currentSticker = stickers[2];
});

const ghostButton = document.getElementById("ghost")! as HTMLButtonElement;
ghostButton.addEventListener("click", () => {
  toolActive = false;
  stickerActive = true;
  currentSticker = stickers[3];
});

const graveButton = document.getElementById("grave")! as HTMLButtonElement;
graveButton.addEventListener("click", () => {
  toolActive = false;
  stickerActive = true;
  currentSticker = stickers[4];
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
