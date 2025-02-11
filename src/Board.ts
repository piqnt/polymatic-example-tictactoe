import { Middleware } from "polymatic";

import { type MainContext } from "./Main";

export interface Cell {
  i: number;
  j: number;
  sign?: string;
  match?: boolean;
}

export class Board extends Middleware<MainContext> {
  constructor() {
    super();
    this.on("activate", this.handleActivate);
    this.on("user-start", this.handleStart);
    this.on("user-click", this.handleClick);
  }

  handleActivate = () => {
    this.context.cells = [];
    this.context.turn = 0;
    for (let i = 0; i <= 2; i++) {
      this.context.cells[i] = [];
      for (let j = 0; j <= 2; j++) {
        const cell = { i: i, j: j };
        this.context.cells[i][j] = cell;
      }
    }
  };

  handleStart = () => {
    this.context.turn = 0;
    for (let i = 0; i <= 2; i++) {
      for (let j = 0; j <= 2; j++) {
        const cell = this.context.cells[i][j];
        cell.sign = null;
        cell.match = false;
      }
    }
  };

  handleClick = (cell: Cell) => {
    if (this.context.turn < 0) return;
    // already taken
    if (cell.sign) return;
    cell.sign = this.context.turn++ % 2 == 0 ? "o" : "x";

    const matchRow = this.matchBoard(cell.i, cell.j, cell.sign);
    if (matchRow) {
      this.context.turn = -1;
      for (let i = 0; i < matchRow.length; i++) {
        matchRow[i].match = true;
      }
      this.emit("game-end", { winner: cell.sign });
    } else if (this.context.turn >= 9) {
      this.context.turn = -1;
      this.emit("game-end", {});
    }
  };

  matchBoard = (i: number, j: number, sign: string) => {
    const cells = this.context.cells;

    if (cells[0][j].sign == sign && cells[1][j].sign == sign && cells[2][j].sign == sign)
      return [cells[0][j], cells[1][j], cells[2][j]];
    if (cells[i][0].sign == sign && cells[i][1].sign == sign && cells[i][2].sign == sign)
      return [cells[i][0], cells[i][1], cells[i][2]];
    if (i == j && cells[0][0].sign == sign && cells[1][1].sign == sign && cells[2][2].sign == sign)
      return [cells[0][0], cells[1][1], cells[2][2]];
    if (i + j == 2 && cells[0][2].sign == sign && cells[1][1].sign == sign && cells[2][0].sign == sign)
      return [cells[0][2], cells[1][1], cells[2][0]];
  };
}
