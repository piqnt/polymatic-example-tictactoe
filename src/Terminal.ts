import * as Stage from "stage-js";
import { Binder, Driver, Memo, Middleware } from "polymatic";

import { type MainContext } from "./Main";
import { type Cell } from "./Board";

export class Terminal extends Middleware<MainContext> {
  board: Stage.Sprite;

  constructor() {
    super();
    this.on("stage-ready", this.handleStageReady);
    this.on("game-end", this.handleEnd);
    this.on("frame-render", this.handleFrameRender);
  }

  handleStageReady = () => {
    const stage = this.context.stage;
    stage.viewbox(50, 50);
    stage.pin("handle", -0.5);

    this.board = Stage.sprite("board");
    this.board.size(30, 30);
    this.board.pin("handle", 0.5);
    this.board.appendTo(stage);
  };

  handleEnd = (result: any) => {
    console.log("game-end", result);
  };

  handleFrameRender = () => {
    this.binder.data(this.context.cells?.flat());
  };

  driver = Driver.create<Cell, CellComponent>({
    filter: (cell) => true,
    enter: (cell) => {
      const component = new CellComponent();
      component.appendTo(this.board);
      component.pin({
        offsetX: cell.i * 10 + 5,
        offsetY: cell.j * 10 + 5,
        handle: 0.5
      });
      component.on("click", () => {
        if (this.context.turn >= 0 && this.context.turn < 9) {
          this.emit("user-click", cell);
        } else {
          this.emit("user-start", cell);
        }
      });
      return component;
    },
    update: (cell, component) => {
      component.setState(cell);
    },
    exit: (cell, component) => {
      component.remove();
    },
  });

  binder = Binder.create<Cell>({
    key: (obj) => obj.j + "," + obj.i,
    drivers: [this.driver],
  });
}

class CellComponent extends Stage.Sprite {
  stateMemo = Memo.init();

  constructor() {
    super();
    this.texture("no-mark");
  }

  setState(cell: Cell) {
    if (this.stateMemo.update(cell.sign, cell.match)) {
      this.texture(cell.sign ? cell.sign + "-mark" : "no-mark");
      if (!cell.match) {
        this.pin({ alpha: 0.8, scale: 1 });
      } else {
        this.tween(200).pin({ alpha: 1, scale: 1.2 });
      }
    }
  }
}
