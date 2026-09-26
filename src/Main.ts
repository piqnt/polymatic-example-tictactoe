import { type Application, type Container } from "pixi.js";

import { Middleware } from "polymatic";
import { PixiManager } from "./PixiManager";
import { Terminal } from "./Terminal";
import { Board, type Cell } from "./Board";
import { FrameLoop } from "./FrameLoop";

export interface MainContext {
  pixi?: Application;
  scene?: Container;
  cells?: Cell[][];
  turn?: number;
}

export class Main extends Middleware<MainContext> {
  constructor() {
    super();
    this.use(new FrameLoop());
    this.use(new PixiManager());
    this.use(new Terminal());
    this.use(new Board());
  }
}
