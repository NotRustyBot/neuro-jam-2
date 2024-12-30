import { Graphics, Text } from "pixi.js";
import { game } from "./game";

export class EffectsManager {
    blackBars: Graphics;
    graphics: Graphics;
    subtitles: Text;

    constructor() {
        this.blackBars = new Graphics();
        this.graphics = new Graphics();
        game.temporaryContainer.addChild(this.blackBars);
        game.temporaryContainer.addChild(this.graphics);
        this.subtitles = new Text({ text: "", style: { fontFamily: "FunnelDisplay", fontSize: 20, fill: 0xffffff } });
        game.temporaryContainer.addChild(this.subtitles);
    }

    update(dt: number) {
        this.blackBars.clear();
        this.graphics.clear();
        this.blackBarsRatio = this.blackBarsRatio * 0.9 + this.targetBlackBarsRatio * 0.1;
        if (this.blackBarsRatio > 0) this.handleBlackBars(dt);
        if (this.inTimewarp) this.handleTimewarp(dt);
        if (this.inFadeout) this.handleFadeout(dt);
        if (this.isVictory) this.handleVictory(dt);
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

    isVictory = false;
    victoryProgress = 0;
    outroLineIndex = 0;
    victory() {
        this.isVictory = true;
        this.victoryProgress = 0;
        game.buttonContainer.visible = false;
    }

    handleVictory(dt: number) {
        this.victoryProgress += dt / 1000;

        this.graphics.rect(0, 0, game.app.screen.width, game.app.screen.height);
        this.graphics.fill({
            color: 0x000000,
        });

        if (this.victoryProgress > 1 + outroLines[this.outroLineIndex].length * 0.1) {
            if (this.outroLineIndex + 1 < outroLines.length) this.outroLineIndex++;
        }

        this.subtitles.anchor.set(0.5, 0.5);
        this.subtitles.position.set(game.app.screen.width / 2, game.app.screen.height - 200);
        this.subtitles.text = outroLines[this.outroLineIndex];
    }
}

const introLines = [
    `A long time ago, the Turtle Empire ruled the world, with an army of monsters they conjured.`,
    `Their rule lasted a thousand years, until humans managed to seal them away, with a help of a powerful magical Artefact.`,
    `After millennia, the Remnants of the Turtle Empire managed to break free, shattering the Artefact across the treads of time.`,
    `Now you need to defeat the Remnants of the Turtle empire, both in the past, and in the future, or humanity will serve under their reign once more.`,
];

const outroLines = [``, `As the last of Remnants of the Turtle Empire are defeated, and Artefact pieces recombined, the threads of time fall back into their rightful places.`, `Now, you may rest.`, ``];
