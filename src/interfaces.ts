export interface Command {
  execute(): void;
}

export interface Point {
  x: number;
  y: number;
}

export interface Tool {
  color: string;
  strokeSize: number;
}

export interface StickerTool {
  emoji: string;
}
