import { Container, Graphics, Rectangle } from "pixi.js";
import { Binder, Driver, Memo, Middleware } from "polymatic";

import { type MainContext } from "./Main";
import { type Cell } from "./Board";
import { type FrameLoopEvent } from "./FrameLoop";
import { TransitionManager, type TransitionSelection } from "@piqnt/transition";

// the smaller screen dimension is fitted to this many scene units
const VIEWBOX_WIDTH = 50;
const VIEWBOX_HEIGHT = 50;

const BOARD_SIZE = 30;
const CELL_SIZE = 10;

export class Terminal extends Middleware<MainContext> {
  board: Container;
  transitionManager = new TransitionManager();

  constructor() {
    super();
    this.on("pixi-ready", this.handlePixiReady);
    this.on("deactivate", this.handleDeactivate);
    this.on("game-end", this.handleEnd);
    this.on("frame-render", this.handleFrameRender);
  }

  handlePixiReady = () => {
    const pixi = this.context.pixi;
    pixi.renderer.on("resize", this.handleViewport);
    this.handleViewport();

    // board is centered on the scene origin
    this.board = new Container();
    this.board.addChild(drawBoard());
    this.context.scene.addChild(this.board);
  };

  handleDeactivate = () => {
    this.context.pixi?.renderer.off("resize", this.handleViewport);
  };

  /**
   * Fit the viewbox inside the screen, and center scene origin on the screen.
   */
  handleViewport = () => {
    const pixi = this.context.pixi;
    const scene = this.context.scene;

    const screenWidth = pixi.screen.width;
    const screenHeight = pixi.screen.height;

    const scale = Math.min(screenWidth / VIEWBOX_WIDTH, screenHeight / VIEWBOX_HEIGHT);
    scene.scale.set(scale);
    scene.position.set(screenWidth / 2, screenHeight / 2);
  };

  handleEnd = (result: any) => {
    console.log("game-end", result);
  };

  handleFrameRender = (ev: FrameLoopEvent) => {
    if (!this.board) return;
    this.binder.data(this.context.cells?.flat());
    this.transitionManager.update(ev.dt);
  };

  driver = Driver.create<Cell, CellComponent>({
    filter: (cell) => true,
    enter: (cell) => {
      const component = new CellComponent();
      component.transition = this.transitionManager.select(component);
      this.board.addChild(component);
      component.position.set(cell.i * CELL_SIZE - BOARD_SIZE / 2 + CELL_SIZE / 2, cell.j * CELL_SIZE - BOARD_SIZE / 2 + CELL_SIZE / 2);
      component.on("pointertap", () => {
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
      component.transition.stop();
      component.removeFromParent();
      component.destroy({ children: true });
    },
  });

  binder = Binder.create<Cell>({
    key: (obj) => obj.j + "," + obj.i,
    drivers: [this.driver],
  });
}

class CellComponent extends Container {
  stateMemo = Memo.init();
  // selection of this component in the transition manager
  transition: TransitionSelection<Container>;

  xMark = drawXMark();
  oMark = drawOMark();

  constructor() {
    super();
    this.addChild(this.xMark);
    this.addChild(this.oMark);
    this.xMark.visible = false;
    this.oMark.visible = false;

    // clickable over the entire cell, not just the mark
    this.eventMode = "static";
    this.cursor = "pointer";
    this.hitArea = new Rectangle(-CELL_SIZE / 2, -CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);
  }

  setState(cell: Cell) {
    if (this.stateMemo.update(cell.sign, cell.match)) {
      this.xMark.visible = cell.sign === "x";
      this.oMark.visible = cell.sign === "o";
      if (!cell.match) {
        this.transition.stop();
        this.alpha = 0.8;
        this.scale.set(1);
      } else {
        this.transition.tween(200).to({ alpha: 1, scale: { x: 1.2, y: 1.2 } });
      }
    }
  }
}

function drawBoard() {
  const half = BOARD_SIZE / 2;
  const inset = 1;
  const graphics = new Graphics();
  for (let k = 1; k < 3; k++) {
    const p = k * CELL_SIZE - half;
    graphics.moveTo(p, -half + inset).lineTo(p, half - inset);
    graphics.moveTo(-half + inset, p).lineTo(half - inset, p);
  }
  graphics.stroke({ width: 0.3, color: 0x999999, cap: "round" });
  return graphics;
}

function drawXMark() {
  return new Graphics()
    .moveTo(-3, -3)
    .lineTo(3, 3)
    .moveTo(-3, 3)
    .lineTo(3, -3)
    .stroke({ width: 0.5, color: 0x000000, cap: "round" });
}

function drawOMark() {
  return new Graphics().circle(0, 0, 3).stroke({ width: 0.5, color: 0x000000 });
}
