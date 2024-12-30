import { Graphics } from "pixi.js";
import { game } from "./game";

export class EffectsManager {
    blackBars: Graphics;
    graphics: Graphics;

    constructor() {
        this.blackBars = new Graphics();
        this.graphics = new Graphics();
        game.temporaryContainer.addChild(this.blackBars);
        game.temporaryContainer.addChild(this.graphics);
    }

    update(dt: number) {
        this.blackBars.clear();
        this.graphics.clear();
        this.blackBarsRatio = this.blackBarsRatio * 0.9 + this.targetBlackBarsRatio * 0.1;
        if (this.blackBarsRatio > 0) this.handleBlackBars(dt);
        if (this.inTimewarp) this.handleTimewarp(dt);
        if (this.inFadeout) this.handleFadeout(dt);
    }

    blackBarsRatio = 0;

    targetBlackBarsRatio = 0;

    setBars(ratio: number) {
        this.targetBlackBarsRatio = ratio;
    }
    handleBlackBars(dt: number) {
        this.blackBars.rotation = -0.1;

        const offset = (this.blackBarsRatio * game.app.screen.height) / 4;
        this.blackBars.rect(-game.app.screen.width, -1000 + offset, game.app.screen.width * 2, 1000);
        this.blackBars.fill(0x000000);
        this.blackBars.rect(-game.app.screen.width, game.app.screen.height + 200 - offset, game.app.screen.width * 2, 1000);
        this.blackBars.fill(0x000000);
    }

    timewarpProgress = 0;
    inTimewarp = false;

    startTimewarp() {
        this.inTimewarp = true;
        this.timewarpProgress = 0;
        game.soundManager.play("ticking");
    }

    handleTimewarp(dt: number) {
        this.timewarpProgress += dt / 1000;

        if (this.timewarpProgress > 1) {
            this.inTimewarp = false;
            this.timewarpProgress = 0;
            return;
        }

        this.graphics.rect(this.timewarpProgress * game.app.screen.width * 3 - game.app.screen.width, 0, game.app.screen.width, game.app.screen.height);
        this.graphics.fill({
            color: 0xffffff,
            alpha: (0.5 - Math.abs(0.5 - this.timewarpProgress)) * 2,
        });
    }

    fadeoutProgress = 0;
    inFadeout = false;
    fadeout() {
        this.inFadeout = true;
        this.fadeoutProgress = 0;
    }

    handleFadeout(dt: number) {
        this.fadeoutProgress += dt / 1000;

        if (this.fadeoutProgress > 1) {
            this.inFadeout = false;
            this.fadeoutProgress = 0;
            return;
        }

        this.graphics.rect(0, 0, game.app.screen.width, game.app.screen.height);
        this.graphics.fill({
            color: 0x000000,
            alpha: Math.min(this.fadeoutProgress * 1.5, 1),
        });
    }

    victory() {
        
    }
}
