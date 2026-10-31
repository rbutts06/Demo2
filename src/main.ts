const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
canvas.width = 400;
canvas.height = 400;
interface Command {
  execute(): void;
}

interface Point {
  x: number;
  y: number;
}

interface PenTool {
  color: string;
  strokeSize: number;
}

interface StickerTool {
  emoji: string;
}

interface StickerButton {
  elId: string;
  index: number;
}

class Line implements Command {
  points: Point[];
  tool: PenTool;
  constructor(p: Point, t: PenTool) {
    this.points = [p];
    this.tool = structuredClone(t);
  }
  execute() {
    ctx.strokeStyle = this.tool.color;
    ctx.lineWidth = this.tool.strokeSize;
    ctx.beginPath();
    const { x, y } = this.points[0];
    ctx.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx.lineTo(x, y);
    }
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

const commands: Command[] = [];
const redoCommands: Command[] = [];
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

const tool: PenTool = {
  color: "black",
  strokeSize: 4,
};

let currentSticker: StickerTool | null = null;

let currentMode: "sticker" | "marker" = "marker";

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  commands.forEach((cmd) => cmd.execute());
}

redraw();

let currentCommand: Command | null = null;

canvas.addEventListener("mousedown", (e) => {
  if (currentMode == "marker") {
    currentCommand = new Line({ x: e.offsetX, y: e.offsetY }, tool);
    commands.push(currentCommand);
  } else if (currentSticker) {
    currentCommand = new Sticker(
      { x: e.offsetX, y: e.offsetY },
      currentSticker,
    );
    commands.push(currentCommand);
  }
  redoCommands.splice(0, redoCommands.length);
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  redraw();
});

canvas.addEventListener("mousemove", (e) => {
  if (!currentCommand || !cursor.active) {
    return;
  }
  if (currentMode == "marker") {
    const currentLine = currentCommand as Line;
    currentLine.points.push({ x: e.offsetX, y: e.offsetY });
  } else if (currentSticker) {
    currentCommand = new Sticker(
      { x: e.offsetX, y: e.offsetY },
      currentSticker,
    );
    commands.push(currentCommand);
  }
  redraw();
});

canvas.addEventListener("mouseup", () => {
  redraw();
  cursor.active = false;
  currentCommand = null;
});

const STROKE_INCREMENT = 2;
const STROKE_MAX = 11;

const thickButton = document.getElementById("thick")! as HTMLButtonElement;
thickButton.addEventListener("click", () => {
  currentMode = "marker";
  if (tool.strokeSize + STROKE_INCREMENT < STROKE_MAX) {
    tool.strokeSize += STROKE_INCREMENT;
  }
});

const thinButton = document.getElementById("thin")! as HTMLButtonElement;
thinButton.addEventListener("click", () => {
  currentMode = "marker";
  if (tool.strokeSize - STROKE_INCREMENT > 1) {
    tool.strokeSize -= STROKE_INCREMENT;
  }
});

const clearButton = document.getElementById("clear")! as HTMLButtonElement;

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

const undoButton = document.getElementById("undo")! as HTMLButtonElement;

undoButton.addEventListener("click", () => {
  if (commands.length) {
    redoCommands.push(commands.pop()!);
    redraw();
  }
});

const redoButton = document.getElementById("redo")! as HTMLButtonElement;

redoButton.addEventListener("click", () => {
  if (redoCommands.length) {
    commands.push(redoCommands.pop()!);
    redraw();
  }
});

const _zombieButton = createStickerButton({ elId: "zombie", index: 0 });
const _pumpkinButton = createStickerButton({ elId: "pumpkin", index: 1 });
const _skullButton = createStickerButton({ elId: "skull", index: 2 });
const _ghostButton = createStickerButton({ elId: "ghost", index: 3 });
const _graveButton = createStickerButton({ elId: "grave", index: 4 });

function createStickerButton(sticker: StickerButton) {
  const button = document.getElementById(sticker.elId)! as HTMLButtonElement;
  button.addEventListener("click", () => {
    currentMode = "sticker";
    currentSticker = stickers[sticker.index];
    return button;
  });
}

const colorInput = document.createElement("input");
colorInput.type = "color";
colorInput.value = tool.color;
document.body.append(colorInput);

colorInput.addEventListener("input", (event: Event) => {
  currentMode = "marker";
  const target = event.target as HTMLInputElement;
  tool.color = target.value;
});
