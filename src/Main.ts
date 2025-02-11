import * as Stage from "stage-js";

import { Middleware } from "polymatic";
import { Loader } from "./Loader";
import { Terminal } from "./Terminal";
import { Board, type Cell } from "./Board";
import { FrameLoop } from "./FrameLoop";

export interface MainContext {
  stage?: Stage.Root;
  cells?: Cell[][];
  turn?: number;
}

export class Main extends Middleware<MainContext> {
  constructor() {
    super();
    this.use(new FrameLoop());
    this.use(new Loader());
    this.use(new Terminal());
    this.use(new Board());
  }
}
