import * as Stage from "stage-js";

import { Middleware } from "polymatic";

import { type MainContext } from "./Main";

// todo: in stage, allow texture in atlas
// todo: in stage, why need to set size in advance?
export class Loader extends Middleware<MainContext> {
  constructor() {
    super();
    this.on("activate", this.handleActivate);
  }

  handleActivate = async () => {
    const board = Stage.canvas();
    board.setDrawer(function () {
      const ratio = this.getDevicePixelRatio();
      const ctx = this.getContext();
      this.setSize(30, 30, ratio);
      ctx.scale(ratio, ratio);
      ctx.moveTo(10, 1);
      ctx.lineTo(10, 29);
      ctx.moveTo(20, 1);
      ctx.lineTo(20, 29);
      ctx.moveTo(1, 10);
      ctx.lineTo(29, 10);
      ctx.moveTo(1, 20);
      ctx.lineTo(29, 20);
      ctx.lineWidth = 0.3;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#999";
      ctx.stroke();
    });

    const xMark = Stage.canvas();
    xMark.setSize(10, 10);
    xMark.setDrawer(function () {
      const ratio = this.getDevicePixelRatio();
      const ctx = this.getContext();
      this.setSize(10, 10, ratio);
      ctx.scale(ratio, ratio);
      ctx.moveTo(2, 2);
      ctx.lineTo(8, 8);
      ctx.moveTo(2, 8);
      ctx.lineTo(8, 2);
      ctx.lineWidth = 0.5;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000";
      ctx.stroke();
    });

    const oMark = Stage.canvas();
    oMark.setSize(10, 10);
    oMark.setDrawer(function () {
      const ratio = this.getDevicePixelRatio();
      const ctx = this.getContext();
      this.setSize(10, 10, ratio);
      ctx.scale(ratio, ratio);
      ctx.arc(5, 5, 3, 0, 2 * Math.PI);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "#000";
      ctx.stroke();
    });

    const noMark = Stage.canvas();
    noMark.setSize(10, 10);
    noMark.setDrawer(function () {
      const ratio = this.getDevicePixelRatio();
      const ctx = this.getContext();
      this.setSize(10, 10, ratio);
    });

    await Stage.atlas({
      textures: {
        "board": board,
        "x-mark": xMark,
        "o-mark": oMark,
        "no-mark": noMark,
      },
    });

    const stage = Stage.mount();
    this.setContext((context) => {
      context.stage = stage;
    });
    this.emit("stage-ready");
  };
}
